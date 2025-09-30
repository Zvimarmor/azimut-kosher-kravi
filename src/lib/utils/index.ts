// Route mapping from page names to URLs
const pageRoutes: Record<string, string> = {
  'Home': '/',
  'WorkoutSetup': '/workout-setup',
  'CreateWorkout': '/create-workout',
  'SelectWorkout': '/select-workout',
  'WorkoutHistory': '/workout-history',
  'Settings': '/settings',
  'QuickWorkout': '/quick-workout',
  'Heritage': '/heritage',
  'MilitaryChat': '/military-chat',
  'AboutUs': '/about-us',
  'Onboarding': '/onboarding'
};

export function createPageUrl(page: string, params?: Record<string, any>): string {
  const baseUrl = pageRoutes[page] || `/${page.toLowerCase()}`;

  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} דקות`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}:${remainingMinutes.toString().padStart(2, '0')} שעות` : `${hours} שעות`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}