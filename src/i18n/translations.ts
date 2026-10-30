export type Language = 'en' | 'ur';

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    home: string;
    library: string;
    calendar: string;
    reports: string;
    settings: string;
    addDish: string;
  };
  dashboard: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    greetingNight: string;
    subGreeting: string;
    whatToCookTitle: string;
    whatToCookSubtitle: string;
    todayStatusEmpty: string;
    todayStatusSelected: string;
    markAsCooked: string;
    alreadyCooked: string;
    viewDetails: string;
    recentMealsTitle: string;
    noRecentMeals: string;
    libraryStatsTitle: string;
    totalDishes: string;
    varietySummaryTitle: string;
    varietyHealthy: string;
    demoBanner: string;
    clearDemoData: string;
    loadDemoData: string;
  };
  modes: {
    smartPick: {
      title: string;
      subtitle: string;
      badge: string;
      action: string;
      heading: string;
      whyPicked: string;
      varietyNote: string;
      lastCooked: string;
      neverCooked: string;
      timesPrepared: string;
      cookThisToday: string;
      showAnother: string;
      notInTheMood: string;
      emptyWarning: string;
      addDishesFirst: string;
    };
    randomWheel: {
      title: string;
      subtitle: string;
      action: string;
      heading: string;
      spinButton: string;
      spinning: string;
      selectedTitle: string;
      spinAgain: string;
      cookThisToday: string;
      avoidRecentLabel: string;
      filterCategory: string;
      allCategories: string;
      insufficientDishes: string;
    };
    tryNew: {
      title: string;
      subtitle: string;
      action: string;
      heading: string;
      uncookedTab: string;
      newRecipeTab: string;
      uncookedDesc: string;
      newRecipeDesc: string;
      newRecipeWarning: string;
      addToLibrary: string;
      alreadyAdded: string;
      exploreAnother: string;
      notInterested: string;
      viewRecipe: string;
      ingredients: string;
      instructions: string;
    };
    occasion: {
      title: string;
      subtitle: string;
      action: string;
      heading: string;
      selectOccasion: string;
      guestCount: string;
      mealType: string;
      lunch: string;
      dinner: string;
      mainCourse: string;
      sideDish: string;
      dessert: string;
      drink: string;
      changeItem: string;
      emptyCategoryNotice: string;
      addCategoryDish: string;
      generateMenu: string;
      saveMenu: string;
      addToCalendar: string;
      menuSaved: string;
    };
  };
  library: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    sortBy: string;
    sortName: string;
    sortRecentAdded: string;
    sortMostCooked: string;
    sortLeastCooked: string;
    sortFavorites: string;
    addNewDish: string;
    emptyTitle: string;
    emptySubtitle: string;
    quickAddPrompt: string;
    editDish: string;
    deleteDish: string;
    deleteConfirm: string;
    dishNameLabel: string;
    categoryLabel: string;
    prepTimeLabel: string;
    recipeLabel: string;
    recipeOptional: string;
    ingredientsLabel: string;
    ingredientsHelp: string;
    notesLabel: string;
    imageSelectLabel: string;
    saveDish: string;
    cancel: string;
    cookTodayAction: string;
  };
  calendar: {
    title: string;
    subtitle: string;
    monthView: string;
    weekView: string;
    dayView: string;
    todayButton: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
    completedBadge: string;
    plannedBadge: string;
    logCookedMeal: string;
    planFutureMeal: string;
    noMealsLogged: string;
    markAsCompleted: string;
    deleteEntry: string;
  };
  reports: {
    title: string;
    subtitle: string;
    weeklyTab: string;
    monthlyTab: string;
    totalMeals: string;
    uniqueDishes: string;
    varietyScore: string;
    repeatedDishes: string;
    categoryDistribution: string;
    frequentDishes: string;
    nutritionHighlights: string;
    proteinNotice: string;
    veggieNotice: string;
    lentilNotice: string;
    riceNotice: string;
    aiObservationsTitle: string;
    familyTipsTitle: string;
    disclaimer: string;
    insufficientData: string;
  };
  settings: {
    title: string;
    subtitle: string;
    profileSection: string;
    userName: string;
    householdName: string;
    language: string;
    preferencesSection: string;
    avoidDaysLabel: string;
    avoidDaysHint: string;
    varietyLevelLabel: string;
    dietarySection: string;
    dietaryPreferences: string;
    dislikedFoods: string;
    demoSection: string;
    demoModeLabel: string;
    demoModeDesc: string;
    resetAllData: string;
    resetConfirm: string;
    saveSettings: string;
    settingsSaved: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Aaj Kya Pakayen?',
    tagline: 'The Personal Family Cooking Assistant',
    nav: {
      home: 'Home',
      library: 'My Library',
      calendar: 'Calendar & History',
      reports: 'Nutrition & Reports',
      settings: 'Settings',
      addDish: 'Add Dish',
    },
    dashboard: {
      greetingMorning: 'Subah Bakhair',
      greetingAfternoon: 'Good afternoon',
      greetingEvening: 'Shaam Bakhair',
      greetingNight: 'Shab Bakhair',
      subGreeting: 'Ready to decide what to cook for your family today?',
      whatToCookTitle: 'What Should We Cook Today?',
      whatToCookSubtitle: 'Choose how you want to decide — powered strictly by the dishes in your family library.',
      todayStatusEmpty: 'No meal selected yet for today',
      todayStatusSelected: "Today's meal decided:",
      markAsCooked: 'Mark as Cooked',
      alreadyCooked: 'Cooked & Recorded',
      viewDetails: 'View Details',
      recentMealsTitle: 'Recently Cooked for Family',
      noRecentMeals: 'No meals recorded yet. Cook a dish to start your family food journey!',
      libraryStatsTitle: 'Family Cooking Knowledge',
      totalDishes: 'dishes in your personal library',
      varietySummaryTitle: 'This Week at a Glance',
      varietyHealthy: 'Balanced variety across rice, curries, and lentils',
      demoBanner: 'Demo Mode Active — Exploring sample Pakistani family recipes and past meal history.',
      clearDemoData: 'Clear Sample Data & Start Fresh',
      loadDemoData: 'Load Sample Family Library',
    },
    modes: {
      smartPick: {
        title: 'Smart Pick',
        subtitle: 'Intelligent decision based on recent meals, frequency & balance',
        badge: 'Recommended',
        action: 'Find Today’s Dish',
        heading: 'Today’s Smart Pick for Your Family',
        whyPicked: 'Why this was selected:',
        varietyNote: 'Nutritional & Flavor Variety:',
        lastCooked: 'Last prepared:',
        neverCooked: 'Never cooked yet (from your library!)',
        timesPrepared: 'Times cooked previously:',
        cookThisToday: 'Cook This Today',
        showAnother: 'Show Another Suggestion',
        notInTheMood: 'Not in the mood today',
        emptyWarning: 'Your library is empty. Please add dishes you know how to cook first!',
        addDishesFirst: 'Go to Library',
      },
      randomWheel: {
        title: 'Random Wheel',
        subtitle: 'Spin the wheel for a fun, spontaneous household choice',
        action: 'Spin the Wheel',
        heading: 'Spin the Meal Wheel',
        spinButton: 'SPIN WHEEL',
        spinning: 'Spinning...',
        selectedTitle: 'The Wheel Has Chosen!',
        spinAgain: 'Spin Again',
        cookThisToday: 'Cook This Today',
        avoidRecentLabel: 'Exclude dishes cooked in last 3 days',
        filterCategory: 'Category:',
        allCategories: 'All Library Categories',
        insufficientDishes: 'Need at least 2 dishes in your library to spin the wheel.',
      },
      tryNew: {
        title: 'Try Something New',
        subtitle: 'Uncooked library dishes or discover a matching new recipe',
        action: 'Explore New Ideas',
        heading: 'Try Something Different',
        uncookedTab: 'Uncooked from Library',
        newRecipeTab: 'Explore New Recipe',
        uncookedDesc: 'Dishes already in your personal library that you have not cooked or recorded yet.',
        newRecipeDesc: 'AI recipe matched to your family’s taste preferences. Review before adding to your library.',
        newRecipeWarning: 'NEW RECIPE: This dish will not be recommended in Smart Pick or Random Wheel until you explicitly add it to your library.',
        addToLibrary: 'Add to My Cooking Library',
        alreadyAdded: 'Added to Library ✓',
        exploreAnother: 'Explore Another Dish',
        notInterested: 'Not Interested',
        viewRecipe: 'View Full Recipe',
        ingredients: 'Ingredients',
        instructions: 'Preparation Steps',
      },
      occasion: {
        title: 'Occasion Mode',
        subtitle: 'Guests coming over? Plan a coordinated 4-course feast',
        action: 'Plan Feast Menu',
        heading: 'Guests Coming Over?',
        selectOccasion: 'Occasion Type',
        guestCount: 'Number of Guests',
        mealType: 'Meal Type',
        lunch: 'Lunch',
        dinner: 'Dinner',
        mainCourse: '1. Main Course',
        sideDish: '2. Side Dish',
        dessert: '3. Dessert',
        drink: '4. Drink / Beverage',
        changeItem: 'Change This Dish',
        emptyCategoryNotice: 'You haven’t added any dishes to this category yet.',
        addCategoryDish: '+ Add to Library',
        generateMenu: 'Re-generate Balanced Menu',
        saveMenu: 'Save Occasion Menu',
        addToCalendar: 'Add Entire Menu to Calendar',
        menuSaved: 'Occasion menu saved successfully!',
      },
    },
    library: {
      title: 'My Cooking Library',
      subtitle: 'The foundation of your personal assistant — dishes you already know how to prepare.',
      searchPlaceholder: 'Search dishes or ingredients...',
      allCategories: 'All Categories',
      sortBy: 'Sort by:',
      sortName: 'Alphabetical (A-Z)',
      sortRecentAdded: 'Recently Added',
      sortMostCooked: 'Most Frequently Cooked',
      sortLeastCooked: 'Least Recently Cooked',
      sortFavorites: 'Favorites First',
      addNewDish: '+ Add Dish',
      emptyTitle: 'Your Cooking Library is Empty',
      emptySubtitle: 'Add the everyday dishes your family enjoys. The AI will only recommend dishes from this library.',
      quickAddPrompt: 'Quickly Add Common Dishes',
      editDish: 'Edit Dish',
      deleteDish: 'Delete Dish',
      deleteConfirm: 'Are you sure you want to remove this dish from your library?',
      dishNameLabel: 'Dish Name *',
      categoryLabel: 'Category *',
      prepTimeLabel: 'Preparation Time (minutes, optional)',
      recipeLabel: 'Cooking Method / Recipe (optional)',
      recipeOptional: 'Optional — you can add just the name!',
      ingredientsLabel: 'Key Ingredients (comma separated, optional)',
      ingredientsHelp: 'e.g. Chicken, Tomatoes, Ginger, Green chilies',
      notesLabel: 'Family Notes (optional)',
      imageSelectLabel: 'Choose Dish Photo',
      saveDish: 'Save to Library',
      cancel: 'Cancel',
      cookTodayAction: 'Cook Today',
    },
    calendar: {
      title: 'Calendar & Food History',
      subtitle: 'See what your family has eaten over time and plan upcoming meals.',
      monthView: 'Month',
      weekView: 'Week',
      dayView: 'Day',
      todayButton: 'Today',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
      completedBadge: 'Cooked & Eaten',
      plannedBadge: 'Planned Meal',
      logCookedMeal: '+ Log Cooked Meal',
      planFutureMeal: '+ Plan a Meal',
      noMealsLogged: 'No meals recorded for this date.',
      markAsCompleted: 'Mark as Actually Cooked',
      deleteEntry: 'Remove Entry',
    },
    reports: {
      title: 'Nutrition & Eating Habits',
      subtitle: 'Friendly, transparent insights based on your family’s actual recorded meals.',
      weeklyTab: 'Past 7 Days Report',
      monthlyTab: 'Past 30 Days Overview',
      totalMeals: 'Meals Cooked',
      uniqueDishes: 'Unique Dishes',
      varietyScore: 'Variety Score',
      repeatedDishes: 'Repeated Meals',
      categoryDistribution: 'Food Category Breakdown',
      frequentDishes: 'Most Frequently Prepared',
      nutritionHighlights: 'General Nutritional Presence',
      proteinNotice: 'Protein-rich meals (meat, lentils, dairy)',
      veggieNotice: 'Vegetable-centered dishes',
      lentilNotice: 'Lentils & Pulses',
      riceNotice: 'Rice-based dishes',
      aiObservationsTitle: 'Family Eating Observations',
      familyTipsTitle: 'Positive Suggestions for Next Week',
      disclaimer: 'Note: Nutritional insights are approximate and based solely on the recorded meal names and known ingredients in your library. We never fabricate health data or provide medical diagnoses.',
      insufficientData: 'Record a few more meals to unlock comprehensive eating habits and nutritional reports!',
    },
    settings: {
      title: 'Settings & Family Preferences',
      subtitle: 'Customize recommendations, language, and dietary preferences.',
      profileSection: 'Household Profile',
      userName: 'Your Name',
      householdName: 'Family / Household Name',
      language: 'App Language',
      preferencesSection: 'Recommendation Rules',
      avoidDaysLabel: 'Avoid recommending dishes cooked within the last:',
      avoidDaysHint: 'Prevents suggesting dishes cooked recently (e.g. 3 days).',
      varietyLevelLabel: 'Variety Preference',
      dietarySection: 'Dietary Preferences & Allergies',
      dietaryPreferences: 'Dietary Preferences (e.g. Halal, High Protein)',
      dislikedFoods: 'Disliked Foods / Avoided Ingredients',
      demoSection: 'Library & Data Management',
      demoModeLabel: 'Load Starter Family Recipes',
      demoModeDesc: 'Optionally populate your library with authentic traditional family dishes and history.',
      resetAllData: 'Clear All Data & Start Empty',
      resetConfirm: 'Are you sure you want to reset everything? This clears all dishes and history.',
      saveSettings: 'Save Preferences',
      settingsSaved: 'Preferences saved successfully!',
    },
  },
  ur: {
    appName: 'آج کیا پکائیں؟',
    tagline: 'ذاتی گھریلو کوکنگ اسسٹنٹ',
    nav: {
      home: 'ہوم',
      library: 'میری لائبریری',
      calendar: 'کیلنڈر اور تاریخ',
      reports: 'غذائیت اور رپورٹس',
      settings: 'ترتیبات',
      addDish: 'ڈش شامل کریں',
    },
    dashboard: {
      greetingMorning: 'صبح بخیر',
      greetingAfternoon: 'دوپہر بخیر',
      greetingEvening: 'شام بخیر',
      greetingNight: 'شب بخیر',
      subGreeting: 'آج اپنے گھر والوں کے لیے کیا پکانا پسند کریں گے؟',
      whatToCookTitle: 'آج کیا پکائیں؟',
      whatToCookSubtitle: 'فیصلہ کریں — صرف اور صرف آپ کی اپنی لائبریری کے کھانوں میں سے۔',
      todayStatusEmpty: 'آج کے لیے ابھی کوئی کھانا منتخب نہیں ہوا',
      todayStatusSelected: 'آج کا منتخب کردہ کھانا:',
      markAsCooked: 'پک گیا (ریکارڈ کریں)',
      alreadyCooked: 'پک چکا ہے ✓',
      viewDetails: 'تفصیلات دیکھیں',
      recentMealsTitle: 'حالیہ دنوں میں پکائے گئے کھانے',
      noRecentMeals: 'ابھی کوئی کھانا ریکارڈ نہیں ہوا۔ کھانا پکانے کے بعد یہاں اندراج کریں!',
      libraryStatsTitle: 'آپ کی کوکنگ لائبریری',
      totalDishes: 'ڈشز آپ کی ذاتی لائبریری میں موجود ہیں',
      varietySummaryTitle: 'اس ہفتے کا جائزہ',
      varietyHealthy: 'چاول، سالن اور دالوں کا بہترین توازن',
      demoBanner: 'ڈیمو موڈ فعال ہے — نمونے کی خاندانی ترکیبیں اور پچھلی تاریخ دکھائی جا رہی ہے۔',
      clearDemoData: 'نمونہ ڈیٹا ہٹائیں اور خود شروع کریں',
      loadDemoData: 'نمونہ فیملی لائبریری لوڈ کریں',
    },
    modes: {
      smartPick: {
        title: 'اسمارٹ انتخاب',
        subtitle: 'حالیہ کھانوں، فریکوئنسی اور غذائی تنوع کی بنیاد پر دانشمندانہ فیصلہ',
        badge: 'تجویز کردہ',
        action: 'آج کی ڈش منتخب کریں',
        heading: 'آج آپ کے خاندان کے لیے اسمارٹ تجویز',
        whyPicked: 'یہ ڈش کیوں منتخب کی گئی:',
        varietyNote: 'غذائیت اور ذائقے کا تنوع:',
        lastCooked: 'آخری بار کب پکی:',
        neverCooked: 'ابھی تک نہیں پکی (آپ کی لائبریری سے!)',
        timesPrepared: 'پہلے کتنی بار پکی:',
        cookThisToday: 'آج یہی پکائیں',
        showAnother: 'کوئی اور تجویز دکھائیں',
        notInTheMood: 'آج موڈ نہیں ہے',
        emptyWarning: 'آپ کی لائبریری خالی ہے۔ پہلے وہ کھانے شامل کریں جو آپ پکانا جانتے ہیں!',
        addDishesFirst: 'لائبریری میں جائیں',
      },
      randomWheel: {
        title: 'گھومتا پہیہ',
        subtitle: 'کھانوں کا پہیہ گھمائیں اور اچانک دلچسپ انتخاب پائیں',
        action: 'پہیہ گھمائیں',
        heading: 'کھانے کا گھومتا پہیہ',
        spinButton: 'پہیہ گھمائیں',
        spinning: 'پہیہ گھوم رہا ہے...',
        selectedTitle: 'پہیے نے منتخب کر لیا!',
        spinAgain: 'دوبارہ گھمائیں',
        cookThisToday: 'آج یہی پکائیں',
        avoidRecentLabel: 'پچھلے 3 دنوں میں پکے کھانے نکال دیں',
        filterCategory: 'کیٹیگری:',
        allCategories: 'تمام کیٹیگریز',
        insufficientDishes: 'پہیہ گھمانے کے لیے لائبریری میں کم از کم 2 ڈشز ضروری ہیں۔',
      },
      tryNew: {
        title: 'کچھ نیا آزمائیں',
        subtitle: 'لائبریری کی غیر پکی ڈشز یا ایک نئی ترکیب دریافت کریں',
        action: 'نئی ترکیبیں دیکھیں',
        heading: 'آج کچھ منفرد آزمائیں',
        uncookedTab: 'لائبریری کی ان پکی ڈشز',
        newRecipeTab: 'نئی ترکیب دریافت کریں',
        uncookedDesc: 'وہ ڈشز جو آپ کی لائبریری میں ہیں مگر ابھی تک آپ نے نہیں پکائیں۔',
        newRecipeDesc: 'آپ کے ذوق کے مطابق نئی ترکیب۔ پسند آنے پر لائبریری میں شامل کریں۔',
        newRecipeWarning: 'نئی ترکیب: یہ ڈش عام تجاویز میں تب تک نہیں آئے گی جب تک آپ اسے لائبریری میں شامل نہ کریں۔',
        addToLibrary: 'میری لائبریری میں شامل کریں',
        alreadyAdded: 'لائبریری میں شامل ہو گئی ✓',
        exploreAnother: 'کوئی اور ڈش دیکھیں',
        notInterested: 'دلچسپی نہیں',
        viewRecipe: 'مکمل ترکیب دیکھیں',
        ingredients: 'اجزاء',
        instructions: 'تیاری کے مراحل',
      },
      occasion: {
        title: 'دعوت موڈ',
        subtitle: 'مہمان آ رہے ہیں؟ 4 حصوں پر مشتمل مکمل دعوت کا مینو بنائیں',
        action: 'دعوت مینو بنائیں',
        heading: 'مہمان تشریف لا رہے ہیں؟',
        selectOccasion: 'تقریب کی نوعیت',
        guestCount: 'مہمانوں کی تعداد',
        mealType: 'کھانے کا وقت',
        lunch: 'دوپہر کا کھانا',
        dinner: 'رات کا کھانا',
        mainCourse: '1. بنیادی ڈش (Main Course)',
        sideDish: '2. سائیڈ ڈش (Side Dish)',
        dessert: '3. میٹھا (Dessert)',
        drink: '4. مشروب (Drink)',
        changeItem: 'یہ ڈش تبدیل کریں',
        emptyCategoryNotice: 'آپ نے ابھی تک اس کیٹیگری میں کوئی ڈش شامل نہیں کی۔',
        addCategoryDish: '+ لائبریری میں شامل کریں',
        generateMenu: 'نیا مینو بنائیں',
        saveMenu: 'یہ مینو محفوظ کریں',
        addToCalendar: 'پورا مینو کیلنڈر میں درج کریں',
        menuSaved: 'دعوت مینو کامیابی سے محفوظ ہو گیا!',
      },
    },
    library: {
      title: 'میری کوکنگ لائبریری',
      subtitle: 'آپ کے اسسٹنٹ کی بنیاد — وہ تمام کھانے جو آپ پہلے سے بنانا جانتے ہیں۔',
      searchPlaceholder: 'کھانے یا اجزاء تلاش کریں...',
      allCategories: 'تمام کیٹیگریز',
      sortBy: 'ترتیب دیں:',
      sortName: 'حروف تہجی کے لحاظ سے',
      sortRecentAdded: 'حال ہی میں شامل کردہ',
      sortMostCooked: 'سب سے زیادہ پکے ہوئے',
      sortLeastCooked: 'کم پکے ہوئے',
      sortFavorites: 'پسندیدہ پہلے',
      addNewDish: '+ نئی ڈش شامل کریں',
      emptyTitle: 'آپ کی کوکنگ لائبریری خالی ہے',
      emptySubtitle: 'وہ روزمرہ کھانے شامل کریں جو آپ کا خاندان پسند کرتا ہے۔',
      quickAddPrompt: 'عام گھریلو کھانے تیزی سے شامل کریں',
      editDish: 'ڈش میں ترمیم کریں',
      deleteDish: 'ڈش حذف کریں',
      deleteConfirm: 'کیا آپ واقعی اس ڈش کو اپنی لائبریری سے نکالنا چاہتے ہیں؟',
      dishNameLabel: 'ڈش کا نام *',
      categoryLabel: 'کیٹیگری *',
      prepTimeLabel: 'تیاری کا وقت (منٹ، اختیاری)',
      recipeLabel: 'ترکیب یا طریقہ کار (اختیاری)',
      recipeOptional: 'اختیاری — آپ صرف نام بھی لکھ سکتے ہیں!',
      ingredientsLabel: 'اہم اجزاء (کوما کے ساتھ، اختیاری)',
      ingredientsHelp: 'مثلاً چکن، ٹماٹر، ادرک، ہری مرچیں',
      notesLabel: 'خاندانی نوٹس (اختیاری)',
      imageSelectLabel: 'کھانے کی تصویر منتخب کریں',
      saveDish: 'لائبریری میں محفوظ کریں',
      cancel: 'منسوخ',
      cookTodayAction: 'آج پکائیں',
    },
    calendar: {
      title: 'کیلنڈر اور کھانے کی تاریخ',
      subtitle: 'دیکھیں کہ آپ نے کب کیا پکایا اور آنے والے دنوں کی منصوبہ بندی کریں۔',
      monthView: 'مہینہ',
      weekView: 'ہفتہ',
      dayView: 'دن',
      todayButton: 'آج',
      breakfast: 'ناشتہ',
      lunch: 'دوپہر کا کھانا',
      dinner: 'رات کا کھانا',
      snack: 'شام کی چائے / اسنیکس',
      completedBadge: 'پک کر کھا لیا',
      plannedBadge: 'منصوبہ بندی',
      logCookedMeal: '+ پکا ہوا کھانا درج کریں',
      planFutureMeal: '+ کھانا پلان کریں',
      noMealsLogged: 'اس تاریخ کے لیے کوئی کھانا ریکارڈ نہیں ہوا۔',
      markAsCompleted: 'پک چکا ہے (ریکارڈ کریں)',
      deleteEntry: 'اندراج ختم کریں',
    },
    reports: {
      title: 'غذائیت اور کھانے کی عادات',
      subtitle: 'آپ کے ریکارڈ کردہ کھانوں کی بنیاد پر دوستانہ اور شفاف تجزیہ۔',
      weeklyTab: 'پچھلے 7 دن کی رپورٹ',
      monthlyTab: 'پچھلے 30 دن کا جائزہ',
      totalMeals: 'پکائے گئے کھانے',
      uniqueDishes: 'منفرد ڈشز',
      varietyScore: 'تنوع کا اسکور',
      repeatedDishes: 'دہرائے گئے کھانے',
      categoryDistribution: 'کیٹیگری کے لحاظ سے تقسیم',
      frequentDishes: 'اکثر پکائے گئے کھانے',
      nutritionHighlights: 'عمومی غذائی عناصر',
      proteinNotice: 'پروٹین سے بھرپور کھانے (گوشت، دال، ڈیری)',
      veggieNotice: 'سبزیوں والے کھانے',
      lentilNotice: 'دالیں اور اناج',
      riceNotice: 'چاول کے پکوان',
      aiObservationsTitle: 'خاندانی کھانے کا مشاہدہ',
      familyTipsTitle: 'اگلے ہفتے کے لیے مفید تجاویز',
      disclaimer: 'نوٹ: غذائی معلومات صرف آپ کی لائبریری کے ناموں اور اجزاء پر مبنی عمومی تخمینہ ہیں۔ ہم کبھی بھی جعلی اعداد و شمار یا طبی تشخیص پیش نہیں کرتے۔',
      insufficientData: 'جامع رپورٹ دیکھنے کے لیے مزید چند کھانے ریکارڈ کریں۔',
    },
    settings: {
      title: 'ترتیبات اور ترجیحات',
      subtitle: 'کھانوں کے انتخاب کے اصول، زبان اور غذائی ترجیحات سیٹ کریں۔',
      profileSection: 'گھریلو پروفائل',
      userName: 'آپ کا نام',
      householdName: 'خاندان کا نام',
      language: 'ایپ کی زبان',
      preferencesSection: 'تجویز کے اصول',
      avoidDaysLabel: 'پچھلے اتنے دنوں میں پکی ہوئی ڈشز دوبارہ تجویز نہ کریں:',
      avoidDaysHint: 'یہ حالیہ پکے کھانوں کو بار بار دہرانے سے روکتا ہے۔',
      varietyLevelLabel: 'تنوع کی ترجیح',
      dietarySection: 'غذائی ترجیحات اور پرہیز',
      dietaryPreferences: 'غذائی ترجیحات (مثلاً حلال، متوازن مصالحہ)',
      dislikedFoods: 'ناپسندیدہ اشیاء / جن سے پرہیز ہو',
      demoSection: 'ڈیٹا اور لائبریری کا انتظام',
      demoModeLabel: 'ابتدائی گھریلو پکوان شامل کریں',
      demoModeDesc: 'روایتی گھریلو پکوانوں اور تاریخ کے ساتھ لائبریری کو فوری طور پر بھریں۔',
      resetAllData: 'تمام ڈیٹا صاف کریں اور خالی شروع کریں',
      resetConfirm: 'کیا آپ واقعی سب کچھ صاف کرنا چاہتے ہیں؟ تمام لائبریری اور تاریخ ختم ہو جائے گی۔',
      saveSettings: 'ترتیبات محفوظ کریں',
      settingsSaved: 'ترتیبات محفوظ ہو گئیں!',
    },
  },
};
