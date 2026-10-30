import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Dish } from '../../types';
import { getDaysSinceLastCooked } from '../../services/recommendationEngine';
import { X, Play, RotateCcw, Utensils, BookOpen, AlertCircle, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RandomWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewRecipe: (dishId: string) => void;
  onOpenAddDish: () => void;
}

const SEGMENT_COLORS = [
  '#C85A32', // Terracotta
  '#5B8266', // Sage Green
  '#D97706', // Warm Amber
  '#3E6B89', // Muted Blue
  '#994D66', // Berry
  '#7A8450', // Olive
  '#B86B38', // Cinnamon
  '#4D7A75', // Sea Green
  '#9C6644', // Warm Cocoa
  '#D4813B', // Saffron
];

export const RandomWheelModal: React.FC<RandomWheelModalProps> = ({
  isOpen,
  onClose,
  onViewRecipe,
  onOpenAddDish,
}) => {
  const { library, mealHistory, preferences, logCompletedMeal, setTodaySelectedMeal, t } = useApp();

  const [avoidRecent, setAvoidRecent] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [spinning, setSpinning] = useState<boolean>(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Safe close handler that halts animations and cleans up state
  const handleClose = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setSpinning(false);
    setSelectedDish(null);
    onClose();
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen]);

  // Filter eligible dishes STRICTLY from the user's personal library
  const eligibleDishes = React.useMemo(() => {
    let list = [...library];
    if (selectedCategory !== 'all') {
      list = list.filter(d => d.category === selectedCategory);
    }
    if (avoidRecent && preferences.avoidRecentDays > 0) {
      list = list.filter(d => {
        const { daysAgo } = getDaysSinceLastCooked(d.id, mealHistory);
        return daysAgo === null || daysAgo >= preferences.avoidRecentDays;
      });
    }
    return list;
  }, [library, selectedCategory, avoidRecent, mealHistory, preferences.avoidRecentDays]);

  const categories = React.useMemo(() => {
    return Array.from(new Set(library.map(d => d.category)));
  }, [library]);

  // Draw wheel on canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    if (eligibleDishes.length === 0) return;

    const sliceAngle = (2 * Math.PI) / eligibleDishes.length;

    eligibleDishes.forEach((dish, index) => {
      const startAngle = angle + index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FAF7F2';
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;

      const displayName = dish.name.length > 15 ? dish.name.substring(0, 14) + '…' : dish.name;
      ctx.fillText(displayName, radius - 18, 4);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FAF7F2';
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#FAF7F2';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#BD5338';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#BD5338';
    ctx.fill();
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedDish(null);
      setSpinning(false);
      // Small timeout ensures canvas has mounted and dimensions exist
      const t = setTimeout(() => {
        drawWheel(currentAngleRef.current);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, eligibleDishes]);

  // Spin physics
  const spinWheel = () => {
    if (spinning || eligibleDishes.length < 2) return;

    setSelectedDish(null);
    setSpinning(true);

    const fullRotations = 5 + Math.random() * 4;
    const randomStopAngle = Math.random() * 2 * Math.PI;
    const targetTotalAngle = currentAngleRef.current + fullRotations * 2 * Math.PI + randomStopAngle;
    const startAngle = currentAngleRef.current;
    const duration = 3800;
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);

      const currentAngle = startAngle + (targetTotalAngle - startAngle) * easedProgress;
      currentAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);

        const sliceAngle = (2 * Math.PI) / eligibleDishes.length;
        const normalizedAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (3 * Math.PI) / 2;
        let relativeAngle = (pointerAngle - normalizedAngle) % (2 * Math.PI);
        if (relativeAngle < 0) relativeAngle += 2 * Math.PI;

        const selectedIndex = Math.floor(relativeAngle / sliceAngle) % eligibleDishes.length;
        const picked = eligibleDishes[selectedIndex];

        setSelectedDish(picked);

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#BD5338', '#557A66', '#D97706'],
        });
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleCookToday = () => {
    if (!selectedDish) return;
    logCompletedMeal(selectedDish.id, 'dinner');
    setTodaySelectedMeal(selectedDish);
    handleClose();
  };

  if (!isOpen) return null;

  const { daysAgo, count } = selectedDish
    ? getDaysSinceLastCooked(selectedDish.id, mealHistory)
    : { daysAgo: null, count: 0 };

  return (
    <div
      onClick={(e) => {
        // Clicking backdrop closes modal
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header with big 44px close button */}
        <div className="px-5 py-4 bg-[#FAF7F2] border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#231E1B] leading-tight">
                {t.modes.randomWheel.heading}
              </h3>
              <p className="text-xs text-[#786F68]">
                {t.modes.randomWheel.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#5C534E] hover:text-[#231E1B] hover:bg-[#EAE4DC] active:bg-[#DFD7CD] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Filters Bar (Only shown if library has dishes) */}
        {library.length >= 2 && (
          <div className="px-5 py-2.5 bg-[#F4EFEA] border-b border-[#E8E2D9] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C534E]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={avoidRecent}
                onChange={e => setAvoidRecent(e.target.checked)}
                className="rounded text-[#BD5338] focus:ring-[#BD5338]"
              />
              <span>{t.modes.randomWheel.avoidRecentLabel}</span>
            </label>

            {categories.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span>{t.modes.randomWheel.filterCategory}</span>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-white border border-[#DCD5C9] rounded-lg px-2 py-1 text-xs text-[#231E1B]"
                >
                  <option value="all">{t.modes.randomWheel.allCategories}</option>
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Wheel Section */}
        <div className="p-6 overflow-y-auto flex flex-col items-center">
          {eligibleDishes.length < 2 ? (
            /* EMPTY OR INSUFFICIENT LIBRARY STATE: EXPLICITLY INFORMS USER ACCORDING TO RULE */
            <div className="text-center py-8 px-4 w-full max-w-md">
              <div className="w-14 h-14 rounded-full bg-[#BD5338]/10 text-[#BD5338] flex items-center justify-center mx-auto mb-3.5">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-[#231E1B] mb-2">
                {library.length === 0
                  ? 'Your Cooking Library is Empty'
                  : 'Need at Least 2 Dishes to Spin'}
              </h4>
              <p className="text-xs text-[#786F68] leading-relaxed mb-6">
                {library.length === 0
                  ? 'The wheel only spins with dishes from your personal cooking library. Add dishes you already know how to cook (e.g. Biryani, Daal, Karahi), and they will immediately appear here on the wheel!'
                  : 'Add one more dish to your library so the wheel has multiple options to choose between.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenAddDish();
                  }}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add a Dish to My Library</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-xs font-semibold text-[#4A423D] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Wheel Container with Pointer */}
              <div className="relative mb-6">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[18px] border-t-[#231E1B] drop-shadow-md" />

                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="rounded-full shadow-lg border-4 border-white"
                />
              </div>

              {/* Spin Button or Selected Dish */}
              {!selectedDish ? (
                <div className="w-full flex flex-col items-center gap-2.5">
                  <button
                    type="button"
                    onClick={spinWheel}
                    disabled={spinning}
                    className={`w-full max-w-xs min-h-[46px] rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      spinning
                        ? 'bg-[#786F68] cursor-not-allowed opacity-80'
                        : 'bg-[#BD5338] hover:bg-[#A9452C] shadow-[#BD5338]/20 active:scale-95'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{spinning ? t.modes.randomWheel.spinning : t.modes.randomWheel.spinButton}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs text-[#786F68] hover:text-[#231E1B] py-1 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* Selected Dish Result Card */
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-3">
                  <div className="p-4.5 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm text-center">
                    <span className="text-[11px] font-bold text-[#BD5338] tracking-wider uppercase">
                      {t.modes.randomWheel.selectedTitle}
                    </span>
                    <h4 className="text-xl font-bold text-[#231E1B] mt-1">{selectedDish.name}</h4>
                    {selectedDish.nameUrdu && (
                      <p className="text-sm text-[#786F68] font-urdu mt-0.5">{selectedDish.nameUrdu}</p>
                    )}

                    <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-[#786F68]">
                      <span>{selectedDish.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {daysAgo === null ? 'Never cooked' : `Last cooked: ${daysAgo}d ago`}
                      </span>
                      {count > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Cooked {count} times</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCookToday}
                      className="min-h-[44px] rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{t.modes.randomWheel.cookThisToday}</span>
                    </button>

                    <button
                      type="button"
                      onClick={spinWheel}
                      className="min-h-[44px] rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-[#4A423D] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.modes.randomWheel.spinAgain}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {selectedDish.recipe ? (
                      <button
                        type="button"
                        onClick={() => onViewRecipe(selectedDish.id)}
                        className="text-xs text-[#557A66] hover:text-[#3B5748] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Saved Recipe</span>
                      </button>
                    ) : <span />}

                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-xs text-[#786F68] hover:text-[#231E1B] font-medium cursor-pointer"
                    >
                      Done / Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
