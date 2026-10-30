import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, Plus, BookOpen, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickStarterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StarterOption {
  name: string;
  nameUrdu: string;
  category: string;
  prepTimeMinutes: number;
}

const COMMON_FAMILY_DISHES: StarterOption[] = [
  { name: 'Chicken Biryani', nameUrdu: 'چکن بریانی', category: 'Rice Dishes', prepTimeMinutes: 55 },
  { name: 'Chicken Karahi', nameUrdu: 'چکن کڑاہی', category: 'Curry and Gravy', prepTimeMinutes: 35 },
  { name: 'Tadka Daal & Rice', nameUrdu: 'تڑکا دال چاول', category: 'Lentils', prepTimeMinutes: 30 },
  { name: 'Aloo Gosht', nameUrdu: 'آلو گوشت', category: 'Main Course', prepTimeMinutes: 50 },
  { name: 'Palak Paneer', nameUrdu: 'پالک پنیر', category: 'Vegetables', prepTimeMinutes: 35 },
  { name: 'Beef Chapli Kabab', nameUrdu: 'بیف چپلی کباب', category: 'Main Course', prepTimeMinutes: 40 },
  { name: 'Bhindi Masala (Okra)', nameUrdu: 'بھنڈی مصالحہ', category: 'Vegetables', prepTimeMinutes: 25 },
  { name: 'Daal Mash Fry', nameUrdu: 'دال ماش فرائی', category: 'Lentils', prepTimeMinutes: 35 },
  { name: 'Beef Yakhni Pulao', nameUrdu: 'بیف یخنی پلاؤ', category: 'Rice Dishes', prepTimeMinutes: 60 },
  { name: 'Chicken Roast & Potatoes', nameUrdu: 'چکن روسٹ', category: 'Main Course', prepTimeMinutes: 45 },
  { name: 'Traditional Rice Kheer', nameUrdu: 'روایتی کھیر', category: 'Desserts', prepTimeMinutes: 45 },
  { name: 'Fresh Mint Lemonade', nameUrdu: 'پودینہ لیمونیڈ', category: 'Drinks', prepTimeMinutes: 10 },
  { name: 'Aloo Paratha', nameUrdu: 'آلو پراٹھا', category: 'Breakfast', prepTimeMinutes: 25 },
  { name: 'Mint Raita & Salad', nameUrdu: 'رائتہ اور سلاد', category: 'Side Dishes', prepTimeMinutes: 10 },
];

export const QuickStarterModal: React.FC<QuickStarterModalProps> = ({ isOpen, onClose }) => {
  const { library, addMultipleDishes, showToast } = useApp();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  // Filter out any dishes already in the library
  const existingNames = new Set(library.map(d => d.name.toLowerCase()));
  const availableOptions = COMMON_FAMILY_DISHES.filter(d => !existingNames.has(d.name.toLowerCase()));

  const handleToggle = (name: string) => {
    setSelectedNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSelectAll = () => {
    if (selectedNames.length === availableOptions.length) {
      setSelectedNames([]);
    } else {
      setSelectedNames(availableOptions.map(o => o.name));
    }
  };

  const handleAddSelected = () => {
    const toAdd = availableOptions
      .filter(o => selectedNames.includes(o.name))
      .map(o => ({
        name: o.name,
        nameUrdu: o.nameUrdu,
        category: o.category,
        prepTimeMinutes: o.prepTimeMinutes,
        isFavorite: false,
      }));

    if (toAdd.length > 0) {
      addMultipleDishes(toAdd);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#BD5338', '#557A66', '#D97706'],
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#FAF7F2] border-b border-[#E8E2D9] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#231E1B]">Select Dishes You Know How to Cook</h3>
            <p className="text-xs text-[#786F68] mt-0.5">
              Check off the everyday dishes your family enjoys to populate your library instantly:
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#5C534E] hover:text-[#231E1B] hover:bg-[#EAE4DC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-[#F4EFEA] border-b border-[#E8E2D9] flex items-center justify-between text-xs text-[#5C534E]">
          <span>{selectedNames.length} dishes selected</span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="font-semibold text-[#BD5338] hover:underline cursor-pointer"
          >
            {selectedNames.length === availableOptions.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* List of common dishes */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-2">
          {availableOptions.map(option => {
            const isChecked = selectedNames.includes(option.name);
            return (
              <button
                key={option.name}
                type="button"
                onClick={() => handleToggle(option.name)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-white border-[#BD5338] shadow-xs'
                    : 'bg-white/60 border-[#E8E2D9] hover:bg-white text-[#5C534E]'
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#231E1B]">{option.name}</span>
                    <span className="text-xs text-[#786F68] font-urdu">{option.nameUrdu}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#786F68] mt-0.5">
                    <span>{option.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {option.prepTimeMinutes}m
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                    isChecked ? 'bg-[#BD5338] border-[#BD5338] text-white' : 'border-[#DCD5C9] bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E2D9] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#DCD5C9] bg-white text-xs font-semibold text-[#4A423D] hover:bg-[#F7F3EC] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAddSelected}
            disabled={selectedNames.length === 0}
            className={`min-h-[44px] px-6 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              selectedNames.length > 0
                ? 'bg-[#BD5338] hover:bg-[#A9452C] text-white active:scale-95'
                : 'bg-[#DCD5C9] text-[#786F68] cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add {selectedNames.length} Dishes to Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};
