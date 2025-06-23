interface SpeakerButtonProps {
  speaker: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: (speaker: string) => void;
}

export default function SpeakerButton({ speaker, isSelected, isDisabled, onClick }: SpeakerButtonProps) {
  const getImageExtension = (name: string) => {
    // 画像ファイルの拡張子を決定
    const pngSpeakers = ['dd', 'domi', 'ebi'];
    return pngSpeakers.includes(name) ? 'png' : 'jpeg';
  };

  const getSpeakerLabel = (speaker: string) => {
    const labelMap: { [key: string]: string } = {
      dd: 'カリスマ',
      domi: 'ドミちゃん',
      ebi: 'えびちゃん',
      ino: 'いのっち',
      kaji: 'カジー',
      koji: 'コジコジ',
      nami: 'なみのり',
      uchi: 'うっちー',
      yg: 'やぐ姐'
    };
    return labelMap[speaker] || speaker;
  };

  return (
    <button
      onClick={() => onClick(speaker)}
      disabled={isDisabled}
      className={`p-3 rounded-lg border-2 font-medium transition-colors flex items-center space-x-2 ${
        isSelected
          ? 'bg-blue-500 text-white border-blue-500'
          : isDisabled
          ? 'bg-gray-100 text-gray-400 border-gray-200'
          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300'
      }`}
    >
      <img 
        src={`/${speaker}.${getImageExtension(speaker)}`} 
        alt={speaker} 
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      <span className="text-sm">{getSpeakerLabel(speaker)}</span>
    </button>
  );
}