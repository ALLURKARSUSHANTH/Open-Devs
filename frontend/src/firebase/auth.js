import { auth, githubProvider, googleProvider } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import axios from 'axios';

// Helper function to send user data to the backend
const saveUserToBackend = async (user) => {

  try {
    await axios.post("http://localhost:5000/users/firebase", {
      _id: user?.uid,
      email: user?.email,
      displayName: user?.displayName || "", 
    });
    console.log("User data sent to backend:", user);
  } catch (error) {
    console.error("Error saving user to backend:", error.message);
  }
};

// Register user with email and password
export const registerWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered:", userCredential.user);
    await saveUserToBackend(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering:", error.message);
  }
};

// Login user with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    await saveUserToBackend(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("User logged in with Google:", result.user);
    await saveUserToBackend(result.user);
    return result.user;
  } catch (error) {
    console.error("Error logging in with Google:", error.message);
  }
};

// Sign in with GitHub
export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    console.log("User logged in with Github:", result.user);
    await saveUserToBackend(result.user);
    return result.user;
  } catch (error) {
    console.error("Error logging in with Github:", error.message);
  }
};

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Error logging out:", error.message);
  }
};
