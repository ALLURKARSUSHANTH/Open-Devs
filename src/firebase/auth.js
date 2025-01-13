import { auth, githubProvider, googleProvider } from './firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';


export const registerWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering:", error.message);
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
  }
};

export const  signInWithGoogle = async () => {
  try{
    const result = await signInWithPopup(auth, googleProvider);
    console.log("User logged in with Google:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error logging in with Google:", error.message);
  }
};

export const signInWithGithub = async () => {
  try{
    const result = await signInWithPopup(auth, githubProvider);
    console.log("User logged in with Github:", result.user);
    return result.user;
  }
  catch (error) {
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
