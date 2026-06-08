export const timeOfDayGreeting = (date: Date = new Date()): string => {
  const h = date.getHours();
  if (h < 5) return 'Late tonight.';
  if (h < 12) return 'Good morning.';
  if (h < 17) return 'Good afternoon.';
  if (h < 22) return 'Good evening.';
  return 'Late tonight.';
};
