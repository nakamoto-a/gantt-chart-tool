# Renderへのデプロイ手順書（初心者向け）

このガントチャートツールをRenderで永久デプロイするための詳細な手順を説明します。画面を見ながら進められるように、各ステップを丁寧に解説しています。

## 所要時間

**約15～20分**

## 前提条件

- インターネット接続
- メールアドレス（GitHubとRenderのアカウント作成に使用）

## 費用

- **無料プラン**: $0/月（15分間アクセスなしでスリープ）
- **有料プラン**: $7/月（常時起動、推奨）

---

## ステップ1: GitHubアカウントの作成（所要時間: 5分）

GitHubは、ソースコードを保存・管理するためのサービスです。

### 1.1 GitHubにアクセス

1. ブラウザで https://github.com を開く
2. 右上の「Sign up」ボタンをクリック

### 1.2 アカウント情報の入力

1. **メールアドレス**を入力
2. **パスワード**を作成（8文字以上、大文字・小文字・数字を含む）
3. **ユーザー名**を入力（例: `taro-yamada`）
4. 「Create account」をクリック

### 1.3 メール認証

1. 登録したメールアドレスに認証コードが送信される
2. メールを開いて認証コードをコピー
3. GitHubの画面に認証コードを入力

### 1.4 アカウント設定完了

1. 「Skip personalization」をクリック（または質問に答える）
2. GitHubのダッシュボードが表示されたら完了

**✅ GitHubアカウントの作成完了！**

---

## ステップ2: GitHubリポジトリの作成（所要時間: 3分）

ソースコードをGitHubにアップロードします。

### 2.1 新しいリポジトリの作成

1. GitHubのダッシュボードで右上の「+」ボタンをクリック
2. 「New repository」を選択

### 2.2 リポジトリ情報の入力

1. **Repository name**: `gantt-chart-tool`（任意の名前でOK）
2. **Description**: `ガントチャートツール`（任意）
3. **Public/Private**: 「Public」を選択（無料プランの場合）
4. **Initialize this repository with**: 何もチェックしない
5. 「Create repository」をクリック

### 2.3 リポジトリURLの確認

作成されたリポジトリのURLをメモしておきます。

例: `https://github.com/あなたのユーザー名/gantt-chart-tool`

**✅ GitHubリポジトリの作成完了！**

---

## ステップ3: ソースコードのアップロード（所要時間: 2分）

### 3.1 方法A: Webインターフェースでアップロード（推奨・簡単）

1. 提供された `gantt-chart-tool-complete.tar.gz` を解凍
2. GitHubのリポジトリページで「uploading an existing file」をクリック
3. 解凍したフォルダ内の全ファイルをドラッグ&ドロップ
4. 「Commit changes」をクリック

### 3.2 方法B: Git CLIを使用（上級者向け）

```bash
# 解凍したディレクトリに移動
cd gantt-chart-tool

# Gitリポジトリを初期化
git init

# すべてのファイルを追加
git add .

# コミット
git commit -m "Initial commit"

# リモートリポジトリを追加
git remote add origin https://github.com/あなたのユーザー名/gantt-chart-tool.git

# プッシュ
git branch -M main
git push -u origin main
```

**✅ ソースコードのアップロード完了！**

---

## ステップ4: Renderアカウントの作成（所要時間: 3分）

### 4.1 Renderにアクセス

1. ブラウザで https://render.com を開く
2. 右上の「Get Started」または「Sign Up」をクリック

### 4.2 GitHubでサインアップ

1. 「Sign up with GitHub」をクリック
2. GitHubのログイン画面が表示される（既にログイン済みの場合はスキップ）
3. 「Authorize Render」をクリックしてRenderにGitHubアカウントへのアクセスを許可

### 4.3 アカウント情報の入力

1. **名前**を入力
2. **メールアドレス**を確認（GitHubと同じものが自動入力される）
3. 「Complete Sign Up」をクリック

### 4.4 メール認証

1. 登録したメールアドレスに認証メールが送信される
2. メールを開いて「Verify Email」をクリック

**✅ Renderアカウントの作成完了！**

---

## ステップ5: PostgreSQLデータベースの作成（所要時間: 2分）

### 5.1 新しいPostgreSQLデータベースの作成

1. Renderのダッシュボードで「New +」をクリック
2. 「PostgreSQL」を選択

### 5.2 データベース情報の入力

1. **Name**: `gantt-chart-db`
2. **Database**: `gantt_chart`（自動入力される）
3. **User**: `gantt_user`（自動入力される）
4. **Region**: `Oregon (US West)`（最も近いリージョンを選択）
5. **PostgreSQL Version**: 最新版を選択
6. **Plan**: 「Free」を選択

### 5.3 データベースの作成

1. 「Create Database」をクリック
2. データベースが作成されるまで1～2分待つ
3. ステータスが「Available」になったら完了

### 5.4 データベースURLの確認

1. 作成されたデータベースの詳細ページを開く
2. 「Internal Database URL」をコピーしてメモ帳に保存

**✅ PostgreSQLデータベースの作成完了！**

---

## ステップ6: Webサービスの作成（所要時間: 3分）

### 6.1 新しいWebサービスの作成

1. Renderのダッシュボードで「New +」をクリック
2. 「Web Service」を選択

### 6.2 GitHubリポジトリの接続

1. 「Connect a repository」セクションで、先ほど作成したGitHubリポジトリを探す
2. リポジトリ名の右側にある「Connect」ボタンをクリック

**リポジトリが表示されない場合:**
1. 「Configure account」をクリック
2. GitHubの設定画面で、Renderにアクセスを許可するリポジトリを選択
3. 「Save」をクリックして戻る

