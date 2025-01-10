import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged from Firebase
import { auth } from './firebase/firebaseConfig'; // Import Firebase authentication instance
import NavBar from './components/NavBar';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';

const About = () => <h2>About</h2>;
const Contact = () => <h2>Contact</h2>;

function App() {
  const [user, setUser] = useState(null); // Track the user authentication state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Update user state when auth state changes
    });

    // Cleanup listener when component is unmounted
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      {user && <NavBar />}

      <Routes>
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/signin" />}
        />
        <Route
          path="/about"
          element={user ? <About /> : <Navigate to="/signin" />}
        />
        <Route
          path="/contact"
          element={user ? <Contact /> : <Navigate to="/signin" />}
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

export default App;
