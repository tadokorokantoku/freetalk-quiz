# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを作業する際のガイダンスを提供します。

## プロジェクト概要

FreeTalk Quiz は、会話データからのヒント語を基に話者を推測する日本語クイズアプリケーションです。Next.js フロントエンドと Cloudflare Workers バックエンドで構築され、ソロモードとマルチプレイヤーモードの両方をサポートしています。

## 開発コマンド

### ルートレベルコマンド
- `npm run dev` - フロントエンド Worker 開発サーバーを起動
- `npm run dev:backend` - バックエンド Worker 開発サーバーを起動
- `npm run build:all` - フロントエンドとワーカーの両方をビルド
- `npm run deploy` - 両方の Worker を Cloudflare にデプロイ
- `npm run deploy:frontend` - フロントエンド Worker のみデプロイ
- `npm run deploy:backend` - バックエンド Worker のみデプロイ
- `npm run install:all` - 全パッケージの依存関係をインストール

### フロントエンド開発 (apps/frontend/)
- `npm run dev` - Next.js 開発サーバーを起動
- `npm run build` - Next.js アプリケーションをビルド（静的エクスポート）
- `npm run lint` - ESLint を実行

### ワーカー開発 (apps/worker/)
- `wrangler dev` - ローカル Cloudflare Workers 開発を開始
- `wrangler deploy` - ワーカーを Cloudflare にデプロイ

## アーキテクチャ

### モノレポ構造
- `apps/frontend/` - 静的エクスポート付き Next.js TypeScript アプリケーション
- `apps/worker/` - Durable Objects 付き Cloudflare Workers（バックエンド専用）
- `src/` - フロントエンド配信用 Cloudflare Worker
- `data/` - クイズデータと Python 処理スクリプト

### 主要技術
- **フロントエンド**: Next.js 14.2.5, TypeScript, Tailwind CSS, React Context API
- **フロントエンド配信**: Cloudflare Workers（静的ファイル配信）
- **バックエンド**: Cloudflare Workers, Durable Objects, WebSocket
- **状態管理**: フロントエンド用 React Context、マルチプレイヤー永続化用 Durable Objects

### ゲームアーキテクチャ
- **ソロモード**: ローカル状態管理、ヒントの自動進行
- **マルチプレイヤーモード**: 専用バックエンド Worker 経由のリアルタイム WebSocket 通信
- **データレイヤー**: 話者/テキスト/ヒント付き静的 JSON ファイル（`data/freetalk.json`）

### デプロイメント構成
- **フロントエンド Worker**: `freetalk-quiz` - 静的ファイル配信専用
- **バックエンド Worker**: `freetalk-quiz-backend` - API/WebSocket 処理専用

### 重要なファイル
- `apps/frontend/contexts/GameContext.tsx` - グローバルゲーム状態管理
- `apps/worker/src/QuizRoom.ts` - マルチプレイヤーゲームロジックと WebSocket ハンドリング
- `apps/frontend/types/index.ts` - TypeScript 型定義
- `apps/frontend/utils/data.ts` - データアクセスユーティリティ
- `data/freetalk.json` - クイズデータソース
- `wrangler.toml` - フロントエンド Worker 設定
- `wrangler-backend.toml` - バックエンド Worker 設定

### WebSocket 通信
フロントエンドは、リアルタイムマルチプレイヤー機能のために専用バックエンド Worker（`freetalk-quiz-backend`）の WebSocket エンドポイントに接続します。ルームベースのゲームは永続化のために Durable Objects を使用します。

### 開発注意事項
- Next.js は静的エクスポート用に設定済み（`output: 'export'`）
- 現在テストフレームワークは設定されていません
- コード品質のため ESLint を設定
- パッケージ管理に npm を使用（pnpm-lock.yaml は存在しますが）