### 6.3 Webサービス情報の入力

以下の情報を正確に入力してください：

| 項目 | 入力内容 |
|------|---------|
| **Name** | `gantt-chart-tool`（任意の名前） |
| **Region** | `Oregon (US West)`（データベースと同じリージョン） |
| **Branch** | `main` |
| **Root Directory** | 空欄のまま |
| **Runtime** | `Python 3` |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn main:app` |

### 6.4 プランの選択

1. **Instance Type**: 「Free」を選択（または「Starter $7/month」で常時起動）

### 6.5 環境変数の設定

「Advanced」セクションを展開し、以下の環境変数を追加します：

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `DATABASE_URL` | 先ほどコピーしたInternal Database URL |
| `SECRET_KEY` | ランダムな文字列（例: `your-secret-key-here-change-this`） |

**環境変数の追加方法:**
1. 「Add Environment Variable」をクリック
2. Keyに変数名、Valueに値を入力
3. 3つすべての環境変数を追加

### 6.6 Webサービスの作成

1. すべての設定を確認
2. 「Create Web Service」をクリック

**✅ Webサービスの作成完了！**

---

## ステップ7: デプロイの確認（所要時間: 5～10分）

### 7.1 デプロイプロセスの監視

1. Webサービスの詳細ページが表示される
2. 「Logs」タブでデプロイの進行状況を確認
3. 以下のようなログが表示されます：

```
==> Cloning from https://github.com/...
==> Downloading cache...
==> Running build command './build.sh'...
==> Installing dependencies...
==> Building frontend...
==> Build successful!
==> Starting service with 'gunicorn main:app'...
==> Your service is live 🎉
```

### 7.2 デプロイ完了の確認

1. ステータスが「Live」になるまで待つ（5～10分）
2. 画面上部にURLが表示される（例: `https://gantt-chart-tool.onrender.com`）

### 7.3 アプリケーションへのアクセス

1. 表示されたURLをクリック
2. ガントチャートツールのログイン画面が表示されたら成功！

**初回アクセス時の注意:**
- 無料プランの場合、初回アクセス時に30秒～1分程度かかることがあります
- 「Service Unavailable」と表示された場合は、少し待ってからリロードしてください

**✅ デプロイ完了！**

---

## ステップ8: ログインとテスト（所要時間: 2分）

### 8.1 管理者アカウントでログイン

1. ログイン画面で以下の情報を入力：
   - **メールアドレス**: `admin@gantt.local`
   - **パスワード**: `Admin@2024`
2. 「ログイン」をクリック

### 8.2 動作確認

1. ダッシュボードが表示されることを確認
2. プロジェクトを作成してみる
3. タスクを追加してみる
4. ガントチャートが表示されることを確認

**✅ すべて完了！**

---

## トラブルシューティング

### デプロイが失敗する場合

**エラー: "Build failed"**

1. Renderのログを確認
2. `build.sh`の実行権限を確認
   ```bash
   chmod +x build.sh
   git add build.sh
   git commit -m "Add execute permission to build.sh"
   git push
   ```

**エラー: "Database connection failed"**

1. 環境変数`DATABASE_URL`が正しく設定されているか確認
2. PostgreSQLデータベースが「Available」状態か確認
3. データベースとWebサービスが同じリージョンにあるか確認

### アプリケーションが起動しない場合

**エラー: "Application error"**

1. Renderのログで詳細なエラーメッセージを確認
2. 環境変数がすべて設定されているか確認
3. `Start Command`が`gunicorn main:app`になっているか確認

### 無料プランのスリープについて

**15分間アクセスがないとスリープする**

- 次回アクセス時に30秒～1分の起動時間が必要
- 常時起動したい場合は、有料プラン（$7/月）にアップグレード

**アップグレード方法:**
1. Webサービスの詳細ページを開く
2. 「Settings」タブをクリック
3. 「Instance Type」を「Starter」に変更
4. 「Save Changes」をクリック

---

## 独自ドメインの設定（オプション）

Renderでは無料で独自ドメインを設定できます。

### 手順

1. Webサービスの詳細ページで「Settings」タブを開く
2. 「Custom Domain」セクションで「Add Custom Domain」をクリック
3. 所有しているドメイン名を入力（例: `gantt.example.com`）
4. 表示されるDNS設定をドメインレジストラで設定
5. SSL証明書が自動的に発行される（数分～数時間）

---

## 更新とメンテナンス

### コードを更新する場合

1. GitHubリポジトリでファイルを編集
2. 変更をコミット
3. Renderが自動的に検知して再デプロイ

**または:**

1. ローカルで変更を加える
2. Gitでコミット＆プッシュ
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```
3. Renderが自動的に再デプロイ

### データベースのバックアップ

1. PostgreSQLデータベースの詳細ページを開く
2. 「Backups」タブで手動バックアップを作成
3. または、自動バックアップを有効化（有料プランのみ）

---

## まとめ

おめでとうございます！ガントチャートツールの永久デプロイが完了しました。

**デプロイされたURL:**
- あなたのアプリケーションURL: `https://あなたのサービス名.onrender.com`

**管理者アカウント:**
- メールアドレス: `admin@gantt.local`
- パスワード: `Admin@2024`

**次のステップ:**
1. 管理者パスワードを変更する
2. 新しいユーザーを追加する
3. プロジェクトとタスクを作成する
4. チームメンバーを招待する

**サポートが必要な場合:**
- Renderのドキュメント: https://render.com/docs
- GitHubのヘルプ: https://docs.github.com

ガントチャートツールをお楽しみください！

