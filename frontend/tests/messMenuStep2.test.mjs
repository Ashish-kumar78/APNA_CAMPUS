import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  getWeeklyMessMenu,
  updateMealMenuItem,
  publishWeeklyMenu,
  getMenuPublicationStatus,
  copyPreviousWeekMenu,
  markMealAvailability,
  addFestivalSpecialMeal,
  resetWeeklyMessMenu,
} from '../src/services/hostelFoodStore.js';

describe('STEP 2: Weekly Menu Management (Fretbox PS07)', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('1. Weekly menu contains all 7 days and all 4 meal types', () => {
    const menu = getWeeklyMessMenu();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];

    days.forEach((day) => {
      expect(menu).toHaveProperty(day);
      meals.forEach((m) => {
        expect(menu[day]).toHaveProperty(m);
        expect(menu[day][m]).toHaveProperty('items');
      });
    });
  });

  it('2. updateMealMenuItem updates food items, calories, timing, description and metadata', async () => {
    const updated = await updateMealMenuItem({
      day: 'Monday',
      mealType: 'breakfast',
      items: 'Masala Idli, Medu Vada, Coconut Chutney, Filter Coffee',
      time: '07:30 - 09:30 AM',
      calories: '540 kcal',
      description: 'Cold-pressed coconut oil preparation',
      lastUpdatedBy: 'Mr. Kailash Chandra Nayak',
    });

    expect(updated.Monday.breakfast.items).toBe('Masala Idli, Medu Vada, Coconut Chutney, Filter Coffee');
    expect(updated.Monday.breakfast.time).toBe('07:30 - 09:30 AM');
    expect(updated.Monday.breakfast.calories).toBe('540 kcal');
    expect(updated.Monday.breakfast.description).toBe('Cold-pressed coconut oil preparation');
    expect(updated.Monday.breakfast.lastUpdatedBy).toBe('Mr. Kailash Chandra Nayak');
  });

  it('3. addFestivalSpecialMeal adds celebration feast with special occasion badge', async () => {
    const updated = await addFestivalSpecialMeal({
      day: 'Sunday',
      mealType: 'dinner',
      occasion: 'Diwali Grand Feast',
      items: 'Paneer Pasanda, Veg Dum Biryani, Dal Makhani, Gulab Jamun & Rasmalai',
      time: '08:00 - 10:30 PM',
      calories: '980 kcal',
      description: 'Grand Diwali dinner for all residents and day scholars',
      updatedBy: 'Mr. Kailash Chandra Nayak',
    });

    const sundayDinner = updated.Sunday.dinner;
    expect(sundayDinner.isSpecial).toBe(true);
    expect(sundayDinner.specialOccasion).toBe('Diwali Grand Feast');
    expect(sundayDinner.items).toContain('Gulab Jamun');
  });

  it('4. markMealAvailability toggles meal available and unavailable with reason', async () => {
    const unavailable = await markMealAvailability({
      day: 'Wednesday',
      mealType: 'snacks',
      isAvailable: false,
      unavailabilityReason: 'Kitchen pipeline maintenance',
      updatedBy: 'Mr. Kailash Chandra Nayak',
    });

    expect(unavailable.Wednesday.snacks.isAvailable).toBe(false);
    expect(unavailable.Wednesday.snacks.unavailabilityReason).toBe('Kitchen pipeline maintenance');

    const availableAgain = await markMealAvailability({
      day: 'Wednesday',
      mealType: 'snacks',
      isAvailable: true,
      updatedBy: 'Mr. Kailash Chandra Nayak',
    });

    expect(availableAgain.Wednesday.snacks.isAvailable).toBe(true);
  });

  it('5. copyPreviousWeekMenu duplicates verified rotation and updates stamps', () => {
    const copied = copyPreviousWeekMenu({ copiedBy: 'Mr. Kailash Chandra Nayak' });
    expect(copied.Monday.breakfast.lastUpdatedBy).toBe('Mr. Kailash Chandra Nayak');
    expect(copied.Sunday.dinner.lastUpdatedBy).toBe('Mr. Kailash Chandra Nayak');
    expect(copied.Friday.lunch.isAvailable).toBe(true);
  });

  it('6. publishWeeklyMenu publishes menu college-wide and updates publication metadata', () => {
    const pubMeta = publishWeeklyMenu({
      publishedBy: 'Mr. Kailash Chandra Nayak',
      targetHostels: 'All Hostels',
    });

    expect(pubMeta.isPublished).toBe(true);
    expect(pubMeta.publishedBy).toBe('Mr. Kailash Chandra Nayak');
    expect(pubMeta.targetHostels).toBe('All Hostels');

    const status = getMenuPublicationStatus();
    expect(status.isPublished).toBe(true);
  });

  it('7. MessManagerPortal.jsx implements all 9 menu management actions and modal workflows', () => {
    const portalCode = fs.readFileSync(path.join(rootDir, 'src/components/MessManagerPortal.jsx'), 'utf8');

    // 1. Add / Edit Meal
    expect(portalCode).toContain('Add / Edit Meal');
    expect(portalCode).toContain('handleOpenEditMeal');
    expect(portalCode).toContain('handleSaveEditMeal');

    // 2. Edit Meal Modal
    expect(portalCode).toContain('isEditModalOpen');
    expect(portalCode).toContain('Configure Meal Menu Entry');

    // 3. Clear / Reset meal
    expect(portalCode).toContain('handleClearMeal');
    expect(portalCode).toContain('handleResetBaseline');

    // 4. Copy Previous Week
    expect(portalCode).toContain('Copy Previous Week');
    expect(portalCode).toContain('handleCopyPreviousWeek');

    // 5. Special Festival Meals
    expect(portalCode).toContain('+ Add Festival Meal');
    expect(portalCode).toContain('isFestivalModalOpen');
    expect(portalCode).toContain('handleAddFestivalMealSubmit');

    // 6. Mark Meal Unavailable
    expect(portalCode).toContain('handleToggleAvailability');
    expect(portalCode).toContain('unavailabilityModal');
    expect(portalCode).toContain('Mark Meal Unavailable');

    // 7. Day Selector
    expect(portalCode).toContain("['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']");

    // 8. Preview Timetable Matrix
    expect(portalCode).toContain('Preview Timetable');
    expect(portalCode).toContain('isPreviewModalOpen');
    expect(portalCode).toContain('Comprehensive Weekly Mess Timetable Matrix');

    // 9. Publish Weekly Menu
    expect(portalCode).toContain('Publish Weekly Menu');
    expect(portalCode).toContain('handlePublishMenu');
  });

  it('8. App.jsx wires MessManagerPortal into demo accounts, categories, and routing', () => {
    const appCode = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf8');

    expect(appCode).toContain("import MessManagerPortal from './components/MessManagerPortal.jsx'");
    expect(appCode).toContain("'mess_manager':");
    expect(appCode).toContain("'mess':");
    expect(appCode).toContain("'mess-101':");
    expect(appCode).toContain("key: 'mess_manager'");
    expect(appCode).toContain("account.role === 'mess_manager'");
  });
});

