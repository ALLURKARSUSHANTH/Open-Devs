import React from 'react';
import { useState, useEffect} from 'react';
import Mentee from '../components/Mentee';
import Mentor from '../components/Mentor';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
//still working

const Mentoring = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoggedInUserId(user?.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!loggedInUserId) return;
      try {
        const response = await axios.get(`http://localhost:5000/users/firebase/${loggedInUserId}`);
        setRole(response.data.role);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching role');
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUserId) fetchRole();
  }, [loggedInUserId]);

  return (
    <div>
      {role === 'mentor' ? <Mentor /> : <Mentee />}
    </div>
  )
}

export default Mentoring;
