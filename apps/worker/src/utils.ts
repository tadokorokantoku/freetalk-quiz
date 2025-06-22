import { freetalkData } from './data';
import { FreetalkData } from './types';


export function getRandomQuestion(): FreetalkData {
  const randomIndex = Math.floor(Math.random() * freetalkData.length);
  return freetalkData[randomIndex];
}

export function getAllSpeakers(): string[] {
  const speakers = [...new Set(freetalkData.map(item => item.speaker))];
  return speakers;
}