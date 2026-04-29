# AI画像生成ツール プロジェクト

## 🎯 目標

[CharaxAI](https://www.charaxai.com/) のような **ステップ式UIで高品質な画像を生成できるツール** を、自分専用に構築する。

- 全身・グラビア系のリアル系画像生成
- スマホからもアクセス可能
- プロンプトを自分で組まなくてOK（選択肢式）
- NSFW対応（プラットフォーム規制なし）

---

## 📁 プロジェクト構成

```
ai-image-gen-vast/
├── app/
│   ├── page.tsx                  メインUI（ステップ式）
│   └── api/generate/route.ts     APIプロキシ
├── lib/
│   └── buildPrompt.ts            プロンプト生成ロジック
├── scripts/
│   ├── vast_setup.sh             🆕 Vast.ai 初回セットアップ
│   └── vast_start.sh             🆕 毎回起動用
├── docs/
│   ├── PROJECT_STATUS.md         このファイル
│   └── archive/                  過去プロジェクトの記録
│       ├── colab-version.md
│       └── fal-version.md
├── .env.local
└── package.json
```

---

## ⚙️ 現在の構成（確定）

| 項目 | 内容 |
|---|---|
| **GPU** | Vast.ai RTX 3090（Japan） |
| **バックエンド** | AUTOMATIC1111 WebUI |
| **ポート** | 17861 |
| **トンネル** | cloudflared（毎回URL変わる） |
| **デフォルトモデル** | RealVisXL V4.0 |
| **サブモデル** | JuggernautXL v9 |
| **LoRA** | Better Faces SDXL |
| **拡張** | ControlNet v1.1.454 / ADetailer |
| **フロント** | Next.js（localhost:3000） |
| **生成パラメータ** | DPM++ 2M Karras / steps:28 / CFG:7.0 |

---

## 🚀 起動手順

### 🆕 新インスタンス作成時（初回のみ・約20分）

1. Vast.aiで **RTX 3090 / Japan / 50GB / SD WebUI A1111** を借りる
2. Jupyter Lab → Terminal を開く
3. 以下を実行:
   ```bash
   wget -O setup.sh https://raw.githubusercontent.com/inotbs213/ai-image-gen-vast/main/scripts/vast_setup.sh
   chmod +x setup.sh
   ./setup.sh
   ```
4. 続いて起動:
   ```bash
   wget -O start.sh https://raw.githubusercontent.com/inotbs213/ai-image-gen-vast/main/scripts/vast_start.sh
   chmod +x start.sh
   ./start.sh
   ```
5. 表示されるURLをコピー → Claude Codeに以下を投げる:

   > `.env.local`の`API_URL`を `<URL>` に更新して`npm run dev`を再起動してください

### 📅 毎回起動時（約2分）

1. Vast.aiで該当インスタンスを **Start**
2. Jupyter Lab → Terminal を開く
3. 実行:
   ```bash
   ./start.sh
   ```
4. 表示されるURLをコピー → Claude Codeに上記の指示文を投げる

---

## 💰 Vast.ai 料金管理

| 操作 | 課金 | 用途 |
|---|---|---|
| **Running** | $0.172/hr（GPU+ディスク） | 使用中 |
| **Stopped** | $0.01〜0.02/hr（ディスクのみ） | 一時休止（推奨） |
| **Destroyed** | $0 | 完全削除（モデル全部消える） |

**運用方針**：使い終わったら **Stop**。長期間使わない時のみ **Destroy**。

---

## 📝 開発ロードマップ

### ✅ 完了済み

- ステップ式UIの実装（STEP1〜6 + 確認画面）
- 人種・体型・胸サイズ・ポーズ・表情・髪型・背景の選択UI
- グラビア系ポーズ7種追加
- baseNegativeからNSFW妨害ワード削除
- 顔・肌クオリティワード追加
- Better Faces SDXL LoRA導入
- ControlNet・ADetailer 導入
- セットアップ・起動スクリプト作成

### 🔧 進行中

- [ ] vast_setup.sh / vast_start.sh の動作検証
- [ ] GitHubリポジトリ整備

### 🎯 次にやりたい（優先度高）

- [ ] **Better Faces LoRA をUIに正式組み込み**（強度スライダー追加）
- [ ] **Skin Realism SDXL LoRA 導入**

### 📌 中期ゴール

- [ ] Vercelデプロイ（スマホから公開URL経由でアクセス）
- [ ] モデル選択UI（RealVisXL / Juggernaut 切り替え）
- [ ] ControlNet 同時使用（OpenPose + Depth）
- [ ] Hires.fix 対応（高解像度）

### 🔮 長期ゴール

- [ ] CharaxAI レベルのUI完成度
- [ ] 画像履歴の保存・再生成機能
- [ ] img2img でのバリエーション生成

---

## 🐛 既知の問題と対処法

### Civitai のバージョンIDが変わる
- **症状**：以前動いていたDLコマンドがエラー
- **対処**：`vast_setup.sh` で動作確認済みのバージョンIDを使用
- **動作確認済みID**：
  - RealVisXL V4.0 → `361593`
  - JuggernautXL v9 → `782002`
  - Better Faces SDXL → `142718`
  - OpenPoseXL2 → `135867`

### numpy / scikit-image の互換エラー
- **症状**：`numpy.dtype size changed, may indicate binary incompatibility`
- **対処**：`vast_setup.sh` の `[4/5] 依存関係修正` を必ず実行
- **キモ**：`scikit-image` を `--no-binary` オプションでソースから再ビルド

### ControlNet の mediapipe エラー
- **症状**：拡張インストール時に依存解決失敗
- **対処**：commit `9fae97f`（v1.1.454）に固定

### ポート 17860 の競合
- **症状**：A1111 起動時にポート使用中エラー
- **対処**：ポート 17861 を使用（スクリプトで自動設定済み）

### A1111 起動コマンド
- `webui.sh` は root 権限エラーで使用不可
- `python launch.py` を使用（スクリプトで自動）

### VAE設定
- SDXLモデルには VAE 内蔵
- 外部VAE設定すると画像が崩れる → **Automatic のまま**

### cloudflared URL が毎回変わる
- **対処**：起動するたびにURLをコピー → Claude Code に投げて`.env.local`を更新

---

## 🔑 開発で使うリソース

### Vast.ai
- ダッシュボード: https://cloud.vast.ai/
- 推奨スペック: RTX 3090 / Japan / 50GB

### Civitai
- API キー: 環境変数 or スクリプトに埋め込み済み
- モデル一覧: https://civitai.com/

### GitHub
- リポジトリ: `inotbs213/ai-image-gen-vast`（予定）

---

## 🛠️ Claude Code への定型指示

### URL更新時
```
.env.localのAPI_URLを <新URL> に更新してnpm run devを再起動してください
```

### セッション終了時
```
今回のトークで行った作業・変更点・新たな問題・解決策を
docs/PROJECT_STATUS.md に追記・更新してください。
```

### 新しいトークを始める時
```
docs/PROJECT_STATUS.md を読み込んで現在の進捗を把握してから作業を開始してください。
```

---

## 📚 開発履歴（参考）

過去の試行錯誤の詳細は `docs/archive/` を参照:
- `colab-version.md` … Google Colab + ngrok 時代
- `fal-version.md` … Fal.ai 検証時代

主な変遷:
1. **Colab + ngrok 時代** → 90分セッション切れが致命的
2. **Fal.ai 検証** → NSFW 黒塗りで頓挫
3. **Vast.ai + 自作 FastAPI 時代** → 拡張性に限界
4. **Vast.ai + A1111 時代（現在）** ← ✅
