import React from 'react';
import 'ldrs/hourglass';

const LoadingSpinner = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: 'white'
    }}>
      <l-hourglass
        size="40"
        bg-opacity="0.1"
        speed="1.75"
        color="rgb(181,126,220)" 
      ></l-hourglass>
    </div>
  );
};

export default LoadingSpinner; 