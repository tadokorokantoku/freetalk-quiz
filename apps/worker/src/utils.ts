import { FreetalkData } from './types';

const freetalkData: FreetalkData[] = [
  {
    "id": "1",
    "date": "2025/06/19",
    "speaker": "nami",
    "text": "夏といえば二郎\n三田がなんだかんだ美味い\n総帥が見れなくなった代わりにお弟子さんかいて、その人がつくるとめちゃくちゃ美味い！\n目黒に若助手がいるという目撃情報を入手し、\nとつげきするしかないよね\nStockImage\n麺少なめニンニクアブラ（700円）",
    "words": [
      "二郎",
      "三田",
      "総帥",
      "代わり",
      "弟子",
      "目黒",
      "助手",
      "目撃",
      "情報",
      "入手",
      "とつ",
      "StockImage",
      "少なめ",
      "ニンニクアブラ",
      "700"
    ]
  },
  {
    "id": "2",
    "date": "2025/06/18",
    "speaker": "uchi",
    "text": "ゲーム配信について\nだらだら見るのが好き\n「たいじ」という配信者が高校の頃からすき\nスプラが上手くてもともと見てた\nシャインポストっていうゲームの配信が",
    "words": [
      "ゲーム",
      "配信",
      "好き",
      "たいじ",
      "高校",
      "すき",
      "スプラ",
      "シャインポスト"
    ]
  },
  {
    "id": "3",
    "date": "2025/06/17",
    "speaker": "ebi",
    "text": "2ヶ月前くらいに浜松に行ってきた\n餃子が目当て\nただ、目当ての2/3が休業していた....さらに残りの1店舗も行列すぎて、時間が間に合わず...。\nどうしても食べたかったので、JR構内の中にある「石松餃子」に行った。\n浜松餃子は、野菜が多めで、味も甘め。付け合せでもやしがついてくる。",
    "words": [
      "ヶ月",
      "浜松",
      "餃子",
      "目当て",
      "休業",
      "行列",
      "石松餃子",
      "野菜",
      "もやし"
    ]
  }
];

export function getRandomQuestion(): FreetalkData {
  const randomIndex = Math.floor(Math.random() * freetalkData.length);
  return freetalkData[randomIndex];
}

export function getAllSpeakers(): string[] {
  const speakers = [...new Set(freetalkData.map(item => item.speaker))];
  return speakers;
}