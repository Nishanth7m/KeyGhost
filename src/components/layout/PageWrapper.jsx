import React from 'react';

const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default PageWrapper;
