import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBvGd4CnKN1GIyi2L7UDaMKEXlwog8Tk1c",
  authDomain: "hail-mary-40315.firebaseapp.com",
  databaseURL: "https://hail-mary-40315-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hail-mary-40315",
  storageBucket: "hail-mary-40315.firebasestorage.app",
  messagingSenderId: "994021633612",
  appId: "1:994021633612:web:f8a64fcfc9d2ce022c8ee9"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
