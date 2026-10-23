import { useState, useEffect } from 'react';

/**
 * Returns a dynamic greeting based on the current hour of the day.
 * - 04:00 to 11:59: "Good Morning"
 * - 12:00 to 16:59: "Good Afternoon"
 * - 17:00 to 03:59: "Good Evening"
 *
 * @param {Date} [customDate=new Date()]
 * @returns {string} e.g. "Good Morning", "Good Afternoon", or "Good Evening"
 */
export function getTimeGreeting(customDate = new Date()) {
  const hour = customDate.getHours();
  if (hour >= 4 && hour < 12) {
    return 'Good Morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  }
  return 'Good Evening';
}

/**
 * Returns the time-based greeting accompanied by an emoji.
 * @param {Date} [customDate=new Date()]
 * @returns {string}
 */
export function getTimeGreetingWithEmoji(customDate = new Date()) {
  return getTimeGreeting(customDate);
}

/**
 * React hook that returns the current time-based greeting and keeps
 * it synchronized every minute without requiring page reload.
 *
 * @returns {string} e.g. "Good Morning", "Good Afternoon", "Good Evening"
 */
export function useTimeGreeting() {
  const [greeting, setGreeting] = useState(() => getTimeGreeting());

  useEffect(() => {
    const checkGreeting = () => {
      setGreeting(getTimeGreeting());
    };

    // Update every 30 seconds to catch boundaries seamlessly
    const interval = setInterval(checkGreeting, 30000);
    return () => clearInterval(interval);
  }, []);

  return greeting;
}

/**
 * Returns comprehensive time-based greeting, emoji, and motivational wish.
 * @param {Date} [customDate=new Date()]
 */
export function getTimeWish(customDate = new Date()) {
  const hour = customDate.getHours();
  if (hour >= 4 && hour < 12) {
    return {
      greeting: 'Good Morning',
      emoji: '',
      wish: 'Wishing you an inspiring, energetic, and productive day administering college operations!',
      period: 'Morning'
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good Afternoon',
      emoji: '',
      wish: 'Hope your departmental administrative reviews, academic sessions, and student affairs are progressing smoothly!',
      period: 'Afternoon'
    };
  }
  if (hour >= 17 && hour < 22) {
    return {
      greeting: 'Good Evening',
      emoji: '',
      wish: 'Reviewing today’s academic achievements, departmental marks approvals, and campus attendance returns.',
      period: 'Evening'
    };
  }
  return {
    greeting: 'Good Night / Working Late',
    emoji: '',
    wish: 'Working late? Campus biometric gateways, security monitoring, and institutional ERP records remain active 24/7.',
    period: 'Night'
  };
}

/**
 * Resolves a person's display name for dashboard greetings across all roles.
 * - Handles salutations/honorifics (Ms., Dr., Er., Prof., Mr., Mrs.) properly:
 *   e.g. "Ms. Sasmita Mohapatra" -> "Ms. Sasmita"
 *        "Dr. Rajesh Kumar Mohanty" -> "Dr. Rajesh"
 *        "Er. S. K. Nayak" -> "Er. S. K. Nayak" (preserves initials + surname)
 *        "Dr. P. K. Pattnaik" -> "Dr. P. K. Pattnaik"
 *        "Prof. (Dr.) S. P. Panda" -> "Prof. (Dr.) S. P. Panda"
 * - Handles standard names without salutation:
 *   e.g. "Rakesh Das" -> "Rakesh" (matching Image 2)
 *        "Campus Administrator" -> "Campus Administrator"
 *
 * @param {string} fullName
 * @returns {string}
 */
export function getGreetingDisplayName(fullName) {
  if (!fullName || typeof fullName !== 'string') return 'User';
  const clean = fullName.trim();
  if (!clean) return 'User';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];

  const titles = [
    'ms.', 'ms', 'mr.', 'mr', 'mrs.', 'mrs', 'dr.', 'dr',
    'prof.', 'prof', 'er.', 'er', 'prof.(dr.)', 'shri', 'smt.'
  ];

  const firstLower = parts[0].toLowerCase();

  // If starts with a title/honorific (e.g. Ms., Dr., Er., Mr., Mrs., Prof.)
  if (titles.includes(firstLower)) {
    let title = parts[0];
    let remainingParts = parts.slice(1);

    if (remainingParts.length > 0 && ['(dr.)', 'dr.', '(prof.)', 'prof.'].includes(remainingParts[0].toLowerCase())) {
      title = `${parts[0]} ${remainingParts[0]}`;
      remainingParts = remainingParts.slice(1);
    }

    if (remainingParts.length === 0) {
      return title;
    }

    // Check if subsequent parts are initials (e.g. "S. K. Nayak", "P. K. Pattnaik", "K. C. Patra", "S. Mohanty")
    const isInitial = (str) => str.length <= 2 && (str.endsWith('.') || str.length === 1);

    if (isInitial(remainingParts[0])) {
      return `${title} ${remainingParts.join(' ')}`;
    }

    // Regular first name after title (e.g. "Ms. Sasmita Mohapatra" -> "Ms. Sasmita")
    return `${title} ${remainingParts[0]}`;
  }

  // If no title prefix (e.g. "Rakesh Das" -> "Rakesh", "Campus Administrator")
  if (clean.toLowerCase() === 'campus administrator') {
    return 'Campus Administrator';
  }

  // Default to first name like Image 2 ("Rakesh Das" -> "Rakesh")
  return parts[0];
}

export default getTimeGreeting;

