import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAllSpeakers, getFreetalkData } from '@/utils/data';
import { FreetalkData } from '@/types';
import SpeakerButton from '@/components/SpeakerButton';
import WordProgressIndicator from '@/components/WordProgressIndicator';

export default function Solo() {
  const router = useRouter();
  const { name } = router.query;
  const [playerName, setPlayerName] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<FreetalkData | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<'waiting' | 'question' | 'answering' | 'result'>('waiting');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [speakers] = useState(getAllSpeakers());
  const [autoProgressTimer, setAutoProgressTimer] = useState<NodeJS.Timeout | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [allQuestions] = useState(() => getFreetalkData().filter(item => item.speaker.trim() !== ''));
  const [hardMode, setHardMode] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [wordProgressKey, setWordProgressKey] = useState(0);

  useEffect(() => {
    if (name && typeof name === 'string') {
      setPlayerName(name);
      startNewQuestion();
    }
  }, [name]);

  useEffect(() => {
    return () => {
      if (autoProgressTimer) {
        clearTimeout(autoProgressTimer);
      }
    };
  }, [autoProgressTimer]);

  useEffect(() => {
    if (gamePhase === 'answering' && currentQuestion && currentWordIndex < shuffledWords.length - 1) {
      setWordProgressKey(prev => prev + 1);
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 4000);
      setAutoProgressTimer(timer);
    }
  }, [gamePhase, currentWordIndex, currentQuestion, shuffledWords.length]);

  const getUnusedQuestion = (): FreetalkData | null => {
    if (usedQuestions.size >= allQuestions.length) {
      // All questions used, reset
      setUsedQuestions(new Set());
      return allQuestions[Math.floor(Math.random() * allQuestions.length)];
    }
    
    const availableQuestions = allQuestions.filter((_, index) => !usedQuestions.has(index));
    if (availableQuestions.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    const originalIndex = allQuestions.indexOf(selectedQuestion);
    
    setUsedQuestions(prev => new Set(prev).add(originalIndex));
    return selectedQuestion;
  };

  const startNewQuestion = () => {
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer);
      setAutoProgressTimer(null);
    }
    
    const question = getUnusedQuestion();
    if (!question) return;
    
    // ハードモードの場合は単語をシャッフル
    if (hardMode) {
      const shuffled = [...question.words];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledWords(shuffled);
    } else {
      setShuffledWords(question.words);
    }
    
    setCurrentQuestion(question);
    setCurrentWordIndex(0);
    setGamePhase('answering');
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (speaker: string) => {
    if (gamePhase !== 'answering' || selectedAnswer) return;
    
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer);
      setAutoProgressTimer(null);
    }
    
    setSelectedAnswer(speaker);
    setGamePhase('result');
    setTotalQuestions(prev => prev + 1);
    
    if (speaker === currentQuestion?.speaker) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    startNewQuestion();
  };



  const currentWords = shuffledWords.slice(0, currentWordIndex + 1);

  if (!playerName) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">読み込み中...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              ソロモード - {playerName}
            </h1>
            <div className="text-sm text-gray-600">
              スコア: {score}/{totalQuestions}
            </div>
          </div>

          {gamePhase === 'waiting' && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">準備中...</h2>
            </div>
          )}

          {gamePhase === 'answering' && currentQuestion && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    ヒントワード ({currentWordIndex + 1}/{shuffledWords.length})
                  </h2>
                  <button
                    onClick={() => setHardMode(!hardMode)}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                      hardMode
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    ハード{hardMode ? 'ON' : 'OFF'}
                  </button>
                </div>
                <WordProgressIndicator
                  key={wordProgressKey}
                  isActive={currentWordIndex < shuffledWords.length - 1}
                  duration={4000}
                />
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentWords.map((word, index) => (
                    <span
                      key={index}
                      className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {speakers.map((speaker) => (
                  <SpeakerButton
                    key={speaker}
                    speaker={speaker}
                    isSelected={selectedAnswer === speaker}
                    isDisabled={!!selectedAnswer}
                    onClick={handleAnswerSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {gamePhase === 'result' && currentQuestion && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">結果</h2>
              <p className="text-lg mb-4">
                正解: <span className="font-bold text-green-600">{currentQuestion.speaker}</span>
              </p>
              <p className="text-lg mb-4">
                あなたの回答: <span className={`font-bold ${
                  selectedAnswer === currentQuestion.speaker ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedAnswer}
                </span>
                {selectedAnswer === currentQuestion.speaker ? ' ✓' : ' ✗'}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">フリートークの内容:</h3>
                <p className="text-sm text-gray-700">{currentQuestion.text}</p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
              >
                次の問題
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">統計</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">正解数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">正解率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}