# ガントチャートツール

プロジェクトとタスクを管理するためのガントチャートツールです。React + Flask + PostgreSQLで構築されています。

## 機能

- ユーザー認証（ログイン/ログアウト）
- プロジェクト管理（共有プロジェクト/マイプロジェクト）
- タスク管理（作成、編集、削除、進捗管理）
- ガントチャート表示（年/月/週/日表示）
- 管理者パネル（ユーザー管理）

## 技術スタック

### フロントエンド
- React 18
- Vite
- Tailwind CSS
- Lucide React

### バックエンド
- Flask
- SQLAlchemy
- PostgreSQL（本番環境）/ SQLite（ローカル環境）
- Gunicorn

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール

#### バックエンド
```bash
pip install -r requirements.txt
```

#### フロントエンド
```bash
cd frontend
npm install
```

### 2. フロントエンドのビルド

```bash
cd frontend
npm run build
cd ..
```

### 3. 静的ファイルのコピー

```bash
mkdir -p static
cp -r frontend/dist/* static/
```

### 4. サーバーの起動

```bash
python main.py
```

アプリケーションは http://localhost:5000 で起動します。

## デプロイ

### Renderへのデプロイ

このプロジェクトはRenderへのデプロイに対応しています。

1. GitHubリポジトリを作成
2. このプロジェクトをプッシュ
3. Renderで「New Web Service」を作成
4. GitHubリポジトリを接続
5. 自動的にデプロイが開始されます

詳細な手順は `Renderデプロイ手順書.md` を参照してください。

## デフォルトアカウント

- メールアドレス: ---
- パスワード: ---

## ライセンス

MIT License

