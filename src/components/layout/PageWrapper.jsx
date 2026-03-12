import React from 'react';
import MatrixRain from '../effects/MatrixRain';

const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <MatrixRain />
      <div className="cyber-grid"></div>
      <div className="crt-overlay"></div>
      <div className="scanline"></div>
      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>
    </div>
  );
};

export default PageWrapper;
