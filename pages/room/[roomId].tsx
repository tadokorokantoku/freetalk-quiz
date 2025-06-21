import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '@/contexts/GameContext';
import { getAllSpeakers } from '@/utils/data';

export default function Room() {
  const router = useRouter();
  const { roomId } = router.query;
  const { gameState, submitAnswer } = useGame();
  const [speakers] = useState(getAllSpeakers());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentWords = gameState.currentQuestion?.words.slice(0, gameState.currentWordIndex + 1) || [];

  const handleAnswerSelect = (speaker: string) => {
    if (gameState.gamePhase === 'answering' && !selectedAnswer) {
      setSelectedAnswer(speaker);
      submitAnswer(speaker);
    }
  };

  const getPlayerAnswer = (playerId: string) => {
    return gameState.answers.find(answer => answer.playerId === playerId);
  };

  if (!gameState.roomId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">接続中...</h2>
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
              Room: {roomId}
            </h1>
            <div className="text-sm text-gray-600">
              Phase: {gameState.gamePhase}
            </div>
          </div>

          {gameState.gamePhase === 'waiting' && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">プレイヤーを待っています...</h2>
              <p className="text-gray-600">
                {gameState.players.length}/4 プレイヤー参加中
              </p>
            </div>
          )}

          {(gameState.gamePhase === 'question' || gameState.gamePhase === 'answering') && gameState.currentQuestion && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-center">
                  ヒントワード ({gameState.currentWordIndex + 1}/{gameState.currentQuestion.words.length})
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
              </div>

              {gameState.gamePhase === 'answering' && (
                <div className="grid grid-cols-2 gap-4">
                  {speakers.map((speaker) => (
                    <button
                      key={speaker}
                      onClick={() => handleAnswerSelect(speaker)}
                      disabled={!!selectedAnswer}
                      className={`p-4 rounded-lg border-2 font-medium transition-colors ${
                        selectedAnswer === speaker
                          ? 'bg-blue-500 text-white border-blue-500'
                          : selectedAnswer
                          ? 'bg-gray-100 text-gray-400 border-gray-200'
                          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {speaker}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {gameState.gamePhase === 'result' && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">結果発表</h2>
              <p className="text-lg mb-4">
                正解: <span className="font-bold text-green-600">{gameState.correctAnswer}</span>
              </p>
              <div className="space-y-2">
                {gameState.answers
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((answer, index) => {
                    const player = gameState.players.find(p => p.id === answer.playerId);
                    const isCorrect = answer.answer === gameState.correctAnswer;
                    return (
                      <div
                        key={answer.playerId}
                        className={`p-2 rounded ${
                          isCorrect ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {index + 1}. {player?.name}: {answer.answer}
                        {isCorrect && ' ✓'}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">スコアボード</h3>
          <div className="space-y-2">
            {gameState.players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">
                    {index + 1}. {player.name}
                  </span>
                  <span className="font-bold text-blue-600">
                    {player.score}pt
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}