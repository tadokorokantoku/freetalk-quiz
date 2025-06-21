import { FreetalkData } from '@/types';
import freetalkData from '@/talksData/freetalk.json';

export function getFreetalkData(): FreetalkData[] {
  return freetalkData as FreetalkData[];
}

export function getRandomQuestion(): FreetalkData {
  const data = getFreetalkData();
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export function getAllSpeakers(): string[] {
  return ['nami', 'uchi', 'ebi', 'katsuki'];
}