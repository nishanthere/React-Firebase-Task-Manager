import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDpnObJaFxaVNRgorNqZu0cMprIC1-23PE",
    authDomain: "task-manager-c3307.firebaseapp.com",
    projectId: "task-manager-c3307",
    storageBucket: "task-manager-c3307.appspot.com",
    messagingSenderId: "183349860190",
    appId: "1:183349860190:web:66b3f3e209e21a940061cf"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
