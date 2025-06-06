  
  // firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBwsKGRXVliI1SWS3l5IoPqOA9hW2g5-hM",
  authDomain: "car-app-b8390.firebaseapp.com",
  projectId: "car-app-b8390",
  storageBucket: "car-app-b8390.firebasestorage.app",
  messagingSenderId: "867288690061",
  appId: "1:867288690061:web:b24c13829e8c56efc021c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

  
   