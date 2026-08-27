'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  MessageSquare, Sparkles, Send, Bot, User as UserIcon,
  ChevronRight, ArrowLeft, ShieldCheck, MapPin, Building,
  DollarSign, SlidersHorizontal, CheckCircle2, Search, Pin,
  Phone, MoreVertical, Check, CheckCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Apartment } from '@/types';
import { getApartments } from '@/lib/api';

interface Message {
  id: string;
  sender: 'ai' | 'user' | 'peer';
  text: string;
  timestamp: string;
  matchedListings?: Apartment[];
  appliedFilters?: Record<string, string>;
  quickReplies?: string[];
}

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  isAi?: boolean;
  isPinned?: boolean;
  online?: boolean;
  listingTitle?: string;
}

// Contacts: only the AI Assistant is active. Peer-to-peer chats require backend chat endpoints.
// TODO: Connect real peer-to-peer chat conversations via backend ChatMessage API (/chat/conversations)
const INITIAL_CONTACTS: ChatContact[] = [
  {
    id: 'ai-assistant',
    name: 'ijara AI Ассистент',
    lastMessage: 'Нажмите, чтобы подобрать квартиру или комнату',
    time: 'Сейчас',
    isAi: true,
    isPinned: true,
    online: true,
  },
];

// ─── Multilingual AI Knowledge Base ─────────────────────────────────────────

type LangMsg = { ru: string; uz: string; en: string };

const KNOWLEDGE_BASE: Array<{ keywords: string[]; response: LangMsg; quickReplies: LangMsg }> = [
  {
    keywords: ['привет', 'здравствуй', 'салам', 'hi', 'hello', 'добрый день', 'добрый вечер', 'доброе утро', 'ассалому алейкум', 'как дела', 'salom', 'assalomu alaykum', 'xayr', 'good', 'hey'],
    response: {
      ru: 'Здравствуйте! Я умный AI-ассистент ijara.uz. Напишите, какое жилье вы ищете (например: «Студенту в Юнусабаде до $300» или «Посуточно в центре»), и я мгновенно подберу варианты с готовыми фильтрами!',
      uz: 'Salom! Men ijara.uz aqlli AI-yordamchisiman. Qaysi uy-joy izlayotganingizni yozing (masalan: «Talabaga Yunusobodda $300 gacha» yoki «Markazda kunlik»), va men darhol variantlarni topib beraman!',
      en: 'Hello! I\'m the ijara.uz smart AI assistant. Tell me what housing you\'re looking for (e.g. "Student in Yunusabad up to $300" or "Daily rental in center"), and I\'ll instantly find options with ready filters!',
    },
    quickReplies: {
      ru: 'Студенту до $300|2-комнатная в Юнусабаде|Посуточно в центре|Для семьи с детьми',
      uz: 'Talabaga $300 gacha|2 xonali Yunusobodda|Markazda kunlik|Oila uchun',
      en: 'Student up to $300|2-room in Yunusabad|Daily in center|Family with kids',
    },
  },
  {
    keywords: ['разместить', 'подать', 'сдать', 'добавить объявление', 'joylashtir', "e'lon", 'add listing', 'post', 'publish'],
    response: {
      ru: 'Чтобы сдать недвижимость на ijara.uz:\n1. Нажмите «Разместить» в меню\n2. Укажите город, район, параметры и цену\n3. Загрузите фотографии\n4. Нажмите «Опубликовать» — объявление появится сразу!',
      uz: 'ijara.uz da mulk ijaraga berish uchun:\n1. Menyudagi «Joylash» tugmasini bosing\n2. Shahar, tuman, parametrlar va narxni kiriting\n3. Suratlarni yuklang\n4. «E\'lon qilish» tugmasini bosing!',
      en: 'To list a property on ijara.uz:\n1. Click «Add Listing» in the menu\n2. Enter city, district, parameters and price\n3. Upload photos\n4. Click «Publish» — your listing goes live instantly!',
    },
    quickReplies: {
      ru: 'Перейти к размещению|Снять квартиру',
      uz: 'Joylashtirishga o\'tish|Kvartira ijaralayman',
      en: 'Go to listing|Rent apartment',
    },
  },
  {
    keywords: ['верификация', 'телефон', 'смс', 'безопасн', 'tekshir', 'verify', 'sms', 'safe', 'phone'],
    response: {
      ru: 'Все номера телефонов верифицируются через Firebase SMS-код. Объявления с бейджем «Проверено» гарантируют реальность собственника.',
      uz: 'Barcha telefon raqamlar Firebase SMS-kod orqali tasdiqlanadi. «Tasdiqlangan» belgili e\'lonlar haqiqiy egasini kafolatlaydi.',
      en: 'All phone numbers are verified via Firebase SMS code. Listings with the «Verified» badge guarantee a real owner.',
    },
    quickReplies: {
      ru: 'Проверенные квартиры|Каталог жилья',
      uz: 'Tasdiqlangan kvartiralar|Katalog',
      en: 'Verified apartments|Catalog',
    },
  },
  {
    keywords: ['цена', 'стоимость', 'сколько', 'narx', 'qancha', 'price', 'cost', 'how much'],
    response: {
      ru: 'Цены на аренду в Ташкенте: комнаты от $80/мес, 1-комнатные от $150/мес, 2-комнатные от $250/мес. Посуточно: от $20/сутки. Укажите район и бюджет — найду точнее!',
      uz: 'Toshkentda ijara narxlari: xonalar $80/oydan, 1 xonali $150/oydan, 2 xonali $250/oydan. Kunlik: $20/kundan. Tuman va budjetingizni aytng — aniqroq topaman!',
      en: 'Rental prices in Tashkent: rooms from $80/mo, 1-room from $150/mo, 2-room from $250/mo. Daily: from $20/day. Tell me your district and budget for a precise search!',
    },
    quickReplies: {
      ru: 'До $200 в месяц|Посуточно|Квартиры в Ташкенте',
      uz: 'Oyiga $200 gacha|Kunlik|Toshkentda kvartiralar',
      en: 'Up to $200/mo|Daily rental|Apartments in Tashkent',
    },
  },
];

