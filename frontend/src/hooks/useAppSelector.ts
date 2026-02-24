import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

// 使用這個 hook 而不是直接使用 useSelector，以獲得正確的型別
export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
  return useSelector(selector);
};
