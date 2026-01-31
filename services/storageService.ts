import { RamItem, UserState } from '../types';

const KEYS = {
  ITEMS: 'ram_items',
  USER: 'ram_user'
};

export const getItems = (): RamItem[] => {
  try {
    const data = localStorage.getItem(KEYS.ITEMS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveItems = (items: RamItem[]): void => {
  localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
};

export const getUser = (): UserState | null => {
  try {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveUser = (user: UserState): void => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const clearData = () => {
  localStorage.removeItem(KEYS.ITEMS);
  localStorage.removeItem(KEYS.USER);
};