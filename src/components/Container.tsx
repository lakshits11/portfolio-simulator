import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl p-5 bg-white shadow-md rounded-lg m-5">
        {children}
      </div>
    </div>
  );
}; 