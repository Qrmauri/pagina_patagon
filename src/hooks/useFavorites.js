import { useMemo, useSyncExternalStore } from 'react';
import { favoriteIds, toggleFavoriteId } from '../services/productExperience';

const KEY = 'patagon_user_favorites';
const EVENT = 'patagon:favorites';
function snapshot() { try { return localStorage.getItem(KEY) || '[]'; } catch { return '[]'; } }
function subscribe(notify) {
  const storage = event => { if (event.key === KEY || event.key === null) notify(); };
  window.addEventListener('storage', storage);
  window.addEventListener(EVENT, notify);
  return () => { window.removeEventListener('storage', storage); window.removeEventListener(EVENT, notify); };
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '[]');
  const ids = useMemo(() => favoriteIds(raw), [raw]);
  return { ids, isFavorite: id => ids.includes(String(id)), toggle: id => {
    const next = toggleFavoriteId(favoriteIds(snapshot()), id);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    return next.includes(String(id));
  } };
}
