import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserProfile,clearUserProfile } from '../reduxState/actions/authActions';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from '../firebase/firebaseConfig'; 
import NavBar from './NavBar';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Post from '../components/Post';
import axios from 'axios';
import Mentoring from '../pages/Mentoring';

function AppRoutes() {
  const [user, setUser] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        
        dispatch(setUserProfile({
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        }));

        try {
          await axios.post("http://localhost:5000/users/firebase", {
            _id: firebaseUser.uid,
            displayName: firebaseUser.displayName || "User",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || "",
          });
        } catch (error) {
          console.error("Failed to save user to backend:", error.response?.data || error.message);
        }
      } else {
        dispatch(clearUserProfile());
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
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/signin" />}
        />
        <Route
          path="/post"
          element={user ? <Post /> : <Navigate to="/signin" />}
        />

        <Route
          path="/mentoring"
          element={user ? <Mentoring/> : <Navigate to="/signin" />}
        />

        <Route
          path="/signin"
          element={!user ? <SignIn /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUp /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
