'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  MessageSquare, Sparkles, Send, X, Bot, User as UserIcon,
  ChevronRight, ExternalLink, RefreshCw, Shield, MapPin, Building,
  DollarSign, CheckCircle2, SlidersHorizontal
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
}

const KNOWLEDGE_FAQ = [
  {
    q: 'Как разместить объявление?',
    a: 'Перейдите в раздел "Разместить" в верхнем меню. Заполните данные об объекте, загрузите фото и нажмите "Опубликовать". Объявление появится в каталоге моментально.',
  },
  {
    q: 'Как работает верификация номера?',
    a: 'При входе через Google или регистрации вам приходит SMS-код через Firebase. Это защищает арендаторов от мошенников.',
  },
  {
    q: 'Безопасны ли сделки?',
    a: 'На ijara.uz все объекты с меткой "Проверено" проходят ручную модерацию. Никогда не переводите предоплату незнакомым лицам до осмотра.',
  },
];

export function ChatWidget() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';
  const user = useAuthStore((s) => s.user);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'peer'>('ai');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Здравствуйте! Я умный AI-ассистент ijara.uz. Я могу найти идеальную квартиру или комнату по вашим условиям (например, "студенту в Юнусабаде до $300" или "посуточно в центре"), автоматически настроить фильтры и ответить на любые вопросы о платформе. Конфиденциальные данные пользователей надежно защищены.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [peerMessages, setPeerMessages] = useState<Message[]>([
    {
      id: 'p1',
      sender: 'peer',
      text: 'Здравствуйте! По какому объявлению вы хотите связаться? Вы можете написать владельцу любого объекта прямо здесь.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, peerMessages, isOpen, activeTab]);

  // AI query parser & filter applier
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    setInputText('');

    if (activeTab === 'peer') {
      const userMsg: Message = {
        id: String(Date.now()),
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setPeerMessages((prev) => [...prev, userMsg]);

      setTimeout(() => {
        const reply: Message = {
          id: String(Date.now() + 1),
          sender: 'peer',
          text: 'Сообщение отправлено арендодателю. Он получит уведомление в личном кабинете и ответит вам.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setPeerMessages((prev) => [...prev, reply]);
      }, 1000);
      return;
    }

    // AI Tab
    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/backend/ai-chat/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10).map((item) => ({
            role: item.sender === 'ai' ? 'assistant' : 'user',
            content: item.text,
          })),
        }),
      });
      const data = await response.json() as { response?: string; listings?: Apartment[]; message?: string };
      if (!response.ok) throw new Error(data.message || 'AI service unavailable');
      setMessages((prev) => [...prev, {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: data.response || 'Не удалось получить ответ. Попробуйте ещё раз.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedListings: data.listings,
      }]);
      setIsTyping(false);
      return;

      const lower = text.toLowerCase();

      // Guardrail: Do NOT reveal sensitive / private system info
      if (
        lower.includes('секрет') ||
        lower.includes('парол') ||
        lower.includes('баз данных') ||
        lower.includes('jwt') ||
        lower.includes('api_key') ||
        lower.includes('secret') ||
        lower.includes('private')
      ) {
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: String(Date.now() + 1),
              sender: 'ai',
              text: 'Из соображений безопасности я не раскрываю внутренние системные или приватные данные пользователей. Чем я могу помочь вам в поиске жилья?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 700);
        return;
      }

      // Check greetings and general knowledge base first
      const greetings = ['привет', 'здравствуй', 'салам', 'hi', 'hello', 'добрый день', 'добрый вечер', 'доброе утро', 'ассалому алейкум', 'как дела'];
      if (greetings.some((g) => lower.includes(g))) {
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: String(Date.now() + 1),
              sender: 'ai',
              text: 'Здравствуйте! Рад помочь вам. Я могу подобрать подходящую квартиру, комнату или дом в Ташкенте, Самарканде и других городах, подсказать по ценам или помочь опубликовать объявление. Какое жилье вы ищете?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 600);
        return;
      }

      // Check for FAQ matches
      for (const item of KNOWLEDGE_FAQ) {
        if (lower.includes(item.q.toLowerCase().slice(0, 8))) {
          setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: String(Date.now() + 1),
                sender: 'ai',
                text: item.a,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }, 700);
          return;
        }
      }

      // Parse parameters for housing search
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
      } else if (lower.includes('дом') || lower.includes('коттедж') || lower.includes('участок')) {
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
        'Мирзо-Улугбек', 'Шайхантахур', 'Алмазар', 'Сергели'
      ];
      for (const d of districts) {
        if (lower.includes(d.toLowerCase())) {
          detectedFilters.district = `${d}ский`;
          break;
        }
      }

      // Price extraction (e.g. "до 300", "до 500$", "300 долларов")
      const priceMatch = lower.match(/(?:до|<|\bне дороже\b)\s*(\d+)/) || lower.match(/(\d+)\s*(?:\$|долл|usd)/);
      const maxPrice = priceMatch?.[1];
      if (maxPrice) {
        detectedFilters.maxPrice = maxPrice!;
      }

      const hasCriteria = Object.keys(detectedFilters).length > 0;

      if (!hasCriteria) {
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: String(Date.now() + 1),
              sender: 'ai',
              text: 'Уточните, пожалуйста: в каком районе или городе вы ищете жилье, на какой бюджет рассчитываете и какой тип жилья предпочтителен (квартира, комната или посуточно)?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 600);
        return;
      }

      // Fetch matching listings
      const matched = await getApartments(locale, undefined, {
        city: detectedFilters.city,
        district: detectedFilters.district,
        type: detectedFilters.type,
        audience: detectedFilters.audience,
        forStudents: detectedFilters.audience === 'students',
        maxPrice: detectedFilters.maxPrice ? Number(detectedFilters.maxPrice) : undefined,
      });

      const topMatches = matched.slice(0, 3);

      setTimeout(() => {
        setIsTyping(false);

        let replyText = '';
        if (topMatches.length > 0) {
          replyText = `Я нашёл ${topMatches.length} подходящих вариантов по вашему запросу! Вы можете применить эти фильтры в каталоге одним кликом:`;
        } else {
          replyText = 'К сожалению, прямо сейчас точных совпадений нет, но я могу помочь изменить критерии поиска или подобрать похожие варианты.';
        }

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: 'ai',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            matchedListings: topMatches.length > 0 ? topMatches : undefined,
            appliedFilters: Object.keys(detectedFilters).length > 0 ? detectedFilters : undefined,
          },
        ]);
      }, 900);
    } catch (e) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: 'Извините, произошла небольшая заминка. Попробуйте еще раз сформулировать запрос.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const applyFiltersToCatalog = (filters: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    router.push(`/${locale}/catalog?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Открыть AI чат"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-xl shadow-teal-900/30 transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[580px] w-[390px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1A1A1A] animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="border-b border-stone-200/80 bg-stone-50/80 p-4 dark:border-white/10 dark:bg-[#222222]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    ijara AI Assistant
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Поиск жилья и консультант платформы
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs: AI Assistant / Direct Messages */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-200/60 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${activeTab === 'ai'
                    ? 'bg-white text-teal-700 shadow-sm dark:bg-teal-600 dark:text-white'
                    : 'text-stone-600 dark:text-stone-400'
                  }`}
              >
                <Sparkles size={13} />
                AI Помощник
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('peer')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${activeTab === 'peer'
                    ? 'bg-white text-teal-700 shadow-sm dark:bg-teal-600 dark:text-white'
                    : 'text-stone-600 dark:text-stone-400'
                  }`}
              >
                <MessageSquare size={13} />
                Арендодатели
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-stone-950/50">
            {(activeTab === 'ai' ? messages : peerMessages).map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${isUser
                        ? 'bg-teal-600 text-white rounded-br-xs shadow-sm'
                        : 'bg-stone-100 text-stone-800 dark:bg-white/5 dark:text-stone-200 rounded-bl-xs border border-stone-200/60 dark:border-white/5'
                      }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Matched listings widget within message */}
                    {msg.matchedListings && msg.matchedListings.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-stone-200/60 dark:border-white/10">
                        {msg.matchedListings.map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => {
                              router.push(`/${locale}/catalog/${apt.id}`);
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-2.5 rounded-xl bg-white p-2 text-left cursor-pointer transition-all hover:scale-[1.02] dark:bg-[#252525] border border-stone-200/50 dark:border-white/5 shadow-xs"
                          >
                            <img
                              src={apt.image}
                              alt={apt.title}
                              className="h-11 w-11 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-stone-900 dark:text-white truncate">
                                {apt.title}
                              </p>
                              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                                ${apt.price} / мес • {apt.location}
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-stone-400" />
                          </div>
                        ))}

                        {msg.appliedFilters && (
                          <button
                            type="button"
                            onClick={() => applyFiltersToCatalog(msg.appliedFilters!)}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2 text-[11px] font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
                          >
                            <SlidersHorizontal size={13} />
                            Открыть в каталоге с этими фильтрами
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-stone-400">{msg.timestamp}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-stone-400 py-1">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1">AI подбирает варианты...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions when AI tab is active */}
          {activeTab === 'ai' && (
            <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 pt-1 no-scrollbar">
              {[
                'Студенту в Юнусабаде до $300',
                'Посуточно в центре',
                '3-комнатная для семьи',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setInputText(suggestion);
                  }}
                  className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-medium text-stone-600 hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="sticky bottom-0 z-10 border-t border-stone-200/80 bg-white/80 dark:border-white/10 dark:bg-stone-900/80 backdrop-blur-sm p-4 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeTab === 'ai'
                    ? 'Спросите AI или опишите жильё...'
                    : 'Напишите сообщение...'
                }
                className="h-12 flex-1 rounded-xl border border-stone-200/80 bg-white/70 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder-stone-500 dark:focus:border-teal-500/50 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white transition-colors hover:bg-teal-500 disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
