// 路由常數
export const ROUTES = {
  // 公開路由
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // 受保護路由
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  FOOD_LOG: '/food-log',
  MEAL_SUGGESTION: '/meal-suggestion',
  AI_CHAT: '/ai-chat',
  STATISTICS: '/statistics',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
