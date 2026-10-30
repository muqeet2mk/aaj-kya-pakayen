import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { LibraryView } from './components/library/LibraryView';
import { CalendarView } from './components/calendar/CalendarView';
import { NutritionReportView } from './components/reports/NutritionReportView';
import { SettingsView } from './components/settings/SettingsView';
import { SmartPickModal } from './components/modes/SmartPickModal';
import { RandomWheelModal } from './components/modes/RandomWheelModal';
import { TryNewModal } from './components/modes/TryNewModal';
import { OccasionModal } from './components/modes/OccasionModal';
import { DishFormModal } from './components/library/DishFormModal';
import { RecipeDetailModal } from './components/library/RecipeDetailModal';
import { QuickStarterModal } from './components/library/QuickStarterModal';
import { ToastContainer } from './components/common/Toast';
import { Dish } from './types';

const MainApp: React.FC = () => {
  const { activeTab, preferences, library } = useApp();

  // Modals state
  const [isSmartPickOpen, setIsSmartPickOpen] = useState(false);
  const [isRandomWheelOpen, setIsRandomWheelOpen] = useState(false);
  const [isTryNewOpen, setIsTryNewOpen] = useState(false);
  const [isOccasionOpen, setIsOccasionOpen] = useState(false);
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [isQuickStarterOpen, setIsQuickStarterOpen] = useState(false);
  const [dishToEdit, setDishToEdit] = useState<Dish | null>(null);
  const [initialFormCategory, setInitialFormCategory] = useState<string | undefined>(undefined);
  const [recipeDetailDishId, setRecipeDetailDishId] = useState<string | null>(null);

  const handleOpenAddModal = (initialCategory?: string) => {
    setDishToEdit(null);
    setInitialFormCategory(initialCategory);
    setIsDishFormOpen(true);
  };

  const handleOpenEditModal = (dish: Dish) => {
    setDishToEdit(dish);
    setInitialFormCategory(dish.category);
    setIsDishFormOpen(true);
  };

  const handleOpenRecipeDetail = (dishId: string) => {
    setRecipeDetailDishId(dishId);
  };

  const isRtl = preferences.language === 'ur';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#FAF7F2] text-[#231E1B] antialiased selection:bg-[#BD5338] selection:text-white ${
        isRtl ? 'font-urdu' : ''
      }`}
    >
      {/* Top Header */}
      <Header onOpenAddModal={() => handleOpenAddModal()} />

      {/* Main View Body */}
      <main className="w-full">
        {activeTab === 'home' && (
          <Dashboard
            onOpenSmartPick={() => setIsSmartPickOpen(true)}
            onOpenRandomWheel={() => setIsRandomWheelOpen(true)}
            onOpenTryNew={() => setIsTryNewOpen(true)}
            onOpenOccasion={() => setIsOccasionOpen(true)}
            onOpenAddDish={() => handleOpenAddModal()}
            onOpenQuickStarter={() => setIsQuickStarterOpen(true)}
            onOpenRecipeDetail={handleOpenRecipeDetail}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            onOpenAddModal={() => handleOpenAddModal()}
            onOpenEditModal={handleOpenEditModal}
            onOpenRecipeDetail={handleOpenRecipeDetail}
            onOpenQuickStarter={() => setIsQuickStarterOpen(true)}
          />
        )}

        {activeTab === 'calendar' && <CalendarView />}

        {activeTab === 'reports' && <NutritionReportView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Dedicated Mode Modals */}
      <SmartPickModal
        isOpen={isSmartPickOpen}
        onClose={() => setIsSmartPickOpen(false)}
        onViewRecipe={handleOpenRecipeDetail}
        onOpenAddDish={() => {
          setIsSmartPickOpen(false);
          handleOpenAddModal();
        }}
      />

      <RandomWheelModal
        isOpen={isRandomWheelOpen}
        onClose={() => setIsRandomWheelOpen(false)}
        onViewRecipe={handleOpenRecipeDetail}
        onOpenAddDish={() => {
          setIsRandomWheelOpen(false);
          handleOpenAddModal();
        }}
      />

      <TryNewModal
        isOpen={isTryNewOpen}
        onClose={() => setIsTryNewOpen(false)}
        onViewRecipe={handleOpenRecipeDetail}
        onOpenAddDish={() => {
          setIsTryNewOpen(false);
          handleOpenAddModal();
        }}
      />

      <OccasionModal
        isOpen={isOccasionOpen}
        onClose={() => setIsOccasionOpen(false)}
        onOpenAddDishForCategory={(cat) => handleOpenAddModal(cat)}
        onOpenAddDish={() => {
          setIsOccasionOpen(false);
          handleOpenAddModal();
        }}
      />

      {/* Dish Add/Edit Form Modal */}
      <DishFormModal
        isOpen={isDishFormOpen}
        onClose={() => setIsDishFormOpen(false)}
        dishToEdit={dishToEdit}
        initialCategory={initialFormCategory}
      />

      {/* Quick Starter Dish Selection Modal */}
      <QuickStarterModal
        isOpen={isQuickStarterOpen}
        onClose={() => setIsQuickStarterOpen(false)}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        dishId={recipeDetailDishId}
        onClose={() => setRecipeDetailDishId(null)}
        onEdit={(id) => {
          const d = library.find(item => item.id === id);
          if (d) handleOpenEditModal(d);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
