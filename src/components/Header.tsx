'use client';

import { useState } from 'react';
import { ChevronDown, Globe, User, LogOut, Calendar, ShoppingCart } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingLink } from './LoadingLink';
import NotificationIcon from './NotificationIcon';

export default function Header() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { language, setLanguage, t, languageNames } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <LoadingLink href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              LocalSpark
            </LoadingLink>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#how-it-works" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {t('header.howItWorks')}
            </a>
            <a 
              href="#categories" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {t('header.categories')}
            </a>
            <a 
              href="#cities" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {t('header.cities')}
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
                <span className="hidden sm:inline">{language.toUpperCase()}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {Object.entries(languageNames).map(([code, name]) => (
                    <button
                      key={code}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        language === code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                      onClick={() => {
                        setLanguage(code as any);
                        setIsLanguageOpen(false);
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authentication */}
            {status === 'loading' ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                {/* Notification Icon */}
                <NotificationIcon />
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">{session.user?.name || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{session.user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      <LoadingLink
                        href="/dashboard/provider"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('header.providerDashboard')}
                      </LoadingLink>
                      
                      {/* Customer Orders/Appointments Section */}
                      <div className="border-t border-gray-100 my-1"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">My Activity</p>
                      </div>
                      <LoadingLink
                        href="/dashboard/bookings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>My Appointments</span>
                      </LoadingLink>
                      <LoadingLink
                        href="/dashboard/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>My Orders</span>
                      </LoadingLink>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('header.signOut')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => signIn()}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  {t('header.signIn')}
                </button>
                <Link
                  href="/dashboard/provider"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {t('header.listService')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}