function getLang(locale: string): 'ru' | 'uz' | 'en' {
  if (locale === 'uz') return 'uz';
  if (locale === 'en') return 'en';
  return 'ru';
}

function getAIText(msg: LangMsg, locale: string): string {
  return msg[getLang(locale)];
}

function getQuickRepliesForLang(qr: LangMsg, locale: string): string[] {
  return getAIText(qr, locale).split('|').filter(Boolean);
}

// Rate limiter: max 5 AI messages per 30 seconds
const rateLimitWindow: number[] = [];
function checkRateLimit(): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  // Remove entries older than 30s
  while (rateLimitWindow.length > 0 && now - rateLimitWindow[0] > 30000) {
    rateLimitWindow.shift();
  }
  if (rateLimitWindow.length >= 5) {
    const waitSeconds = Math.ceil((30000 - (now - rateLimitWindow[0])) / 1000);
    return { allowed: false, waitSeconds };
  }
  rateLimitWindow.push(now);
  return { allowed: true, waitSeconds: 0 };
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';
  const user = useAuthStore((s) => s.user);

  const [contacts, setContacts] = useState<ChatContact[]>(INITIAL_CONTACTS);
  const [selectedContactId, setSelectedContactId] = useState<string>('ai-assistant');
  const [searchContact, setSearchContact] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Messages per contact ID
  const [conversations, setConversations] = useState<Record<string, Message[]>>({
    'ai-assistant': [
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Здравствуйте! Я умный AI-ассистент ijara.uz (Демо-режим). Напишите, какое жилье вы ищете (например: "Ищу 1-комнатную студенту возле ТГТУ до $250" или "Посуточно в Самарканде"), и я подберу варианты с точными фильтрами!',
        timestamp: '12:00',
        quickReplies: ['Студенту в Ташкенте до $300', '2-комнатная в Юнусабаде', 'Посуточно в центре', 'Для семьи с детьми'],
      },
    ],
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
  const currentMessages = conversations[selectedContactId] || [];

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages, isTyping, selectedContactId]);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text) return;

    setInputText('');

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), userMsg],
    }));

    // Update last message in contact list
    setContacts((prev) =>
      prev.map((c) => (c.id === selectedContactId ? { ...c, lastMessage: text, time: 'Сейчас' } : c))
    );

    if (selectedContactId !== 'ai-assistant') {
      // Real peer messages are stored locally until real backend API integration (/chat/conversations) is connected
      return;
    }

    // AI Assistant Mode
    setIsTyping(true);

    // ── Rate limit check ──────────────────────────────────────────
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      setTimeout(() => {
        setIsTyping(false);
        const waitMsg: Record<string, string> = {
          ru: `Слишком много запросов. Пожалуйста, подождите ${rateCheck.waitSeconds} сек. перед следующим сообщением.`,
          uz: `Juda ko'p so'rovlar. Iltimos, keyingi xabar yuborishdan oldin ${rateCheck.waitSeconds} soniya kuting.`,
          en: `Too many requests. Please wait ${rateCheck.waitSeconds} seconds before sending another message.`,
        };
        setConversations((prev) => ({
          ...prev,
          'ai-assistant': [
            ...(prev['ai-assistant'] || []),
            {
              id: String(Date.now() + 1),
              sender: 'ai',
              text: waitMsg[locale] || waitMsg.ru,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }));
      }, 200);
      return;
    }

    try {
      const lower = text.toLowerCase();

      // Guardrail: Private information
      if (
        lower.includes('секрет') ||
        lower.includes('парол') ||
        lower.includes('баз данных') ||
        lower.includes('jwt') ||
        lower.includes('api_key') ||
        lower.includes('secret') ||
        lower.includes('private') ||
        lower.includes('токен')
      ) {
        setTimeout(() => {
          setIsTyping(false);
          setConversations((prev) => ({
            ...prev,
            'ai-assistant': [
              ...(prev['ai-assistant'] || []),
              {
                id: String(Date.now() + 1),
                sender: 'ai',
                text: 'Из соображений безопасности я не обсуждаю закрытую служебную информацию платформы. Чем я могу помочь вам в подборе жилья?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          }));
        }, 500);
        return;
      }

      // Check greetings and knowledge base
      for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some((kw) => lower.includes(kw))) {
          setTimeout(() => {
            setIsTyping(false);
            setConversations((prev) => ({
              ...prev,
              'ai-assistant': [
                ...(prev['ai-assistant'] || []),
                {
                  id: String(Date.now() + 1),
                  sender: 'ai',
                  text: getAIText(item.response, locale),
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  quickReplies: getQuickRepliesForLang(item.quickReplies, locale),
                },
              ],
            }));
          }, 600);
          return;
        }
      }

      // Parse Search Filters
      const detectedFilters: Record<string, string> = {};

      if (lower.includes('студент') || lower.includes('студенту') || lower.includes('учеб')) {
        detectedFilters.audience = 'students';
      } else if (lower.includes('семь') || lower.includes('семейн') || lower.includes('дет')) {
        detectedFilters.audience = 'families';
      } else if (lower.includes('девушк') || lower.includes('женщин')) {
        detectedFilters.audience = 'girls';
      }

      if (lower.includes('посуточн') || lower.includes('на день') || lower.includes('на сутки')) {
        detectedFilters.type = 'daily';
      } else if (lower.includes('комнат')) {
        detectedFilters.type = 'room';
      } else if (lower.includes('дом') || lower.includes('коттедж')) {
        detectedFilters.type = 'house';
      } else if (lower.includes('квартир')) {
        detectedFilters.type = 'apartment';
      }

      const cities = ['Ташкент', 'Самарканд', 'Бухара', 'Фергана'];
      for (const c of cities) {
        if (lower.includes(c.toLowerCase())) {
          detectedFilters.city = c;
          break;
        }
      }

      const districts = [
        'Юнусабад', 'Чиланзар', 'Мирабад', 'Яккасарай',
        'Мирзо-Улугбек', 'Шайхантахур', 'Алмазар', 'Сергели', 'Яшнабад'
      ];
      for (const d of districts) {
        if (lower.includes(d.toLowerCase())) {
          detectedFilters.district = `${d}ский`;
          break;
        }
      }

      const priceMatch = lower.match(/(?:до|<|\bне дороже\b)\s*(\d+)/) || lower.match(/(\d+)\s*(?:\$|долл|usd)/);
      if (priceMatch && priceMatch[1]) {
        detectedFilters.maxPrice = priceMatch[1];
      }

      const hasCriteria = Object.keys(detectedFilters).length > 0;

      if (!hasCriteria) {
        setTimeout(() => {
          setIsTyping(false);
          const clarifyMsg: Record<string, string> = {
            ru: 'Уточните, пожалуйста: в каком городе или районе вы ищете жилье, на какой бюджет рассчитываете и кто будет проживать?',
            uz: 'Iltimos, aniqlashtiring: qaysi shahar yoki tumanda uy-joy izlayapsiz, budjeti qancha va kim yashaydi?',
            en: 'Could you clarify: which city or district are you looking in, what is your budget, and who will be living there?',
          };
          const clarifyReplies: Record<string, string[]> = {
            ru: ['Квартиры в Ташкенте', 'Студентам до $200', 'Посуточно в Самарканде'],
            uz: ['Toshkentda kvartiralar', 'Talabaga $200 gacha', 'Samarqandda kunlik'],
            en: ['Apartments in Tashkent', 'For students up to $200', 'Daily in Samarkand'],
          };
          setConversations((prev) => ({
            ...prev,
            'ai-assistant': [
              ...(prev['ai-assistant'] || []),
              {
                id: String(Date.now() + 1),
                sender: 'ai',
                text: clarifyMsg[locale] || clarifyMsg.ru,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                quickReplies: clarifyReplies[locale] || clarifyReplies.ru,
              },
            ],
          }));
        }, 600);
        return;
      }

      // Graceful fetch — catch 500 and use mock data
      let matched: Apartment[] = [];
      try {
        matched = await getApartments(locale, undefined, {
          city: detectedFilters.city,
          district: detectedFilters.district,
          type: detectedFilters.type,
          audience: detectedFilters.audience,
          forStudents: detectedFilters.audience === 'students',
          maxPrice: detectedFilters.maxPrice ? Number(detectedFilters.maxPrice) : undefined,
        });
      } catch {
        // getApartments already falls back to mock on error, but catch any remaining edge cases
        matched = [];
      }

      const topMatches = matched.slice(0, 3);

      setTimeout(() => {
        setIsTyping(false);
        const count = topMatches.length;
        const foundMsg: Record<string, string> = {
          ru: count > 0
            ? `Я подобрал ${count} ${count === 1 ? 'вариант' : count < 5 ? 'варианта' : 'вариантов'} по вашему запросу:`
            : 'По этим критериям точных совпадений сейчас нет, но вы можете расширить фильтры в каталоге:',
          uz: count > 0
            ? `Men sizning so'rovingiz bo'yicha ${count} ta variant topdim:`
            : "Bu mezonlar bo'yicha hozir aniq mos keladigan variant yo'q, lekin katalogda filtrlarni kengaytiring:",
          en: count > 0
            ? `I found ${count} option${count === 1 ? '' : 's'} matching your request:`
            : 'No exact matches for these criteria right now, but you can expand filters in the catalog:',
        };
        const replyChoices: Record<string, string[]> = {
          ru: ['Показать все объявления', 'Изменить бюджет', 'Искать в другом районе'],
          uz: ['Barcha e\'lonlarni ko\'rish', 'Budjetni o\'zgartirish', 'Boshqa tumanda qidirish'],
          en: ['Show all listings', 'Change budget', 'Search in another area'],
        };

        setConversations((prev) => ({
          ...prev,
          'ai-assistant': [
            ...(prev['ai-assistant'] || []),
            {
              id: String(Date.now() + 1),
              sender: 'ai',
              text: foundMsg[locale] || foundMsg.ru,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              matchedListings: topMatches.length > 0 ? topMatches : undefined,
              appliedFilters: detectedFilters,
              quickReplies: replyChoices[locale] || replyChoices.ru,
            },
          ],
        }));
      }, 800);
    } catch (e) {
      setIsTyping(false);
      const errorMsg: Record<string, string> = {
        ru: 'Произошла небольшая заминка при поиске. Попробуйте ещё раз.',
        uz: 'Qidiruv vaqtida kichik muammo yuz berdi. Qayta urinib ko\'ring.',
        en: 'A small hiccup occurred during search. Please try again.',
      };
      setConversations((prev) => ({
        ...prev,
        'ai-assistant': [
          ...(prev['ai-assistant'] || []),
          {
            id: String(Date.now() + 1),
            sender: 'ai',
            text: errorMsg[locale] || errorMsg.ru,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
    }
  };

  const applyFiltersToCatalog = (filters: Record<string, string>) => {
    const qs = new URLSearchParams(filters).toString();
    router.push(`/${locale}/catalog?${qs}`);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-80px)] w-full bg-stone-100 dark:bg-[#0F0F0F] flex overflow-hidden">
      {/* Telegram-style 2-column Container: 100% width, 100% height */}
      <div className="flex h-full w-full max-w-full overflow-hidden">

        {/* LEFT COLUMN: Dialogs List (Telegram-style Sidebar) */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col border-r border-stone-200 bg-white dark:border-white/10 dark:bg-[#1A1A1A] transition-all duration-300 ${selectedContactId ? 'hidden md:flex' : 'flex'
            }`}
        >
          {/* Header with Search */}
          <div className="p-3 border-b border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-[#1E1E1E]">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-teal-600 dark:text-teal-400" />
                Сообщения
              </h2>
              <span className="text-xs text-stone-400 font-medium">
                {contacts.length} чатов
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder="Поиск по чатам..."
                className="h-9 w-full rounded-xl border border-stone-200 bg-stone-100/80 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-400 outline-none focus:border-teal-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          {/* Dialog list */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-white/5">
            {filteredContacts.map((contact) => {
              const active = selectedContactId === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors relative ${active
                      ? 'bg-teal-50/80 dark:bg-teal-950/40'
                      : 'hover:bg-stone-50 dark:hover:bg-white/5'
                    }`}
                >
                  {/* Pinned badge */}
                  {contact.isPinned && (
                    <div className="absolute top-2 right-2 text-stone-400">
                      <Pin size={12} className="fill-stone-400 text-stone-400 rotate-45" />
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {contact.isAi ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
                        <Bot size={24} />
                      </div>
                    ) : contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-200 dark:bg-white/10 text-stone-600 dark:text-stone-300 font-bold">
                        {contact.name.charAt(0)}
                      </div>
                    )}
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1A1A1A]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`text-sm font-semibold truncate ${active ? 'text-teal-700 dark:text-teal-300' : 'text-stone-900 dark:text-white'}`}>
                        {contact.name}
                      </h3>
                      <span className="text-[10px] text-stone-400 shrink-0 ml-2">
                        {contact.time}
                      </span>
                    </div>

                    {contact.listingTitle && (
                      <p className="text-[10px] font-medium text-teal-600 dark:text-teal-400 truncate mb-0.5">
                        {contact.listingTitle}
                      </p>
                    )}

                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {contact.lastMessage}
                    </p>
                  </div>

                  {contact.unread && !active ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shrink-0">
                      {contact.unread}
                    </span>
                  ) : null}
                </div>
              );
            })}

            {filteredContacts.length === 1 && !searchContact && (
              <div className="p-6 text-center text-xs text-stone-400">
                <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
                <p className="font-medium text-stone-600 dark:text-stone-300 mb-1">Личные сообщения</p>
                <p className="text-[11px] text-stone-400">
                  У вас пока нет активных диалогов с собственниками. Когда вы напишете по объявлению, чат появится здесь.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Area (Opened Chat) */}
        <div
          className={`flex-1 flex flex-col bg-stone-50/50 dark:bg-[#141414] min-w-0 ${selectedContactId ? 'flex' : 'hidden md:flex'
            }`}
        >
          {selectedContact ? (
            <>
              {/* Chat Top Header */}
              <div className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6 dark:border-white/10 dark:bg-[#1A1A1A] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedContactId('')}
                    className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div className="relative shrink-0">
                    {selectedContact.isAi ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                        <Bot size={20} />
                      </div>
                    ) : selectedContact.avatar ? (
                      <img
                        src={selectedContact.avatar}
                        alt={selectedContact.name}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-200 dark:bg-white/10 font-bold">
                        {selectedContact.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate flex items-center gap-1.5">
                      {selectedContact.name}
                      {selectedContact.isPinned && (
                        <span className="rounded-md bg-teal-50 px-1.5 py-0.2 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                          Закреплено
                        </span>
                      )}
                      {selectedContact.isAi && (
                        <span className="rounded-md bg-amber-50 px-1.5 py-0.2 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                          Демо
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {selectedContact.isAi ? 'Умный ассистент (демо-режим) • Поиск жилья по параметрам' : selectedContact.online ? 'в сети' : 'был(а) недавно'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedContact.isAi ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                      <ShieldCheck size={14} />
                      <span className="hidden sm:inline">AI Помощник (Демо)</span>
                    </div>
                  ) : (
                    <a
                      href="tel:+998901234567"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5"
                    >
                      <Phone size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Messages Flow Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {currentMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[88%] sm:max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed ${isUser
                            ? 'bg-teal-600 text-white rounded-br-xs shadow-sm'
                            : 'bg-white text-stone-800 dark:bg-[#1E1E1E] dark:text-stone-200 rounded-bl-xs border border-stone-200/80 dark:border-white/5 shadow-xs'
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Matched Listings Cards */}
                        {msg.matchedListings && msg.matchedListings.length > 0 && (
                          <div className="mt-4 space-y-2.5 pt-3 border-t border-stone-200/60 dark:border-white/10">
                            {msg.matchedListings.map((apt) => (
                              <div
                                key={apt.id}
                                onClick={() => router.push(`/${locale}/catalog/${apt.id}`)}
                                className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3 text-left cursor-pointer transition-all hover:scale-[1.01] hover:bg-stone-100 dark:bg-[#252525] dark:hover:bg-[#2C2C2C] border border-stone-200/50 dark:border-white/5"
                              >
                                <img
                                  src={apt.image}
                                  alt={apt.title}
                                  className="h-14 w-14 rounded-xl object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-stone-900 dark:text-white truncate">
                                    {apt.title}
                                  </p>
                                  <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-0.5">
                                    ${apt.price} / {apt.type === 'daily' ? 'сутки' : 'мес'} • {apt.location}
                                  </p>
                                </div>
                                <ChevronRight size={16} className="text-stone-400 shrink-0" />
                              </div>
                            ))}

                            {msg.appliedFilters && (
                              <button
                                type="button"
                                onClick={() => applyFiltersToCatalog(msg.appliedFilters!)}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-sm mt-2"
                              >
                                <SlidersHorizontal size={14} />
                                Открыть в каталоге с этими фильтрами
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1 px-1 text-[11px] text-stone-400">
                        <span>{msg.timestamp}</span>
                        {isUser && <CheckCheck size={13} className="text-teal-500" />}
                      </div>

                      {/* Quick Replies */}
                      {msg.quickReplies && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {msg.quickReplies.map((qr) => (
                            <button
                              key={qr}
                              type="button"
                              onClick={() => handleSendMessage(qr)}
                              className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-[#1E1E1E] dark:text-stone-300 transition-colors shadow-xs"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-stone-400 py-2 px-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs">AI анализирует варианты...</span>
                  </div>
                )}
              </div>

              {/* Message Bottom Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="border-t border-stone-200 bg-white p-3 sm:p-4 dark:border-white/10 dark:bg-[#1A1A1A] shrink-0"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      selectedContact.isAi
                        ? 'Например: "Ищу 2-комнатную квартиру в Юнусабаде до $400"...'
                        : 'Напишите сообщение...'
                    }
                    className="h-11 sm:h-12 flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-teal-600 text-white transition-all hover:bg-teal-500 active:scale-95 disabled:opacity-40 shadow-sm shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <MessageSquare size={48} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">Выберите диалог из списка слева</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
