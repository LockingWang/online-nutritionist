/**
 * 依路由設定 document.title，利於 SEO 與瀏覽器分頁辨識
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const SITE_NAME = '營養管理系統';

const routeTitles: Record<string, string> = {
  [ROUTES.HOME]: SITE_NAME,
  [ROUTES.LOGIN]: `登入 | ${SITE_NAME}`,
  [ROUTES.REGISTER]: `註冊 | ${SITE_NAME}`,
  [ROUTES.DASHBOARD]: `首頁 | ${SITE_NAME}`,
  [ROUTES.PROFILE]: `個人資料 | ${SITE_NAME}`,
  [ROUTES.FOOD_LOG]: `飲食記錄 | ${SITE_NAME}`,
  [ROUTES.MEAL_SUGGESTION]: `餐點建議 | ${SITE_NAME}`,
  [ROUTES.AI_CHAT]: `AI 營養師 | ${SITE_NAME}`,
  [ROUTES.STATISTICS]: `統計分析 | ${SITE_NAME}`,
};

export const DocumentTitle: React.FC = () => {
  const { pathname } = useLocation();
  const title = routeTitles[pathname] ?? SITE_NAME;

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
};
