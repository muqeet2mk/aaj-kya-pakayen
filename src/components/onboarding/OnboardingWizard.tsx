import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UtensilsCrossed, Check, ArrowRight, Sparkles, BookOpen, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const STARTER_PRESETS = [
  { name: 'Chicken Biryani', category: 'Rice Dishes', prepTimeMinutes: 55, nameUrdu: 'چکن بریانی' },
  { name: 'Chicken Karahi', category: 'Curry and Gravy', prepTimeMinutes: 35, nameUrdu: 'چکن کڑاہی' },
  { name: 'Tadka Daal with Rice', category: 'Lentils', prepTimeMinutes: 30, nameUrdu: 'تڑکا دال چاول' },
  { name: 'Aloo Gosht', category: 'Main Course', prepTimeMinutes: 50, nameUrdu: 'آلو گوشت' },
  { name: 'Palak Paneer', category: 'Vegetables', prepTimeMinutes: 35, nameUrdu: 'پالک پنیر' },
  { name: 'Beef Chapli Kabab', category: 'Main Course', prepTimeMinutes: 40, nameUrdu: 'بیف چپلی کباب' },
  { name: 'Traditional Rice Kheer', category: 'Desserts', prepTimeMinutes: 45, nameUrdu: 'روایتی کھیر' },
  { name: 'Fresh Mint Lemonade', category: 'Drinks', prepTimeMinutes: 10, nameUrdu: 'پودینہ لیمونیڈ' },
];

export const OnboardingWizard: React.FC = () => {
  const { preferences, updatePreferences, addDish, library } = useApp();
  const [step, setStep] = useState<number>(1);
  const [selectedDishes, setSelectedDishes] = useState<string[]>(STARTER_PRESETS.map(p => p.name));
  const [userName, setUserName] = useState<string>(preferences.userName || 'Fatima');
  const [avoidDays, setAvoidDays] = useState<number>(3);

  const togglePreset = (name: string) => {
    setSelectedDishes(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleFinish = () => {
    // If library is currently empty, add selected presets
    if (library.length === 0) {
      STARTER_PRESETS.filter(p => selectedDishes.includes(p.name)).forEach(p => {
        addDish({
          name: p.name,
          nameUrdu: p.nameUrdu,
          category: p.category,
          prepTimeMinutes: p.prepTimeMinutes,
          isFavorite: true,
        });
      });
    }

    updatePreferences({
      userName: userName.trim() || 'Home Cook',
      avoidRecentDays: avoidDays,
      hasCompletedOnboarding: true,
    });

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#BD5338', '#557A66', '#D97706'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col">
        {/* Progress bar */}
        <div className="w-full bg-[#EFEAE2] h-1.5 flex">
          <div
            className="bg-[#BD5338] h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#BD5338] text-white flex items-center justify-center mx-auto shadow-md">
              <UtensilsCrossed className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#BD5338] uppercase tracking-wider">
                Personal Family Assistant
              </span>
              <h2 className="text-2xl font-bold text-[#231E1B]">
                Welcome to Aaj Kya Pakayen?
              </h2>
              <p className="text-xs text-[#786F68] max-w-md mx-auto leading-relaxed">
                Designed for mothers and families who already know how to cook wonderful dishes, but struggle every day with the question:
                <strong className="block text-[#231E1B] mt-1 text-sm">"What should we cook today?"</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] text-left text-xs text-[#5C534E] space-y-2">
              <p className="font-semibold text-[#231E1B]">Our Golden Promise:</p>
              <ul className="space-y-1 text-[11px] list-disc pl-4 text-[#786F68]">
                <li>Recommendations are strictly made from dishes <strong>you know how to cook</strong>.</li>
                <li>The AI eliminates repetitive meals and tracks what your family ate.</li>
                <li>Zero complicated recipe clutter or unhelpful generic food ideas.</li>
              </ul>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full min-h-[46px] rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Add Dishes */}
        {step === 2 && (
          <div className="p-7 space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#BD5338] uppercase tracking-wider">Step 2 of 4</span>
              <h3 className="text-lg font-bold text-[#231E1B]">Select Common Household Dishes</h3>
              <p className="text-xs text-[#786F68] mt-0.5">
                Check the dishes your family regularly prepares to populate your library in seconds:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {STARTER_PRESETS.map(preset => {
                const isChecked = selectedDishes.includes(preset.name);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => togglePreset(preset.name)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-white border-[#BD5338] shadow-xs'
                        : 'bg-white/60 border-[#E8E2D9] text-[#786F68]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-[#231E1B] block">{preset.name}</span>
                      <span className="text-[10px] text-[#786F68]">{preset.category}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                        isChecked ? 'bg-[#BD5338] border-[#BD5338] text-white' : 'border-[#DCD5C9]'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#786F68] hover:text-[#231E1B] cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Continue ({selectedDishes.length} selected)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="p-7 space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#BD5338] uppercase tracking-wider">Step 3 of 4</span>
              <h3 className="text-lg font-bold text-[#231E1B]">Family Cooking Preferences</h3>
              <p className="text-xs text-[#786F68] mt-0.5">
                A few quick details so your cooking assistant recommends appropriately:
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#231E1B] mb-1">
                  Your Name / Cook Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-[#231E1B]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#231E1B]">
                    Avoid dishes cooked in the last:
                  </label>
                  <span className="font-bold text-[#BD5338] font-mono tabular-nums">{avoidDays} days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={avoidDays}
                  onChange={e => setAvoidDays(Number(e.target.value))}
                  className="w-full accent-[#BD5338]"
                />
                <p className="text-[10px] text-[#786F68] mt-0.5">
                  Prevents suggesting the same dish two nights in a row.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-[#786F68] hover:text-[#231E1B] cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#557A66]/10 text-[#557A66] flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-[#231E1B]">
                Your Personal Library is Ready!
              </h3>
              <p className="text-xs text-[#786F68] max-w-sm mx-auto leading-relaxed">
                Whenever you ask <strong className="text-[#231E1B]">"Aaj Kya Pakayen?"</strong>, your assistant will help you choose a meal that fits your family's recent history.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full min-h-[46px] rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Go to My Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
