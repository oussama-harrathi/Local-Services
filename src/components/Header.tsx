'use client';

import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

export default function Header() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              LocalSpark
            </a>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#how-it-works" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              How it works
            </a>
            <a 
              href="#categories" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Categories
            </a>
            <a 
              href="#cities" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Cities
            </a>
          </nav>

          {/* Right side - Language switcher and CTA */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                aria-label="Select language"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">EN</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    English
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Français
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    العربية
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Magyar
                  </button>
                </div>
              )}
            </div>

            {/* List your service CTA */}
            <a
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              List your service
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}