import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setUserProfile,
  clearUserProfile,
} from "../reduxState/actions/authActions";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import NavBar from "./NavBar";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Post from "../components/Post";
import axios from "axios";
import Mentoring from "../pages/Mentoring";
import Chat from "../components/Chat";
import VideoStream from "./VideoStream";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PasswordResetPage from "../pages/PasswordResetPage";

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [dailyLoginChecked, setDailyLoginChecked] = useState(false);
  const dispatch = useDispatch();
  const API_URL = import.meta.env.VITE_API_URL;

  // Function to handle daily login bonus
  const checkDailyLogin = async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/users/daily-login`, { 
        userId 
      });
      
      if (response.data.bonusAwarded) {
        toast.success(`Daily login bonus awarded! +${response.data.pointsAdded} points`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          paddinngBottom: 1000,
        });
        
        // Update user profile in Redux if needed
        if (response.data.updatedUser) {
          dispatch(setUserProfile({
            ...response.data.updatedUser,
            points: response.data.updatedUser.points,
            level: response.data.updatedUser.level
          }));
        }
      }
    } catch (error) {
      console.error("Error checking daily login:", error);
    } finally {
      setDailyLoginChecked(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        dispatch(
          setUserProfile({
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          }),
        );

        try {
          // Save/update user in backend
          const userResponse = await axios.post(`${API_URL}/users/firebase`, {
            _id: firebaseUser.uid,
            displayName: firebaseUser.displayName || "User",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || "",
          });

          // Check for daily login bonus after user is confirmed in backend
          if (userResponse.data.success) {
            await checkDailyLogin(firebaseUser.uid);
          }
        } catch (error) {
          console.error(
            "Failed to save user to backend:",
            error.response?.data || error.message,
          );
        }
      } else {
        setDailyLoginChecked(false);
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      {user && <NavBar />}

      <Routes>
        <Route 
          path="/" 
          element={user ? <Home /> : <Navigate to="/signin" />}
        />

        <Route
          path="/profile/:uid"
          element={user ? <Profile /> : <Navigate to="/signin" />}
        />
        <Route
          path="/post"
          element={user ? <Post /> : <Navigate to="/signin" />}
        />
        <Route
          path="/mentoring"
          element={user ? <Mentoring /> : <Navigate to="/signin" />}
        />
        <Route
          path="/stream"
          element={
            user ? <VideoStream userId={user.uid} /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/signin" />}
        />
        <Route
          path="/signin"
          element={!user ? <SignIn /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUp /> : <Navigate to="/" />}
        />
        <Route
          path="/resetpassword"
          element={<PasswordResetPage />}
        />
      </Routes>
    </Router>
  );
}

export default AppRoutes;