'use client';

import { Heart, Shield, FileText } from 'lucide-react';

export default function Footer() {
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
              Connecting communities with trusted local service providers. 
              Find authentic experiences and support local businesses in Tunisia and Hungary.
            </p>
            <div className="flex items-center space-x-1 mt-4 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for local communities</span>
            </div>
          </div>
          
          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/terms" 
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/help" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="/signup" 
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                >
                  List your service
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
                <h4 className="text-sm font-semibold text-yellow-500 mb-1">Marketplace Disclaimer</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  LocalSpark is a platform that connects people with local service providers. 
                  We do not employ these providers directly. All providers are independent contractors 
                  responsible for their own qualifications, licensing, insurance, and tax obligations. 
                  Please verify credentials and discuss terms directly with providers before engaging their services.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} LocalSpark. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Tunisia</span>
              <span>•</span>
              <span>Hungary</span>
              <span>•</span>
              <span>More cities coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}