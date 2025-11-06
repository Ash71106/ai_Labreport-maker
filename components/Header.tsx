
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-4 px-4 md:px-6 lg:px-8 border-b border-gray-700/50">
      <div className="container mx-auto">
        <h1 className="text-xl font-bold text-white tracking-wider">
          Magic Writing <span className="text-purple-400">Experience</span>
        </h1>
        <p className="text-sm text-gray-400">Your AI-powered thought partner.</p>
      </div>
    </header>
  );
};
