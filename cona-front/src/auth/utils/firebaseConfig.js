import {initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDjKgK4wAQ1lFRuRE34Fi2BFwQ3klAi7Vw",
    authDomain: "controldenominayasistencia.firebaseapp.com",
    projectId: "controldenominayasistencia",
    storageBucket: "controldenominayasistencia.firebasestorage.app",
    messagingSenderId: "189520469168",
    appId: "1:189520469168:web:4ce12252c9cc84fdf56f75",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {auth, provider, signInWithPopup, signOut};