import React from 'react';
import { CheckSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary-500 rounded-full text-white">
              <CheckSquare className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Todo App</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A modern, responsive todo application built with React, TypeScript, and Express.
            Manage your tasks efficiently with a clean, intuitive interface.
          </p>
        </header>

        {/* Main content */}
        <main className="space-y-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-sm text-gray-600">
            <span>Built with</span>
            <span className="font-semibold text-primary-600">React</span>
            <span>•</span>
            <span className="font-semibold text-blue-600">TypeScript</span>
            <span>•</span>
            <span className="font-semibold text-green-600">Express</span>
            <span>•</span>
            <span className="font-semibold text-cyan-600">Tailwind CSS</span>
          </div>
        </footer>
      </div>
    </div>
  );
};