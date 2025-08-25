'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, CheckCircle, Users, Shield, MessageCircle, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const benefits = [
    {
      icon: Users,
      title: t('signup.benefits.customers.title'),
      description: t('signup.benefits.customers.description')
    },
    {
      icon: Shield,
      title: t('signup.benefits.trust.title'),
      description: t('signup.benefits.trust.description')
    },
    {
      icon: MessageCircle,
      title: t('signup.benefits.communication.title'),
      description: t('signup.benefits.communication.description')
    },
    {
      icon: Star,
      title: t('signup.benefits.reputation.title'),
      description: t('signup.benefits.reputation.description')
    }
  ];

  const steps = [
    {
      number: 1,
      title: t('signup.steps.step1.title'),
      description: t('signup.steps.step1.description')
    },
    {
      number: 2,
      title: t('signup.steps.step2.title'),
      description: t('signup.steps.step2.description')
    },
    {
      number: 3,
      title: t('signup.steps.step3.title'),
      description: t('signup.steps.step3.description')
    },
    {
      number: 4,
      title: t('signup.steps.step4.title'),
      description: t('signup.steps.step4.description')
    }
  ];

  const handleSignUp = () => {
    signIn('google', { callbackUrl: '/dashboard/provider' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.backToHome')}
        </button>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('signup.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('signup.hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleSignUp}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-lg font-semibold"
            >
              <span>{t('signup.getStarted')}</span>
              <ArrowRight className="w-5 h-5 rtl-flip" />
            </button>
            
            <Link 
              href="/help"
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-2"
            >
              <span>{t('signup.learnMore')}</span>
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('signup.benefits.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('signup.howItWorks')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-400 rtl-flip" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('signup.requirements.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('signup.requirements.basic.title')}
              </h3>
              <ul className="space-y-3">
                {[
                  t('signup.requirements.basic.item1'),
                  t('signup.requirements.basic.item2'),
                  t('signup.requirements.basic.item3'),
                  t('signup.requirements.basic.item4')
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('signup.requirements.recommended.title')}
              </h3>
              <ul className="space-y-3">
                {[
                  t('signup.requirements.recommended.item1'),
                  t('signup.requirements.recommended.item2'),
                  t('signup.requirements.recommended.item3'),
                  t('signup.requirements.recommended.item4')
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            {t('signup.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('signup.cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleSignUp}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 text-lg font-semibold"
            >
              <span>{t('signup.startToday')}</span>
              <ArrowRight className="w-5 h-5 rtl-flip" />
            </button>
            
            <Link 
              href="/contact"
              className="text-white hover:text-gray-200 transition-colors flex items-center space-x-2 border border-white/30 px-6 py-3 rounded-lg hover:border-white/50"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t('signup.haveQuestions')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}