'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
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
            {t('privacy.title')}
          </h1>
          <p className="text-gray-600">
            {t('privacy.lastUpdated')}: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.introduction.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.introduction.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.dataCollection.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.dataCollection.content')}
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t('privacy.dataCollection.item1')}</li>
                <li>{t('privacy.dataCollection.item2')}</li>
                <li>{t('privacy.dataCollection.item3')}</li>
                <li>{t('privacy.dataCollection.item4')}</li>
                <li>{t('privacy.dataCollection.item5')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.dataUsage.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.dataUsage.content')}
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t('privacy.dataUsage.item1')}</li>
                <li>{t('privacy.dataUsage.item2')}</li>
                <li>{t('privacy.dataUsage.item3')}</li>
                <li>{t('privacy.dataUsage.item4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.dataSharing.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.dataSharing.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.dataSecurity.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.dataSecurity.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.cookies.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.cookies.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.userRights.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.userRights.content')}
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t('privacy.userRights.item1')}</li>
                <li>{t('privacy.userRights.item2')}</li>
                <li>{t('privacy.userRights.item3')}</li>
                <li>{t('privacy.userRights.item4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.thirdParty.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.thirdParty.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.changes.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.changes.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('privacy.contact.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('privacy.contact.content')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}