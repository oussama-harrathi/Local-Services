'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, ChevronDown, ChevronUp, Search, MessageCircle, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { LoadingLink } from '@/components/LoadingLink';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HelpPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqCategories = [
    {
      title: t('help.gettingStarted.title'),
      icon: Users,
      faqs: [
        {
          question: t('help.gettingStarted.faq1.question'),
          answer: t('help.gettingStarted.faq1.answer')
        },
        {
          question: t('help.gettingStarted.faq2.question'),
          answer: t('help.gettingStarted.faq2.answer')
        },
        {
          question: t('help.gettingStarted.faq3.question'),
          answer: t('help.gettingStarted.faq3.answer')
        }
      ]
    },
    {
      title: t('help.forProviders.title'),
      icon: Shield,
      faqs: [
        {
          question: t('help.forProviders.faq1.question'),
          answer: t('help.forProviders.faq1.answer')
        },
        {
          question: t('help.forProviders.faq2.question'),
          answer: t('help.forProviders.faq2.answer')
        },
        {
          question: t('help.forProviders.faq3.question'),
          answer: t('help.forProviders.faq3.answer')
        }
      ]
    },
    {
      title: t('help.safety.title'),
      icon: Shield,
      faqs: [
        {
          question: t('help.safety.faq1.question'),
          answer: t('help.safety.faq1.answer')
        },
        {
          question: t('help.safety.faq2.question'),
          answer: t('help.safety.faq2.answer')
        },
        {
          question: t('help.safety.faq3.question'),
          answer: t('help.safety.faq3.answer')
        }
      ]
    }
  ];

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.backToHome')}
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('help.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('help.subtitle')}
          </p>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('help.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <LoadingLink href="/contact" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <MessageCircle className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('help.contactSupport')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('help.contactSupportDesc')}
            </p>
          </LoadingLink>
          
          <LoadingLink href="/signup" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('help.becomeProvider')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('help.becomeProviderDesc')}
            </p>
          </LoadingLink>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Shield className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('help.safetyFirst')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('help.safetyFirstDesc')}
            </p>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {(searchQuery ? filteredFaqs : faqCategories).map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {category.title}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 10 + faqIndex;
                    const isOpen = openFaq === globalIndex;
                    
                    return (
                      <div key={faqIndex} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Still Need Help */}
        <div className="bg-blue-50 rounded-lg p-8 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t('help.stillNeedHelp')}
          </h3>
          <p className="text-gray-700 mb-6">
            {t('help.stillNeedHelpDesc')}
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t('help.contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
}