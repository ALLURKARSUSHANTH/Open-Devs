import React from 'react';
import { useState } from 'react';
import Mentee from '../components/Mentee';
import Mentor from '../components/Mentor';
//still working

const Mentoring = () => {
    const [role] = useState('user');
  return (
    <div>
      {role === 'mentor' ? <Mentor /> : <Mentee />}
    </div>
  )
}

export default Mentoring;
