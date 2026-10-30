import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SmartPickRecommendation } from '../../types';
import { fetchSmartPickRecommendation } from '../../services/api';
import { Sparkles, Utensils, RefreshCw, X, ThumbsDown, BookOpen, Clock, AlertCircle, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewRecipe: (dishId: string) => void;
  onOpenAddDish: () => void;
}

export const SmartPickModal: React.FC<SmartPickModalProps> = ({
  isOpen,
  onClose,
  onViewRecipe,
  onOpenAddDish,
}) => {
  const { library, mealHistory, preferences, logCompletedMeal, setTodaySelectedMeal, t } = useApp();
  const [recommendation, setRecommendation] = useState<SmartPickRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClose = () => {
    setRecommendation(null);
    setLoading(false);
    setErrorMsg(null);
    onClose();
  };

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
    };
  }, [isOpen]);

  const loadRecommendation = async (rejections: string[]) => {
    if (library.length === 0) {
      setErrorMsg(t.modes.smartPick.emptyWarning);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const rec = await fetchSmartPickRecommendation(
        library,
        mealHistory,
        preferences.avoidRecentDays,
        rejections,
        preferences.language
      );
      setRecommendation(rec);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not pick a dish.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setRejectedIds([]);
      loadRecommendation([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCookToday = () => {
    if (!recommendation) return;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#BD5338', '#557A66', '#D97706'],
    });
    logCompletedMeal(recommendation.dish.id, 'dinner');
    setTodaySelectedMeal(recommendation.dish);
    handleClose();
  };

  const handleShowAnother = () => {
    if (!recommendation) return;
    const nextRejected = [...rejectedIds, recommendation.dish.id];
    setRejectedIds(nextRejected);
    loadRecommendation(nextRejected);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#FAF7F2] border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#BD5338]/10 text-[#BD5338] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#231E1B] leading-tight">
                {t.modes.smartPick.heading}
              </h3>
              <p className="text-xs text-[#786F68]">{t.modes.smartPick.subtitle}</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {library.length === 0 || errorMsg ? (
            <div className="text-center py-8 px-4 w-full max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#BD5338]/10 text-[#BD5338] flex items-center justify-center mx-auto mb-3.5">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-[#231E1B] mb-2">
                Your Cooking Library is Empty
              </h4>
              <p className="text-xs text-[#786F68] leading-relaxed mb-6">
                Smart Pick only selects dishes that exist in your own library. Add dishes you know how to prepare, and your assistant will immediately recommend what to cook today!
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
          ) : loading ? (
            <div className="text-center py-14 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-[#BD5338] animate-spin mb-3" />
              <p className="text-sm font-medium text-[#231E1B]">
                {preferences.language === 'ur' ? 'کھانوں کی تاریخ کا جائزہ لیا جا رہا ہے...' : 'Analyzing your family’s meal history...'}
              </p>
              <p className="text-xs text-[#786F68] mt-1">
                {preferences.language === 'ur' ? 'صرف آپ کی لائبریری سے بہترین انتخاب...' : 'Balancing flavor variety and recency strictly from your library'}
              </p>
            </div>
          ) : recommendation ? (
            <div className="space-y-4">
              {/* Dish Visual & Title Card */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E8E2D9] bg-white shadow-sm">
                {recommendation.dish.imageUrl ? (
                  <div className="relative h-48 w-full bg-[#EFEAE2] overflow-hidden">
                    <img
                      src={recommendation.dish.imageUrl}
                      alt={recommendation.dish.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 text-xs font-medium text-white/90 mb-0.5">
                        <span>{recommendation.dish.category}</span>
                        {recommendation.dish.prepTimeMinutes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {recommendation.dish.prepTimeMinutes} mins
                            </span>
                          </>
                        )}
                      </div>
                      <h4 className="text-xl font-bold leading-tight drop-shadow-sm flex items-center justify-between">
                        <span>{recommendation.dish.name}</span>
                        {recommendation.dish.nameUrdu && (
                          <span className="text-sm font-normal text-white/90 font-urdu">{recommendation.dish.nameUrdu}</span>
                        )}
                      </h4>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 border-b border-[#F0EBE3] bg-gradient-to-br from-[#FFFDF9] to-[#F7F3EC]">
                    <div className="flex items-center gap-2 text-xs text-[#786F68] mb-1">
                      <span>{recommendation.dish.category}</span>
                      {recommendation.dish.prepTimeMinutes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recommendation.dish.prepTimeMinutes} mins
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-[#231E1B]">{recommendation.dish.name}</h4>
                      {recommendation.dish.nameUrdu && (
                        <span className="text-sm text-[#786F68] font-urdu">{recommendation.dish.nameUrdu}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Explanation Body */}
                <div className="p-4 space-y-3 bg-white">
                  <div>
                    <span className="text-[11px] font-bold text-[#BD5338] tracking-wide uppercase">
                      {t.modes.smartPick.whyPicked}
                    </span>
                    <p className="text-xs leading-relaxed text-[#4A423D] mt-0.5">
                      {recommendation.reason}
                    </p>
                  </div>

                  {recommendation.varietyExplanation && (
                    <div className="pt-2 border-t border-[#F2EDE5]">
                      <span className="text-[11px] font-bold text-[#557A66] tracking-wide uppercase">
                        {t.modes.smartPick.varietyNote}
                      </span>
                      <p className="text-xs leading-relaxed text-[#4A423D] mt-0.5">
                        {recommendation.varietyExplanation}
                      </p>
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-[#F2EDE5] flex flex-wrap items-center gap-2 text-xs text-[#786F68]">
                    <span>
                      {recommendation.lastCookedDate
                        ? `${t.modes.smartPick.lastCooked} ${recommendation.lastCookedDate}`
                        : t.modes.smartPick.neverCooked}
                    </span>
                    {recommendation.timesCooked > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{t.modes.smartPick.timesPrepared} {recommendation.timesCooked}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCookToday}
                  className="w-full min-h-[46px] rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#BD5338]/15 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Utensils className="w-4 h-4" />
                  <span>{t.modes.smartPick.cookThisToday}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShowAnother}
                    className="min-h-[42px] px-3 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-[#4A423D] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#786F68]" />
                    <span>{t.modes.smartPick.showAnother}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShowAnother}
                    className="min-h-[42px] px-3 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-[#786F68] hover:text-[#BD5338] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{t.modes.smartPick.notInTheMood}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {recommendation.dish.recipe ? (
                    <button
                      type="button"
                      onClick={() => {
                        onViewRecipe(recommendation.dish.id);
                      }}
                      className="text-xs text-[#557A66] hover:text-[#3B5748] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{preferences.language === 'ur' ? 'ترکیب دیکھیں' : 'View Saved Recipe'}</span>
                    </button>
                  ) : <span />}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs text-[#786F68] hover:text-[#231E1B] font-medium cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
