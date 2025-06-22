import { freetalkData } from './data';
import { FreetalkData } from './types';


export function getRandomQuestion(excludeIds?: Set<string>): FreetalkData {
  let availableQuestions = freetalkData;
  
  if (excludeIds && excludeIds.size > 0) {
    availableQuestions = freetalkData.filter(q => !excludeIds.has(q.id));
  }
  
  // 利用可能な質問がない場合は全ての質問から選択
  if (availableQuestions.length === 0) {
    availableQuestions = freetalkData;
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
}

export function getAllSpeakers(): string[] {
  const speakers = [...new Set(freetalkData.map(item => item.speaker))];
  return speakers;
}