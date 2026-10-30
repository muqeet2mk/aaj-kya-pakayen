import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateNutritionReport } from '../../services/recommendationEngine';
import { PieChart, TrendingUp, CheckCircle, AlertCircle, Info, Sparkles, Utensils, Heart } from 'lucide-react';

export const NutritionReportView: React.FC = () => {
  const { library, mealHistory, t, preferences } = useApp();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const report = useMemo(() => {
    return calculateNutritionReport(library, mealHistory, timeframe);
  }, [library, mealHistory, timeframe]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Title & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#231E1B]">
            {t.reports.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#786F68] mt-1">
            {t.reports.subtitle}
          </p>
        </div>

        {/* Segmented Timeframe Switcher */}
        <div className="flex items-center rounded-xl border border-[#DCD5C9] bg-white p-0.5 self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timeframe === 'weekly' ? 'bg-[#BD5338] text-white shadow-xs' : 'text-[#786F68] hover:text-[#231E1B]'
            }`}
          >
            {t.reports.weeklyTab}
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timeframe === 'monthly' ? 'bg-[#BD5338] text-white shadow-xs' : 'text-[#786F68] hover:text-[#231E1B]'
            }`}
          >
            {t.reports.monthlyTab}
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-bold text-[#786F68] uppercase tracking-wider block">
            {t.reports.totalMeals}
          </span>
          <div className="text-2xl font-bold text-[#231E1B] mt-1 font-mono tabular-nums">
            {report.totalMealsRecorded}
          </div>
          <span className="text-[11px] text-[#786F68] mt-0.5 block">Recorded cooked</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-bold text-[#786F68] uppercase tracking-wider block">
            {t.reports.uniqueDishes}
          </span>
          <div className="text-2xl font-bold text-[#231E1B] mt-1 font-mono tabular-nums">
            {report.uniqueDishesCount}
          </div>
          <span className="text-[11px] text-[#786F68] mt-0.5 block">Different recipes</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-bold text-[#786F68] uppercase tracking-wider block">
            {t.reports.varietyScore}
          </span>
          <div className="text-2xl font-bold text-[#557A66] mt-1 font-mono tabular-nums">
            {report.varietyScorePercent}%
          </div>
          <span className="text-[11px] text-[#557A66] mt-0.5 block">Rotation health</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-bold text-[#786F68] uppercase tracking-wider block">
            {t.reports.repeatedDishes}
          </span>
          <div className="text-2xl font-bold text-[#D97706] mt-1 font-mono tabular-nums">
            {report.repeatedMealsCount}
          </div>
          <span className="text-[11px] text-[#786F68] mt-0.5 block">Cooked &gt;1 time</span>
        </div>
      </div>

      {/* Main Grid: Category Distribution & Nutritional Presence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Category Distribution & Frequent Dishes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Distribution Bar */}
          <div className="p-5 rounded-3xl bg-white border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#231E1B]">
                {t.reports.categoryDistribution}
              </h3>
              <span className="text-xs text-[#786F68]">
                {report.startDate} to {report.endDate}
              </span>
            </div>

            {report.categoryDistribution.length === 0 ? (
              <p className="text-xs text-[#786F68] italic py-4">
                {t.reports.insufficientData}
              </p>
            ) : (
              <div className="space-y-3">
                {/* Horizontal Multi-colored Segmented Bar */}
                <div className="w-full h-3 rounded-full bg-[#EFEAE2] flex overflow-hidden">
                  {report.categoryDistribution.map(cat => (
                    <div
                      key={cat.category}
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                      title={`${cat.category}: ${cat.percentage}%`}
                    />
                  ))}
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {report.categoryDistribution.map(cat => (
                    <div key={cat.category} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[#5C534E] truncate">{cat.category}</span>
                      <span className="font-semibold text-[#231E1B] ml-auto font-mono tabular-nums">
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Most & Least Frequent Dishes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Most Frequent */}
            <div className="p-4.5 rounded-3xl bg-white border border-[#E8E2D9] shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#231E1B] uppercase tracking-wider">
                {t.reports.frequentDishes}
              </h4>
              {report.mostFrequentDishes.length === 0 ? (
                <p className="text-xs text-[#786F68] italic">No meals logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {report.mostFrequentDishes.map((dish, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[#231E1B] font-medium truncate">{dish.name}</span>
                      <span className="text-[#786F68] font-mono tabular-nums shrink-0 ml-2">
                        {dish.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Highlights */}
            <div className="p-4.5 rounded-3xl bg-white border border-[#E8E2D9] shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#231E1B] uppercase tracking-wider">
                {t.reports.nutritionHighlights}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#5C534E]">{t.reports.proteinNotice}</span>
                  <span className="font-bold text-[#231E1B] font-mono tabular-nums">{report.proteinRichCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5C534E]">{t.reports.veggieNotice}</span>
                  <span className="font-bold text-[#16A34A] font-mono tabular-nums">{report.vegetableCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5C534E]">{t.reports.lentilNotice}</span>
                  <span className="font-bold text-[#D97706] font-mono tabular-nums">{report.lentilCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5C534E]">{t.reports.riceNotice}</span>
                  <span className="font-bold text-[#231E1B] font-mono tabular-nums">{report.riceGrainCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Friendly AI Observations & Actionable Family Suggestions */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Observations Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-[#F7F3EC] border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#BD5338]" />
              <h3 className="text-base font-bold text-[#231E1B]">
                {t.reports.aiObservationsTitle}
              </h3>
            </div>

            <div className="space-y-2.5">
              {report.observations.map((obs, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#4A423D] leading-relaxed">
                  <CheckCircle className="w-3.5 h-3.5 text-[#557A66] shrink-0 mt-0.5" />
                  <span>{obs}</span>
                </div>
              ))}
            </div>

            {report.actionableSuggestions.length > 0 && (
              <div className="pt-3 border-t border-[#E8E2D9] space-y-2">
                <span className="text-[11px] font-bold text-[#BD5338] uppercase tracking-wider block">
                  {t.reports.familyTipsTitle}
                </span>
                {report.actionableSuggestions.map((sug, i) => (
                  <p key={i} className="text-xs text-[#5C534E] leading-relaxed">
                    💡 {sug}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Honest Nutritional Disclaimer (Mandatory from Section 10) */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-start gap-2.5 text-xs text-[#786F68]">
            <Info className="w-4 h-4 text-[#786F68] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.reports.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
