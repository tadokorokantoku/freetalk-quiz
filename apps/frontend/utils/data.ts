import { FreetalkData } from '@/types';
import freetalkData from '../../../data/freetalk.json';

export function getFreetalkData(): FreetalkData[] {
  return freetalkData as FreetalkData[];
}

export function getRandomQuestion(): FreetalkData {
  const data = getFreetalkData().filter(item => item.speaker.trim() !== '');
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export function getAllSpeakers(): string[] {
  const data = getFreetalkData();
  const speakerSet = new Set(data.map(item => item.speaker).filter(speaker => speaker.trim() !== ''));
  const speakers = Array.from(speakerSet);
  return speakers.sort();
}