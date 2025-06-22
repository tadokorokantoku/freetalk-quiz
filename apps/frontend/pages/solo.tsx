import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getRandomQuestion, getAllSpeakers } from '@/utils/data';
import { FreetalkData } from '@/types';
import SpeakerButton from '@/components/SpeakerButton';

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

  useEffect(() => {
    if (name && typeof name === 'string') {
      setPlayerName(name);
      startNewQuestion();
    }
  }, [name]);

  const startNewQuestion = () => {
    const question = getRandomQuestion();
    setCurrentQuestion(question);
    setCurrentWordIndex(0);
    setGamePhase('question');
    setSelectedAnswer(null);
    
    // Show first word after a brief delay
    setTimeout(() => {
      setGamePhase('answering');
    }, 1000);
  };

  const handleAnswerSelect = (speaker: string) => {
    if (gamePhase !== 'answering' || selectedAnswer) return;
    
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

  const showNextWord = () => {
    if (currentQuestion && currentWordIndex < currentQuestion.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const currentWords = currentQuestion?.words.slice(0, currentWordIndex + 1) || [];

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

          {(gamePhase === 'question' || gamePhase === 'answering') && currentQuestion && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-center">
                  ヒントワード ({currentWordIndex + 1}/{currentQuestion.words.length})
                </h2>
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
                
                {gamePhase === 'answering' && currentWordIndex < currentQuestion.words.length - 1 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={showNextWord}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium"
                    >
                      次のヒント
                    </button>
                  </div>
                )}
              </div>

              {gamePhase === 'answering' && (
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
              )}
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