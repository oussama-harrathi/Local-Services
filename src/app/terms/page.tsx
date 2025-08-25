'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const { t } = useLanguage();
  const router = useRouter();

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
            {t('terms.title')}
          </h1>
          <p className="text-gray-600">
            {t('terms.lastUpdated')}: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('terms.acceptance.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('terms.acceptance.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('terms.serviceDescription.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('terms.serviceDescription.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('terms.userResponsibilities.title')}
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t('terms.userResponsibilities.item1')}</li>
                <li>{t('terms.userResponsibilities.item2')}</li>
                <li>{t('terms.userResponsibilities.item3')}</li>
                <li>{t('terms.userResponsibilities.item4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('terms.providerResponsibilities.title')}
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t('terms.providerResponsibilities.item1')}</li>
                <li>{t('terms.providerResponsibilities.item2')}</li>
                <li>{t('terms.providerResponsibilities.item3')}</li>
                <li>{t('terms.providerResponsibilities.item4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('terms.disclaimer.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('terms.disclaimer.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('terms.limitation.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('terms.limitation.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('terms.termination.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('terms.termination.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('terms.changes.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('terms.changes.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('terms.contact.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('terms.contact.content')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}