"use client";

const DEFAULT_LOCALE = 'ru';

export const loadMessages = async (locale: string) => {
  try {
    return (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    return (await import(`../messages/${DEFAULT_LOCALE}.json`)).default;
  }
};

export const getMessages = async (locale: string) => {
  return loadMessages(locale);
};