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

export default getTimeGreeting;

