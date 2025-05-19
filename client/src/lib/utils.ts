import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ساعة`;
  }
  
  return `${hours} ساعة و ${remainingMinutes} دقيقة`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateTimeDifference(startTime: Date | string, endTime: Date | string): string {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  const differenceInMinutes = Math.round((end - start) / (1000 * 60));
  
  if (differenceInMinutes < 60) {
    return `${differenceInMinutes} دقيقة`;
  }
  
  const hours = Math.floor(differenceInMinutes / 60);
  const minutes = differenceInMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} ساعة`;
  }
  
  return `${hours} ساعة و ${minutes} دقيقة`;
}

export function calculatePercentage(score: number, totalMarks: number): number {
  if (totalMarks === 0) return 0;
  return Math.round((score / totalMarks) * 100);
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 90) return "text-success-600 dark:text-success-400";
  if (percentage >= 80) return "text-primary-600 dark:text-primary-400";
  if (percentage >= 70) return "text-gray-600 dark:text-gray-300";
  if (percentage >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function generateExamCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
