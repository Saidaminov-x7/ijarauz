// config/puck.config.tsx
// Puck конфигурация для публичного рендерера Next.js сайта Ijarauz

import React from 'react';
import type { Config } from '@measured/puck';
import Link from 'next/link';

export type PuckProps = {
  HeroSearch: {
    title: string;
    subtitle: string;
    showSearch: boolean;
    searchPlaceholder: string;
    badgeText?: string;
  };
  Benefits: {
    title: string;
    item1Title: string;
    item1Text: string;
    item2Title: string;
    item2Text: string;
    item3Title: string;
    item3Text: string;
  };
  PopularListings: {
    title: string;
    subtitle: string;
    limit: number;
    viewAllText: string;
  };
  CtaBanner: {
    title: string;
    text: string;
    buttonText: string;
    buttonLink: string;
  };
  Categories: {
    title: string;
  };
  TextBlock: {
    title: string;
    content: string;
    align: 'left' | 'center' | 'right';
  };
  FaqAccordion: {
    title: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
  };
  ContactInfo: {
    title: string;
    email: string;
    phone: string;
    address: string;
  };
};

export const puckConfig: Config<PuckProps> = {
  components: {
    HeroSearch: {
      label: 'Главный баннер с поиском',
      fields: {
        title: { type: 'text', label: 'Главный заголовок' },
        subtitle: { type: 'textarea', label: 'Подзаголовок' },
        badgeText: { type: 'text', label: 'Бейдж (опционально)' },
        searchPlaceholder: { type: 'text', label: 'Плейсхолдер поиска' },
        showSearch: {
          type: 'radio',
          label: 'Показывать строку поиска',
          options: [
            { label: 'Да', value: true },
            { label: 'Нет', value: false },
          ],
        },
      },
      defaultProps: {
        title: 'Аренда жилья в Узбекистане без посредников',
        subtitle: 'Найдите идеальную квартиру, дом или комнату напрямую от собственников',
        badgeText: '✨ Проверенные собственники',
        searchPlaceholder: 'Район, метро, улица или город...',
        showSearch: true,
      },
      render: ({ title, subtitle, badgeText, searchPlaceholder, showSearch }) => (
        <section className="py-12 md:py-16 px-4 text-center max-w-4xl mx-auto">
          {badgeText && (
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              {badgeText}
            </span>
          )}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-stone-900 dark:text-white">
            {title}
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          {showSearch && (
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full sm:flex-1 bg-transparent px-4 py-2.5 outline-none text-stone-900 dark:text-white placeholder:text-stone-400 text-sm"
              />
              <Link
                href="/ru/catalog"
                className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition text-center"
              >
                Найти
              </Link>
            </div>
          )}
        </section>
      ),
    },

    Benefits: {
      label: 'Преимущества платформы',
      fields: {
        title: { type: 'text', label: 'Заголовок секции' },
        item1Title: { type: 'text', label: 'Преимущество 1 — Заголовок' },
        item1Text: { type: 'textarea', label: 'Преимущество 1 — Описание' },
        item2Title: { type: 'text', label: 'Преимущество 2 — Заголовок' },
        item2Text: { type: 'textarea', label: 'Преимущество 2 — Описание' },
        item3Title: { type: 'text', label: 'Преимущество 3 — Заголовок' },
        item3Text: { type: 'textarea', label: 'Преимущество 3 — Описание' },
      },
      defaultProps: {
        title: 'Почему выбирают ijarauz',
        item1Title: 'Прямой контакт с собственниками',
        item1Text: 'Все объявления проходят модерацию. Никаких скрытых комиссий риелторов.',
        item2Title: 'Удобный поиск по карте',
        item2Text: 'Выбирайте жилье рядом с работой, учебой или станциями метро.',
        item3Title: 'Безопасное общение',
        item3Text: 'Встроенный чат с проверкой истории и защитой от спама и мошенников.',
      },
      render: ({ title, item1Title, item1Text, item2Title, item2Text, item3Title, item3Text }) => (
        <section className="py-12 px-4 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-stone-900 dark:text-white">
            {title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 text-xl">
                🛡️
              </div>
              <h3 className="font-bold text-lg mb-2 text-stone-900 dark:text-white">{item1Title}</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">{item1Text}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 text-xl">
                🗺️
              </div>
              <h3 className="font-bold text-lg mb-2 text-stone-900 dark:text-white">{item2Title}</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">{item2Text}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 text-xl">
                💬
              </div>
              <h3 className="font-bold text-lg mb-2 text-stone-900 dark:text-white">{item3Title}</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">{item3Text}</p>
            </div>
          </div>
        </section>
      ),
    },

    PopularListings: {
      label: 'Популярные предложения',
      fields: {
        title: { type: 'text', label: 'Заголовок' },
        subtitle: { type: 'text', label: 'Подзаголовок' },
        viewAllText: { type: 'text', label: 'Текст ссылки на каталог' },
        limit: {
          type: 'select',
          label: 'Количество карточек',
          options: [
            { label: '3 объявления', value: 3 },
            { label: '6 объявлений', value: 6 },
            { label: '9 объявлений', value: 9 },
          ],
        },
      },
      defaultProps: {
        title: 'Популярные предложения',
        subtitle: 'Свежие проверенные варианты аренды',
        viewAllText: 'Смотреть все',
        limit: 6,
      },
      render: ({ title, subtitle, viewAllText, limit }) => (
        <section className="py-12 px-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white">{title}</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
            </div>
            <Link href="/ru/catalog" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              {viewAllText} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(Number(limit) || 3)].map((_, i) => (
              <Link
                key={i}
                href="/ru/catalog"
                className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="h-48 bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 text-sm">
                  🏢 Квартира в центре Ташкента
                </div>
                <div className="p-4 space-y-1.5">
                  <h4 className="font-semibold text-stone-900 dark:text-white group-hover:text-teal-600 transition-colors">
                    2-комнатная квартира, 65 м²
                  </h4>
                  <p className="text-xs text-stone-500">Юнусабадский район, метро Шахристан</p>
                  <div className="pt-2 font-bold text-stone-900 dark:text-white text-lg">
                    4 500 000 сум / мес
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ),
    },

    CtaBanner: {
      label: 'Баннер сдачи жилья (CTA)',
      fields: {
        title: { type: 'text', label: 'Заголовок' },
        text: { type: 'textarea', label: 'Описание' },
        buttonText: { type: 'text', label: 'Текст на кнопке' },
        buttonLink: { type: 'text', label: 'Ссылка кнопки' },
      },
      defaultProps: {
        title: 'Сдайте жильё выгодно и быстро',
        text: 'Разместите объявление бесплатно за 2 минуты и найдите надежных арендаторов уже сегодня',
        buttonText: 'Разместить объявление',
        buttonLink: '/ru/add-listing',
      },
      render: ({ title, text, buttonText, buttonLink }) => (
        <section className="py-12 px-4 max-w-6xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">{title}</h2>
              <p className="text-teal-50 opacity-90 text-sm md:text-base">{text}</p>
            </div>
            <Link
              href={buttonLink}
              className="px-8 py-3.5 bg-white text-teal-800 font-bold rounded-2xl shadow-lg hover:bg-stone-50 transition shrink-0"
            >
              {buttonText}
            </Link>
          </div>
        </section>
      ),
    },

    Categories: {
      label: 'Категории жилья',
      fields: {
        title: { type: 'text', label: 'Заголовок' },
      },
      defaultProps: {
        title: 'Категории недвижимости',
      },
      render: ({ title }) => (
        <section className="py-12 px-4 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-stone-900 dark:text-white text-center">{title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { icon: '🔑', label: 'Посуточно', href: '/ru/catalog?rental_type=daily' },
              { icon: '🏢', label: 'Новостройки', href: '/ru/catalog?building_type=new' },
              { icon: '✨', label: 'Элитные', href: '/ru/catalog?class=elite' },
              { icon: '🎓', label: 'Студентам', href: '/ru/catalog?for_whom=students' },
              { icon: '🏡', label: 'Долгосрочно', href: '/ru/catalog?rental_type=long' },
              { icon: '🛋️', label: 'Студии', href: '/ru/catalog?type_apartments=studio' },
            ].map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center hover:border-teal-500 hover:shadow-sm transition"
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>
      ),
    },

    TextBlock: {
      label: 'Текстовый блок / Описание',
      fields: {
        title: { type: 'text', label: 'Заголовок' },
        content: { type: 'textarea', label: 'Текст' },
        align: {
          type: 'radio',
          label: 'Выравнивание',
          options: [
            { label: 'Слева', value: 'left' },
            { label: 'По центру', value: 'center' },
            { label: 'Справа', value: 'right' },
          ],
        },
      },
      defaultProps: {
        title: 'О нашем сервисе',
        content: 'Ijarauz — это современная национальная платформа аренды жилой и коммерческой недвижимости в Узбекистане.',
        align: 'left',
      },
      render: ({ title, content, align }) => (
        <section className={`py-10 px-4 max-w-4xl mx-auto text-${align}`}>
          {title && <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-white">{title}</h2>}
          <div className="text-base text-stone-600 dark:text-stone-400 whitespace-pre-line leading-relaxed">
            {content}
          </div>
        </section>
      ),
    },

    FaqAccordion: {
      label: 'Вопросы и ответы (FAQ)',
      fields: {
        title: { type: 'text', label: 'Заголовок FAQ' },
        q1: { type: 'text', label: 'Вопрос 1' },
        a1: { type: 'textarea', label: 'Ответ 1' },
        q2: { type: 'text', label: 'Вопрос 2' },
        a2: { type: 'textarea', label: 'Ответ 2' },
        q3: { type: 'text', label: 'Вопрос 3' },
        a3: { type: 'textarea', label: 'Ответ 3' },
      },
      defaultProps: {
        title: 'Часто задаваемые вопросы',
        q1: 'Как разместить объявление?',
        a1: 'Нажмите кнопку «Разместить объявление» в верхнем меню, заполните данные о квартире и прикрепите фотографии.',
        q2: 'Берется ли комиссия с арендаторов?',
        a2: 'Нет! Ijarauz соединяет арендаторов напрямую с проверенными собственниками без комиссий.',
        q3: 'Как связаться с поддержкой?',
        a3: 'Вы можете написать нам через Telegram-бота или на email support@ijarauz.uz.',
      },
      render: ({ title, q1, a1, q2, a2, q3, a3 }) => (
        <section className="py-12 px-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-stone-900 dark:text-white">{title}</h2>
          <div className="space-y-4">
            {[[q1, a1], [q2, a2], [q3, a3]].map(([q, a], idx) => (
              <details key={idx} className="group p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800" open={idx === 0}>
                <summary className="font-semibold text-stone-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                  <span>{q}</span>
                  <span className="text-teal-600 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ),
    },

    ContactInfo: {
      label: 'Контакты и реквизиты',
      fields: {
        title: { type: 'text', label: 'Заголовок' },
        email: { type: 'text', label: 'Email' },
        phone: { type: 'text', label: 'Телефон' },
        address: { type: 'text', label: 'Адрес' },
      },
      defaultProps: {
        title: 'Служба поддержки и контакты',
        email: 'support@ijarauz.uz',
        phone: '+998 71 200-00-00',
        address: 'г. Ташкент, Узбекистан',
      },
      render: ({ title, email, phone, address }) => (
        <section className="py-12 px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-stone-900 dark:text-white">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-xl mb-2 block">📧</span>
              <div className="text-xs text-stone-500 mb-1">Email</div>
              <div className="font-semibold text-stone-900 dark:text-white">{email}</div>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-xl mb-2 block">📞</span>
              <div className="text-xs text-stone-500 mb-1">Телефон</div>
              <div className="font-semibold text-stone-900 dark:text-white">{phone}</div>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-xl mb-2 block">📍</span>
              <div className="text-xs text-stone-500 mb-1">Офис</div>
              <div className="font-semibold text-stone-900 dark:text-white">{address}</div>
            </div>
          </div>
        </section>
      ),
    },
  },
};
