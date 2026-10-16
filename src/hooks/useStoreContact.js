import { useEffect, useSyncExternalStore } from 'react';
import { api } from '../services/api';
import { STORE_CONTACT } from '../services/storeConfig';

let contact = STORE_CONTACT;
let loading;
const listeners = new Set();
const subscribe = notify => { listeners.add(notify); return () => listeners.delete(notify); };
const snapshot = () => contact;

export function publishStoreContact(data) {
  contact = Object.fromEntries(Object.entries(STORE_CONTACT).map(([key, fallback]) => [key, data[key] || fallback]));
  listeners.forEach(notify => notify());
}

export function useStoreContact() {
  const value = useSyncExternalStore(subscribe, snapshot, () => STORE_CONTACT);
  useEffect(() => {
    loading ??= api.getStoreSettings().then(publishStoreContact).catch(() => { loading = undefined; });
  }, []);
  return value;
}
