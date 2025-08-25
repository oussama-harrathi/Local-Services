'use client';

import { Heart, Shield, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-blue-400">LocalSpark</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              {t('footer.brandDescription')}
            </p>
            <div className="flex items-center space-x-1 mt-4 text-sm text-gray-400">
              <span>{t('footer.madeWith')}</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>{t('footer.forCommunities')}</span>
            </div>
          </div>
          
          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/terms" 
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('footer.termsOfService')}</span>
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>{t('footer.privacyPolicy')}</span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/help" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {t('footer.helpCenter')}
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {t('footer.contactUs')}
                </a>
              </li>
              <li>
                <a 
                  href="/signup" 
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                >
                  {t('footer.listYourService')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Marketplace Disclaimer */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-500 mb-1">{t('footer.marketplaceDisclaimer')}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {t('footer.disclaimerText')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} LocalSpark. {t('footer.allRightsReserved')}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>{t('cities.tunisia')}</span>
              <span>•</span>
              <span>{t('cities.hungary')}</span>
              <span>•</span>
              <span>{t('cities.moreCitiesComingSoon')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}