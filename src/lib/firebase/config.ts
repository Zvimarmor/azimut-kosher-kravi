import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDmgVkbnvnvdGbSMtT6hPPvFD1gSW08F_Q",
  authDomain: "azimut-kosher-kravi.firebaseapp.com",
  projectId: "azimut-kosher-kravi",
  storageBucket: "azimut-kosher-kravi.firebasestorage.app",
  messagingSenderId: "867971195310",
  appId: "1:867971195310:web:997a7273220f7d7efd283f",
  measurementId: "G-XJ2YXJP2Z7"
};

console.log('Firebase: Initializing with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase: App initialized');

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set auth persistence to local storage (persists even when browser is closed)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase: Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Firebase: Error setting auth persistence:', error);
  });

console.log('Firebase: Auth initialized');

export default app;