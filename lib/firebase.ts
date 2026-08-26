// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyB8vKhBKWckhyaIlYfpumfgrzZqUfS0D3U',
  authDomain: 'ijarauz.firebaseapp.com',
  projectId: 'ijarauz',
  storageBucket: 'ijarauz.firebasestorage.app',
  messagingSenderId: '2516836673',
  appId: '1:2516836673:web:9739843733f07f545981c0',
  measurementId: 'G-BLQ0F1QX7V',
};

// Avoid re-initializing on hot reload
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
