import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '@/contexts/GameContext';
import { getAllSpeakers } from '@/utils/data';

const PLAYER_NAME_KEY = 'freetalk-quiz-player-name';

export default function Room() {
  const router = useRouter();
  const { roomId } = router.query;
  const { gameState, submitAnswer, startGame } = useGame();
  const [speakers] = useState(getAllSpeakers());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentPlayerName, setCurrentPlayerName] = useState('');

  // 現在のプレイヤー名をlocalStorageから取得
  useEffect(() => {
    const savedPlayerName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedPlayerName) {
      setCurrentPlayerName(savedPlayerName);
    }
  }, []);

  // ゲームフェーズが変わったら選択した回答をリセット
  useEffect(() => {
    if (gameState.gamePhase === 'answering' || gameState.gamePhase === 'countdown') {
      setSelectedAnswer(null);
    }
  }, [gameState.gamePhase]);

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

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId as string);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
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
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Room: {roomId}
              </h1>
          </div>

          {gameState.gamePhase === 'waiting' && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">プレイヤーを待っています...</h2>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">友達を招待しよう！</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-mono bg-white px-3 py-2 rounded border">
                    {roomId}
                  </span>
                  <button
                    onClick={handleCopyRoomId}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                      copySuccess
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {copySuccess ? '✓ コピー済み' : '📋 Room IDをコピー'}
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                {gameState.players.length}/4 プレイヤー参加中
              </p>
              {gameState.players.length >= 2 && (
                <button
                  onClick={startGame}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  🚀 ゲームスタート
                </button>
              )}
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
                <div className="grid grid-cols-3 gap-3">
                  {speakers.map((speaker) => (
                    <button
                      key={speaker}
                      onClick={() => handleAnswerSelect(speaker)}
                      disabled={!!selectedAnswer}
                      className={`p-3 rounded-lg border-2 font-medium transition-colors ${
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
                    
                    // 正解者の順位からポイントを計算
                    const correctAnswers = gameState.answers.filter(a => a.answer === gameState.correctAnswer);
                    const correctIndex = correctAnswers
                      .sort((a, b) => a.timestamp - b.timestamp)
                      .findIndex(a => a.playerId === answer.playerId);
                    const points = isCorrect ? Math.max(50 - (correctIndex + 1) * 10, 10) : 0;
                    
                    return (
                      <div
                        key={answer.playerId}
                        className={`p-3 rounded flex justify-between items-center ${
                          isCorrect ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100'
                        }`}
                      >
                        <div>
                          <span className="font-medium">
                            {index + 1}. {player?.name}: {answer.answer}
                          </span>
                          {isCorrect && <span className="text-green-600 ml-2">✓</span>}
                        </div>
                        {isCorrect && (
                          <div className="text-right">
                            <span className="text-sm text-gray-600">
                              {correctIndex + 1}位
                            </span>
                            <div className="font-bold text-green-600">
                              +{points}pt
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {gameState.gamePhase === 'countdown' && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">次の問題まで</h2>
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {gameState.countdown}
              </div>
              <p className="text-gray-600">秒後に次の問題が開始されます</p>
            </div>
          )}

          {gameState.gamePhase === 'finished' && (
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold mb-6 text-yellow-600">🎉 ゲーム終了！ 🎉</h2>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">最終順位</h3>
                <div className="space-y-3">
                  {gameState.players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex justify-between items-center p-4 rounded-lg ${
                        index === 0 
                          ? 'bg-yellow-100 border-2 border-yellow-400' 
                          : index === 1 
                          ? 'bg-gray-100 border-2 border-gray-400'
                          : index === 2
                          ? 'bg-orange-100 border-2 border-orange-400'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </span>
                        <span className="font-bold text-lg">{player.name}{player.name === currentPlayerName ? '（あなた）' : ''}</span>
                      </div>
                      <span className="font-bold text-xl text-blue-600">
                        {player.score}pt
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                ホーム画面に戻る
              </button>
            </div>
          )}
            </div>
          </div>
          
          {/* スコアボード - result画面では非表示 */}
          {gameState.gamePhase !== 'result' && (
            <div className="w-80">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
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
                          {index + 1}. {player.name}{player.name === currentPlayerName ? '（あなた）' : ''}
                        </span>
                        <span className="font-bold text-blue-600">
                          {player.score}pt
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}