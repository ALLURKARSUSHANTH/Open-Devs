import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from './firebase/firebaseConfig'; 
import NavBar from './components/NavBar';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import { Provider } from 'react-redux';
import store from './reduxState/store';
import Profile from './pages/Profile';

const About = () => <h2>About</h2>;
const Contact = () => <h2>Contact</h2>;

function App() {
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
          path="/about"
          element={user ? <About /> : <Navigate to="/signin" />}
        />
        <Route
          path="/contact"
          element={user ? <Contact /> : <Navigate to="/signin" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/signin" />}
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

export default App;
