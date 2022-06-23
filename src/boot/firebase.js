import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2gcrOMYTlYL0L7i_5r_HELvU1gTqUOCk",
  authDomain: "detencion-alambiques.firebaseapp.com",
  projectId: "detencion-alambiques",
  storageBucket: "detencion-alambiques.appspot.com",
  messagingSenderId: "363862055112",
  appId: "1:363862055112:web:9386737227283031612dfd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

export { db, auth };
