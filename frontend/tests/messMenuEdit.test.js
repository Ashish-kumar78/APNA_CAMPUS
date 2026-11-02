import { describe, it, expect, beforeEach, vi } from 'vitest';

// Polyfill browser environment for Vitest Node runner
const storageMap = new Map();
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, val) => storageMap.set(key, String(val)),
    removeItem: (key) => storageMap.delete(key),
    clear: () => storageMap.clear(),
  };
}
if (typeof global.window === 'undefined') {
  const listeners = new Map();
  global.window = {
    localStorage: global.localStorage,
    dispatchEvent: (event) => {
      const handlers = listeners.get(event.type) || [];
      handlers.forEach(h => h(event));
      return true;
    },
    addEventListener: (type, handler) => {
      const handlers = listeners.get(type) || [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    removeEventListener: (type, handler) => {
      const handlers = listeners.get(type) || [];
      listeners.set(type, handlers.filter(h => h !== handler));
    },
  };
} else if (!global.window.localStorage) {
  global.window.localStorage = global.localStorage;
}

if (typeof global.CustomEvent === 'undefined') {
  global.CustomEvent = class CustomEvent {
    constructor(type, eventInitDict) {
      this.type = type;
      this.detail = eventInitDict?.detail;
    }
  };
}
if (typeof global.Event === 'undefined') {
  global.Event = class Event {
    constructor(type) {
      this.type = type;
    }
  };
}

// Mock api to avoid actual network requests during unit tests
vi.mock('../src/services/api.js', () => {
  const mockApi = {
    getWeeklyMessMenu: vi.fn().mockResolvedValue({ success: true, data: {} }),
    updateDailyMessMenu: vi.fn().mockResolvedValue({ success: true }),
    getMessMenu: vi.fn().mockResolvedValue({ success: true, data: null }),
  };
  return {
    api: mockApi,
    default: mockApi
  };
});

import {
  getWeeklyMessMenu,
  updateMealMenuItem,
  resetWeeklyMessMenu,
  getDailyMessMenu,
  MESS_MENU_STORAGE_KEY
} from '../src/services/hostelFoodStore.js';

describe('Mess Food Menu Editing & Daily Basis Override', () => {
  beforeEach(() => {
    storageMap.clear();
    resetWeeklyMessMenu();
  });

  it('1. retrieves default weekly mess menu correctly when storage is empty', () => {
    const weekly = getWeeklyMessMenu();
    expect(weekly).toBeDefined();
    expect(weekly.Monday).toBeDefined();
    expect(weekly.Monday.breakfast).toBeDefined();
    expect(weekly.Monday.breakfast.items).toContain('Idli, Medu Vada');
    expect(weekly.Monday.lunch.items).toContain('Basmati Steamed Rice');
  });

  it('2. updates breakfast items, serving time, and calories for Monday', async () => {
    const updatedWeekly = await updateMealMenuItem({
      day: 'Monday',
      mealType: 'breakfast',
      items: 'Poori Bhaji, Boiled Egg / Banana, Filter Coffee',
      time: '07:00 - 09:00 AM',
      calories: '580 kcal'
    });

    expect(updatedWeekly.Monday.breakfast.items).toBe('Poori Bhaji, Boiled Egg / Banana, Filter Coffee');
    expect(updatedWeekly.Monday.breakfast.time).toBe('07:00 - 09:00 AM');
    expect(updatedWeekly.Monday.breakfast.calories).toBe('580 kcal');

    // Check persistence in getWeeklyMessMenu
    const retrieved = getWeeklyMessMenu();
    expect(retrieved.Monday.breakfast.items).toBe('Poori Bhaji, Boiled Egg / Banana, Filter Coffee');
    expect(retrieved.Monday.breakfast.time).toBe('07:00 - 09:00 AM');
    expect(retrieved.Monday.breakfast.calories).toBe('580 kcal');
  });

  it('3. updates lunch items on a daily basis (e.g. Wednesday special feast)', async () => {
    await updateMealMenuItem({
      day: 'Wednesday',
      mealType: 'lunch',
      items: 'Special Biryani, Raita, Gulab Jamun, Salad',
      time: '12:30 - 03:00 PM',
      calories: '950 kcal'
    });

    const weekly = getWeeklyMessMenu();
    expect(weekly.Wednesday.lunch.items).toBe('Special Biryani, Raita, Gulab Jamun, Salad');
    expect(weekly.Wednesday.lunch.calories).toBe('950 kcal');
  });

  it('4. reflects updated meal items in getDailyMessMenu', async () => {
    await updateMealMenuItem({
      day: 'Monday',
      mealType: 'dinner',
      items: 'Butter Naan, Paneer Butter Masala, Rasgulla',
      time: '08:00 - 10:30 PM',
      calories: '820 kcal'
    });

    // Provide a known Monday date (e.g. 2026-11-02 is Monday)
    const daily = await getDailyMessMenu('2026-11-02');
    expect(daily.day).toBe('Monday');
    expect(daily.meals.dinner.items).toBe('Butter Naan, Paneer Butter Masala, Rasgulla');
    expect(daily.meals.dinner.calories).toBe('820 kcal');
  });

  it('5. handles evening snacks alias cleanly', async () => {
    await updateMealMenuItem({
      day: 'Friday',
      mealType: 'Evening Snacks',
      items: 'Samosa, Jalebi, Masala Chai',
      time: '05:00 - 06:30 PM',
      calories: '410 kcal'
    });

    const weekly = getWeeklyMessMenu();
    expect(weekly.Friday.snacks.items).toBe('Samosa, Jalebi, Masala Chai');
  });
});
