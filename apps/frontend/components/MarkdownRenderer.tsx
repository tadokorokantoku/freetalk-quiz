interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // 簡単なマークダウンレンダラー
  const renderMarkdown = (text: string) => {
    // HTMLエスケープ
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // マークダウンパース
    let html = escapeHtml(text);
    
    // ヘッダー
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mb-2">$1</h3>');
    html = html.replace(/^#### (.+)$/gm, '<h4 class="font-semibold mb-2">$1</h4>');
    
    // 太字とイタリック
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // リスト
    html = html.replace(/^- (.+)$/gm, '<li class="list-disc list-inside">$1</li>');
    
    // 段落を作成
    const lines = html.split('\n');
    let result = '';
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('<li')) {
        if (!inList) {
          result += '<ul class="space-y-1 mb-4">\n';
          inList = true;
        }
        result += line + '\n';
      } else {
        if (inList) {
          result += '</ul>\n';
          inList = false;
        }
        
        if (line === '') {
          // 空行
        } else if (line.startsWith('<h') || line.startsWith('<div')) {
          result += line + '\n';
        } else {
          result += `<p class="mb-3">${line}</p>\n`;
        }
      }
    }
    
    if (inList) {
      result += '</ul>\n';
    }
    
    return result;
  };

  return (
    <div 
      className="prose prose-sm max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}