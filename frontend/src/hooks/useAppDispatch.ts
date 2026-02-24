import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store';

// 使用這個 hook 而不是直接使用 useDispatch，以獲得正確的型別
export const useAppDispatch = () => useDispatch<AppDispatch>();
