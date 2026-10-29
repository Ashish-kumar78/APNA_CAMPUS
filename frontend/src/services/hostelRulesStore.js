/**
 * APNA CAMPUS - Hostel Rules, Curfews & Code of Conduct Store
 * Authoritative reactive store synchronized across Hostel Admin, Warden, and Student portals.
 */

import { mockHostelRulesConfig } from '../components/hostel/hostelData.js';

const STORAGE_KEY = 'apna_campus_hostel_rules_matrix_v1';
export const RULES_UPDATED_EVENT = 'apna_campus_hostel_rules_updated';

// Helper: generate stable unique IDs
const generateRuleId = (prefix = 'rule') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
};

// Default seed rules initialized with IDs
const seedDefaultRules = () => {
  return (mockHostelRulesConfig || []).map((cat, catIdx) => ({
    category: cat.category,
    items: (cat.items || []).map((item, itemIdx) => ({
      id: `rule-seed-${catIdx + 1}-${itemIdx + 1}`,
      title: item.title,
      value: item.value,
      description: item.description,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Hostel Administration'
    }))
  }));
};

let _memoryRules = null;

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const notifyRulesUpdated = (rules) => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(RULES_UPDATED_EVENT, { detail: rules }));
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Retrieve all hostel rules and curfew categories
 * @returns {Array<{ category: string, items: Array }>}
 */
export const getAllHostelRules = () => {
  const storage = getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse hostel rules from localStorage:', e);
    }
  }

  if (_memoryRules && Array.isArray(_memoryRules) && _memoryRules.length > 0) {
    return _memoryRules;
  }

  const initial = seedDefaultRules();
  _memoryRules = initial;
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {
      console.warn('Failed to save seed hostel rules to localStorage:', e);
    }
  }
  return initial;
};

/**
 * Save complete rules state to storage and broadcast update
 * @param {Array} rules
 */
export const saveAllHostelRules = (rules) => {
  _memoryRules = rules;
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(rules));
    } catch (e) {
      console.warn('Failed to write rules to localStorage:', e);
    }
  }
  notifyRulesUpdated(rules);
  return rules;
};

/**
 * Add a new Rule or Curfew item
 * @param {Object} param0
 * @param {string} param0.category
 * @param {string} param0.title
 * @param {string} param0.value
 * @param {string} param0.description
 * @param {string} [param0.author]
 */
export const addHostelRule = ({ category, title, value, description, author = 'Hostel Administrator' }) => {
  if (!category || !title) {
    throw new Error('Category and Rule Title are required.');
  }

  const rules = getAllHostelRules().map(c => ({
    ...c,
    items: [...c.items]
  }));

  const targetCatName = category.trim();
  let targetCat = rules.find(c => c.category.toLowerCase() === targetCatName.toLowerCase());

  const newRuleItem = {
    id: generateRuleId('rule'),
    title: title.trim(),
    value: (value || 'Enforced').trim(),
    description: (description || '').trim(),
    updatedAt: new Date().toISOString(),
    updatedBy: author
  };

  if (!targetCat) {
    targetCat = {
      category: targetCatName,
      items: [newRuleItem]
    };
    rules.push(targetCat);
  } else {
    targetCat.items.push(newRuleItem);
  }

  saveAllHostelRules(rules);
  return newRuleItem;
};

/**
 * Update an existing Rule or Curfew item
 * @param {string} ruleId
 * @param {Object} updates
 * @param {string} [updates.category]
 * @param {string} updates.title
 * @param {string} updates.value
 * @param {string} updates.description
 * @param {string} [updates.author]
 */
export const updateHostelRule = (ruleId, { category, title, value, description, author = 'Hostel Administrator' }) => {
  const rules = getAllHostelRules().map(c => ({
    ...c,
    items: [...c.items]
  }));

  let foundItem = null;
  let sourceCatIndex = -1;
  let itemIndex = -1;

  for (let cIdx = 0; cIdx < rules.length; cIdx++) {
    const itIdx = rules[cIdx].items.findIndex(item => item.id === ruleId || item.title === ruleId);
    if (itIdx !== -1) {
      foundItem = rules[cIdx].items[itIdx];
      sourceCatIndex = cIdx;
      itemIndex = itIdx;
      break;
    }
  }

  if (!foundItem) {
    throw new Error(`Rule with ID "${ruleId}" not found.`);
  }

  const updatedItem = {
    ...foundItem,
    title: title ? title.trim() : foundItem.title,
    value: value !== undefined ? value.trim() : foundItem.value,
    description: description !== undefined ? description.trim() : foundItem.description,
    updatedAt: new Date().toISOString(),
    updatedBy: author
  };

  const newCategoryName = category ? category.trim() : rules[sourceCatIndex].category;

  if (rules[sourceCatIndex].category.toLowerCase() === newCategoryName.toLowerCase()) {
    // Same category, replace in place
    rules[sourceCatIndex].items[itemIndex] = updatedItem;
  } else {
    // Category changed: remove from source and add to destination
    rules[sourceCatIndex].items.splice(itemIndex, 1);
    let destCat = rules.find(c => c.category.toLowerCase() === newCategoryName.toLowerCase());
    if (!destCat) {
      destCat = {
        category: newCategoryName,
        items: [updatedItem]
      };
      rules.push(destCat);
    } else {
      destCat.items.push(updatedItem);
    }
  }

  saveAllHostelRules(rules);
  return updatedItem;
};

/**
 * Delete a Rule or Curfew item by its ID or title
 * @param {string} ruleId
 */
export const deleteHostelRule = (ruleId) => {
  const rules = getAllHostelRules().map(c => ({
    ...c,
    items: [...c.items]
  }));

  let removed = false;
  for (let i = 0; i < rules.length; i++) {
    const beforeCount = rules[i].items.length;
    rules[i].items = rules[i].items.filter(item => item.id !== ruleId && item.title !== ruleId);
    if (rules[i].items.length < beforeCount) {
      removed = true;
      break;
    }
  }

  if (removed) {
    saveAllHostelRules(rules);
  }
  return removed;
};

/**
 * Reset rules to system default seed
 */
export const resetHostelRulesToDefault = () => {
  const initial = seedDefaultRules();
  saveAllHostelRules(initial);
  return initial;
};

/**
 * Subscribe to rules updates across tabs and role pages
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export const subscribeHostelRules = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleUpdate = () => {
    callback(getAllHostelRules());
  };

  window.addEventListener(RULES_UPDATED_EVENT, handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener(RULES_UPDATED_EVENT, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
};

/**
 * Flat list of all rules formatted for Student Hostel Dashboard
 * @returns {Array<{ id: string, category: string, title: string, value: string, description: string }>}
 */
export const getStudentRulesList = () => {
  const categories = getAllHostelRules();
  const flat = [];
  categories.forEach(cat => {
    cat.items.forEach(item => {
      flat.push({
        id: item.id,
        category: cat.category,
        title: item.title,
        value: item.value,
        description: item.description
      });
    });
  });
  return flat;
};

