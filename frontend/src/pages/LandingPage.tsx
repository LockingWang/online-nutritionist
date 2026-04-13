/**
 * 公開 Landing Page
 * 提供搜尋引擎可索引內容與登入入口
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiBarChart2, FiMessageCircle } from 'react-icons/fi';
import { Logo } from '../components/common';
import { ROUTES } from '../constants/routes';

const featureCards = [
  {
    icon: <FiShield className="h-6 w-6 text-emerald-600" />,
    title: '紀錄安全',
    description: '使用個人帳號保存每日飲食與營養資料，跨裝置同步查看。',
  },
  {
    icon: <FiBarChart2 className="h-6 w-6 text-emerald-600" />,
    title: '即時統計',
    description: '從週/月趨勢掌握熱量與營養攝取，快速看見飲食變化。',
  },
  {
    icon: <FiMessageCircle className="h-6 w-6 text-emerald-600" />,
    title: 'AI 協助',
    description: '透過 AI 營養功能獲得建議，讓飲食規劃更有效率。',
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo showText subtitle="智慧營養管理平台" />
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700"
        >
          登入
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-14">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Nutrition Management
            </p>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              更輕鬆地管理每日飲食與健康目標
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              透過飲食記錄、營養分析與 AI 協助，一站式掌握你的飲食習慣。先登入開始使用完整功能。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700"
              >
                立即登入
                <FiArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-emerald-600 px-6 py-3 text-base font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                建立帳戶
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900">平台亮點</h2>
            <div className="mt-6 space-y-5">
              {featureCards.map((feature) => (
                <article key={feature.title} className="flex gap-4">
                  <div className="mt-1 rounded-lg bg-emerald-50 p-2">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-1 text-gray-600">{feature.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
