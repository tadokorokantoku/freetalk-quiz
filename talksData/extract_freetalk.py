#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json
from datetime import datetime
from janome.tokenizer import Tokenizer

def extract_nouns(text):
    """
    テキストから名詞を抽出する（登場順序を保持）
    """
    try:
        # Janomeを使用して形態素解析
        tokenizer = Tokenizer()
        tokens = tokenizer.tokenize(text)
        
        nouns = []
        seen = set()  # 重複チェック用のセット
        
        for token in tokens:
            # 品詞情報を取得
            pos = token.part_of_speech.split(',')[0]
            
            # 名詞の場合のみ抽出
            if pos == '名詞':
                word = token.surface
                if word and len(word) > 1:  # 1文字の名詞は除外
                    # 重複していない場合のみ追加
                    if word not in seen:
                        nouns.append(word)
                        seen.add(word)
        
        return nouns
        
    except Exception as e:
        print(f"形態素解析エラー: {e}")
        return []

def extract_freetalk_data(file_path):
    """
    talks.txtからフリートークのデータを抽出してJSON形式で返す
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 日付とフリートークのセクションを抽出
    # 日付のパターン: MM/DD曜日
    date_pattern = r'(\d{2}/\d{2}[月火水木金土日])'
    freetalk_pattern = r'<フリートーク（.*?）>\n(.*?)(?=\n\d{2}/\d{2}[月火水木金土日]|\Z)'
    
    # フリートークセクションを全て抽出
    freetalk_sections = re.findall(freetalk_pattern, content, re.DOTALL)
    
    # 日付を抽出
    dates = re.findall(date_pattern, content)
    
    freetalk_data = []
    id_counter = 1
    
    for i, freetalk_content in enumerate(freetalk_sections):
        if i >= len(dates):
            break
            
        # 日付を2025年として解釈
        date_str = dates[i]
        month, day = date_str.split('/')
        day = day[:-1]  # 曜日を除去
        
        # 2025年として日付を作成
        try:
            date_obj = datetime(2025, int(month), int(day))
            formatted_date = date_obj.strftime('%Y/%m/%d')
        except ValueError:
            # 無効な日付の場合はスキップ
            continue
        
        # フリートークの内容を処理
        lines = freetalk_content.strip().split('\n')
        
        # 最初の行からスピーカーを抽出
        speaker = ""
        text_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # スピーカー名のパターンをチェック
            if not speaker and line in ['Ino', 'DD', 'Koji', 'Kaji', 'YG', 'Domi', 'Ebi', 'Uchi', 'Nami']:
                speaker = line.lower()  # 小文字に統一
            elif not speaker and line == 'スキップ':
                speaker = 'スキップ'
                text_lines.append(line)
                break
            else:
                text_lines.append(line)
        
        # スキップの場合はスキップ
        if speaker == 'スキップ':
            continue
            
        # テキストを結合
        text = '\n'.join(text_lines)
        
        # 空のテキストはスキップ
        if not text.strip():
            continue
        
        # 名詞を抽出
        words = extract_nouns(text)
        
        freetalk_data.append({
            "id": str(id_counter),
            "date": formatted_date,
            "speaker": speaker,
            "text": text,
            "words": words
        })
        
        id_counter += 1
    
    return freetalk_data

def main():
    # talks.txtからフリートークデータを抽出
    freetalk_data = extract_freetalk_data('talks.txt')
    
    # JSONとしてファイルに保存
    with open('freetalk.json', 'w', encoding='utf-8') as f:
        json.dump(freetalk_data, f, ensure_ascii=False, indent=2)
    
    # 標準出力にも出力
    print(json.dumps(freetalk_data, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main() 