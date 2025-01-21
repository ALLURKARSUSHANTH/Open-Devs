import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from '../firebase/firebaseConfig'; 
import NavBar from './NavBar';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import { Provider } from 'react-redux';
import store from '../reduxState/store';
import Post from '../components/post';

function AppRoutes() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); 
    }); 

    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
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
          path="/signin"
          element={!user ? <SignIn /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUp /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
    </Provider>
  );
}

export default AppRoutes;
