import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = 'en') {
  return new Date(date).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function convertDecimalToBigha(decimal: number): string {
  return (decimal / 33).toFixed(2);
}

export function formatPhoneBD(phone: string): string {
  return phone.replace(/^\+880/, '0');
}
