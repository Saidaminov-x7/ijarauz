// Простой локальный фильтр нецензурных слов (без внешних сервисов)
const BAD_WORDS = [
  'блять', 'бля', 'хуй', 'хуе', 'хуя', 'пизд', 'ебат', 'ебан', 'ебал', 'сука',
  'сук', 'мудак', 'мудил', 'гандон', 'долбоеб', 'долбаёб', 'уебок', 'пидор',
  'пидар', 'залуп', 'шлюх', 'ссук', 'наху', 'похуй', 'нихуя',
];

export function containsProfanity(value: string): boolean {
  const lower = value.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '');
  return BAD_WORDS.some(word => lower.includes(word));
}
