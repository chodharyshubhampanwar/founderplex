import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FieldValue } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
//   measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyDivoUgdBwi3cWR57uPyjdh2eZ6Emyc8Hg",
  authDomain: "mesh-base.firebaseapp.com",
  projectId: "mesh-base",
  storageBucket: "mesh-base.appspot.com",
  messagingSenderId: "695967434826",
  appId: "1:695967434826:web:8097a5388b06f5cef73eb3",
  measurementId: "G-Z70HXZSGMT",
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export {
  FieldValue,
  doc,
  setDoc,
  collection,
  ref,
  uploadBytes,
  getDownloadURL,
  onAuthStateChanged,
};
