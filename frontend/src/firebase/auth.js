import { auth, githubProvider, googleProvider } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { setUser, setProfile, setError } from '../reduxState/authSlice';
import store from '../reduxState/store';


// Extract user profile data
const extractUserProfile = (user) => ({
  displayName: user.displayName || 'User', // Fallback if displayName is missing
  photoURL: user.photoURL || 'https://via.placeholder.com/100', // Fallback image URL
  email: user.email || 'No email available', // Fallback if email is missing
});

const saveProfileToLocalStorage=(profile)=>{
  localStorage.setItem('userProfile',JSON.stringify(profile))
}

const getProfileFromLocalStorage = ()=>{
  const profile = localStorage.getItem('userProfile');
  return profile?JSON.parse(profile):null;
}

// Register user with email and password
export const registerWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const profile = extractUserProfile(userCredential.user);
    
    // Dispatch actions to store user and profile in Redux
    store.dispatch(setUser(userCredential.user));
    store.dispatch(setProfile(profile));
    saveProfileToLocalStorage(profile);

    console.log("User registered:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering:", error.message);
    store.dispatch(setError(error.message));
  }
};

// Login user with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const profile = extractUserProfile(userCredential.user);

    // Dispatch actions to store user and profile in Redux
    store.dispatch(setUser(userCredential.user));
    store.dispatch(setProfile(profile));
    saveProfileToLocalStorage(profile);

    console.log("User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
    store.dispatch(setError(error.message));
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = extractUserProfile(result.user);

    // Dispatch actions to store user and profile in Redux
    store.dispatch(setUser(result.user));
    store.dispatch(setProfile(profile));
    saveProfileToLocalStorage(profile);

    console.log("User logged in with Google:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error logging in with Google:", error.message);
    store.dispatch(setError(error.message));
  }
};

// Sign in with GitHub
export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const profile = extractUserProfile(result.user);

    // Dispatch actions to store user and profile in Redux
    store.dispatch(setUser(result.user));
    store.dispatch(setProfile(profile));
    saveProfileToLocalStorage(profile);

    console.log("User logged in with Github:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error logging in with Github:", error.message);
    store.dispatch(setError(error.message));
  }
};

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");

    // Clear user and profile from Redux
    store.dispatch(setUser(null));
    store.dispatch(setProfile({ displayName: '', photoURL: '', email: '' }));
    localStorage.removeItem('userProfile');

  } catch (error) {
    console.error("Error logging out:", error.message);
    store.dispatch(setError(error.message));
  }
};
