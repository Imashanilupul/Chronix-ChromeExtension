import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Popup() {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('Popup mounted, redirecting to /home');
    navigate('/home');
  }, [navigate]);

  return <div>Loading...</div>;
}