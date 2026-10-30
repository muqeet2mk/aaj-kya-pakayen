import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Sliders, Shield, Download, Upload, Trash2, RotateCcw, Check, User } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { preferences, updatePreferences, resetToDemoData, clearAllData, t, library, mealHistory, plannedMeals, showToast } = useApp();

  const [userName, setUserName] = useState(preferences.userName);
  const [householdName, setHouseholdName] = useState(preferences.householdName);
  const [avoidRecentDays, setAvoidRecentDays] = useState(preferences.avoidRecentDays);
  const [varietyLevel, setVarietyLevel] = useState(preferences.varietyLevel);
  const [dietaryInput, setDietaryInput] = useState(preferences.dietaryPreferences.join(', '));
  const [dislikedInput, setDislikedInput] = useState(preferences.dislikedIngredients.join(', '));
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      userName: userName.trim() || 'Home Cook',
      householdName: householdName.trim() || 'Family',
      avoidRecentDays: Number(avoidRecentDays),
      varietyLevel,
      dietaryPreferences: dietaryInput.split(',').map(s => s.trim()).filter(Boolean),
      dislikedIngredients: dislikedInput.split(',').map(s => s.trim()).filter(Boolean),
    });
    showToast(t.settings.settingsSaved, 'success');
  };

  const handleExportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      preferences,
      library,
      mealHistory,
      plannedMeals,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aaj-kya-pakayen-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cooking library and history downloaded successfully!', 'info');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.library)) {
          localStorage.setItem('aaj_kya_pakayen_library', JSON.stringify(data.library));
          if (Array.isArray(data.mealHistory)) {
            localStorage.setItem('aaj_kya_pakayen_history', JSON.stringify(data.mealHistory));
          }
          if (Array.isArray(data.plannedMeals)) {
            localStorage.setItem('aaj_kya_pakayen_planned', JSON.stringify(data.plannedMeals));
          }
          if (data.preferences) {
            localStorage.setItem('aaj_kya_pakayen_preferences', JSON.stringify(data.preferences));
          }
          window.location.reload();
        } else {
          showToast('Invalid backup file format.', 'warning');
        }
      } catch (err) {
        showToast('Error reading backup file.', 'warning');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#231E1B]">
          {t.settings.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#786F68] mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8E2D9]">
            <User className="w-4 h-4 text-[#BD5338]" />
            <h3 className="text-sm font-bold text-[#231E1B]">{t.settings.profileSection}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#231E1B] mb-1">
                {t.settings.userName}
              </label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="e.g. Fatima"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-[#231E1B] focus:ring-2 focus:ring-[#BD5338]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#231E1B] mb-1">
                {t.settings.householdName}
              </label>
              <input
                type="text"
                value={householdName}
                onChange={e => setHouseholdName(e.target.value)}
                placeholder="e.g. Ahmed Family"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-[#231E1B] focus:ring-2 focus:ring-[#BD5338]"
              />
            </div>
          </div>
        </div>

        {/* Language & Recommendation Rules */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8E2D9]">
            <Sliders className="w-4 h-4 text-[#BD5338]" />
            <h3 className="text-sm font-bold text-[#231E1B]">{t.settings.preferencesSection}</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#231E1B] mb-1">
                {t.settings.language}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updatePreferences({ language: 'en' })}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    preferences.language === 'en'
                      ? 'bg-[#BD5338] text-white border-[#BD5338]'
                      : 'bg-white border-[#DCD5C9] text-[#5C534E]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => updatePreferences({ language: 'ur' })}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border font-urdu transition-all cursor-pointer ${
                    preferences.language === 'ur'
                      ? 'bg-[#BD5338] text-white border-[#BD5338]'
                      : 'bg-white border-[#DCD5C9] text-[#5C534E]'
                  }`}
                >
                  اردو (Urdu)
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#231E1B]">
                  {t.settings.avoidDaysLabel}
                </label>
                <span className="font-bold text-[#BD5338] font-mono tabular-nums">
                  {avoidRecentDays} days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={avoidRecentDays}
                onChange={e => setAvoidRecentDays(Number(e.target.value))}
                className="w-full accent-[#BD5338]"
              />
              <p className="text-[11px] text-[#786F68] mt-1">{t.settings.avoidDaysHint}</p>
            </div>

            <div>
              <label className="block font-semibold text-[#231E1B] mb-1">
                {t.settings.varietyLevelLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'familiar', label: 'Familiar Favorites' },
                  { id: 'balanced', label: 'Balanced Variety' },
                  { id: 'high', label: 'Maximum Variety' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setVarietyLevel(opt.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      varietyLevel === opt.id
                        ? 'bg-[#557A66] text-white border-[#557A66] font-semibold'
                        : 'bg-white border-[#DCD5C9] text-[#5C534E]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dietary Preferences & Dislikes */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8E2D9]">
            <Shield className="w-4 h-4 text-[#557A66]" />
            <h3 className="text-sm font-bold text-[#231E1B]">{t.settings.dietarySection}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#231E1B] mb-1">
                {t.settings.dietaryPreferences}
              </label>
              <input
                type="text"
                value={dietaryInput}
                onChange={e => setDietaryInput(e.target.value)}
                placeholder="e.g. Halal, High Protein, Mild Spice"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-[#231E1B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#231E1B] mb-1">
                {t.settings.dislikedFoods}
              </label>
              <input
                type="text"
                value={dislikedInput}
                onChange={e => setDislikedInput(e.target.value)}
                placeholder="e.g. Bitter gourd, Mushrooms"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-[#231E1B]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full min-h-[46px] rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{t.settings.saveSettings}</span>
        </button>
      </form>

      {/* Demonstration Data & Backup Section */}
      <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#231E1B] pb-2 border-b border-[#E8E2D9]">
          {t.settings.demoSection}
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-[#231E1B] block">{t.settings.demoModeLabel}</span>
            <span className="text-[#786F68]">{t.settings.demoModeDesc}</span>
          </div>

          <button
            type="button"
            onClick={resetToDemoData}
            className="px-3.5 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs font-semibold text-[#4A423D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Starter Library</span>
          </button>
        </div>

        {/* Export / Import */}
        <div className="pt-3 border-t border-[#E8E2D9] flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="px-3.5 py-2 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#FAF7F2] text-xs font-medium text-[#4A423D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (.JSON)</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#FAF7F2] text-xs font-medium text-[#4A423D] flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        {/* Danger Zone: Clear Data */}
        <div className="pt-3 border-t border-red-100 flex items-center justify-between">
          <span className="text-xs text-[#786F68]">Start fresh with your own family library</span>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            {t.settings.resetAllData}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-[#E8E2D9]">
            <h4 className="text-base font-bold text-[#231E1B]">Clear All Data?</h4>
            <p className="text-xs text-[#786F68] mt-1.5 leading-relaxed">
              {t.settings.resetConfirm}
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 rounded-xl border border-[#DCD5C9] text-xs font-medium text-[#786F68]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
