# AI画像生成ツール プロジェクト

---

## 🔄 セッション引き継ぎ情報（新セッション開始時に確認）

| 項目 | 内容 |
|---|---|
| **Vercel本番URL** | https://ai-image-gen-vast.vercel.app |
| **GitHubリポジトリ** | `inotbs213/ai-image-gen-vast`（Public） |
| **Vast.ai インスタンス** | 前回 #36622318 は削除済み → **再作成が必要** |
| **最終更新** | 2026-05-17 |

### ✅ 直近の完了作業
- git履歴クリーンアップ（git filter-repo でCivitAIトークン削除）
- リポジトリPublic化
- CivitAIモデルバージョンID確定（Nova: 2311249 / Hassaku: 1697082）
- setup_with_token.sh 方式による安全な運用フロー確立

### 🎯 次セッションでの作業予定
1. Vast.ai インスタンス再作成・セットアップ
2. シックスナイン生成の確実性向上（視点別選択肢に分割）
3. 解像度の横長選択が効いていない問題の調査・修正
4. X線透視表現の導入

---

## 🎯 目標

[CharaxAI](https://www.charaxai.com/) のような **タブ式UIで高品質な画像を生成できるツール** を、自分専用に構築する。

- 全身・グラビア系のリアル系画像生成
- スマホからもアクセス可能
- プロンプトを自分で組まなくてOK（選択肢式）
- NSFW対応（プラットフォーム規制なし）

---

## 📁 プロジェクト構成

```
ai-image-gen-vast/
├── app/
│   ├── page.tsx                  メインUI（タブ式・6タブ）
│   └── api/generate/route.ts     APIプロキシ（シード値返却対応）
├── lib/
│   ├── buildPrompt.ts            プロンプト生成ロジック＋StepFormData型
│   └── optionsData.ts            選択肢データ＋MODELS定義
├── scripts/
│   ├── vast_setup.sh             Vast.ai 初回セットアップ
│   └── vast_start.sh             毎回起動用
├── docs/
│   ├── PROJECT_STATUS.md         このファイル
│   └── archive/
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
| **メインモデル** | Nova Asian XL Illustrious v7.0 |
| **サブモデル** | Hassaku XL Illustrious v2.2 |
| **LoRA** | Better Faces SDXL（UIからON/OFF・強度調整可） |
| **拡張** | ControlNet v1.1.454 / ADetailer |
| **フロント** | Next.js（localhost:3000） |
| **デフォルトパラメータ** | Euler a / steps:30 / CFG:4.0 / 832×1216 |

---

## 🎨 モデルラインナップ（確定：2モデル）

| モデル | ファイル名 | 用途 | Sampler | CFG / Steps | 解像度 |
|---|---|---|---|---|---|
| **Nova Asian XL v7.0** | `novaAsianXL_illustrious_v7.safetensors` | アジア系リアル（主用途） | Euler a | 4.0 / 30 | 832×1216 |
| **Hassaku XL v2.2** | `hassakuXLIllustrious_v22.safetensors` | アニメ系 | Euler a | 5.0 / 28 | 832×1216 |

### 検証で却下したモデル（Vast.ai側で削除済み）
- RealVisXL V4.0, JuggernautXL v9 → Illustrious系に移行したため不要
- ArienMixXL v4.5, fuduki_mix v2.0, Pony Realism v2.2 → 実機テストで不採用

---

## 🖥️ UIタブ構成（現行）

| タブ | 内容 |
|---|---|
| 👤 キャラ | gender, age, ethnicity, skin_tone, body_type, breast_size |
| 💄 顔・髪 | face_type, hair_color, hair_style, eye_color, eye_shape, mouth, expression |
| 👗 衣装 | outfit, outfit_color, outfit_material, outfit_state, exposure |
| 📐 ポーズ | composition, angle, pose |
| 🌆 シーン | background, nsfw_situation, camera, lighting |
| ⚙️ 詳細 | nsfw_level, model, 解像度, steps, cfg, LoRA, freePrompt, extraNegative, seed |

### 選択肢数（主要カテゴリ）
- outfit: 29 / pose: 29 / expression: 18 / background: 23 / composition: 10 / angle: 11
- 新規追加カテゴリ: outfit_material(9), outfit_state(7), camera(8), lighting(10), nsfw_level(5), nsfw_situation(9)

---

## 🔑 シード値・再生成機能

- 生成後にシード値が表示される
- 「🔒 顔を固定中」トグルでシードを固定
- シード固定中に衣装・ポーズなどを変更 → 同じ顔のまま再生成可能
- 詳細タブで手動シード入力も可能
- 下部ボタンのラベルが状態に応じて変化（生成する / 同じ顔で再生成 / 再生成）

---

## 🚀 起動手順

> **注意**: リポジトリはPublicのため、CivitAIトークンをGitHubにpushしてはいけない。
> `setup_with_token.sh` はJupyter Terminal上でのみ手動作成し、Gitには含めない。

### 🆕 新インスタンス作成時（初回のみ・約20分）

1. Vast.aiで **RTX 3090 / Japan / 50GB / SD WebUI A1111** を借りる
2. Jupyter Lab → Terminal を開く
3. **`setup_with_token.sh` を手動作成**（トークンを環境変数として渡すラッパー）：
   ```bash
   cat > ~/setup_with_token.sh << 'EOF'
   #!/bin/bash
   export CIVITAI_TOKEN="your_civitai_token_here"
   bash ~/setup.sh
   EOF
   chmod +x ~/setup_with_token.sh
   ```
4. `setup.sh` をダウンロードして実行：
   ```bash
   wget -O ~/setup.sh https://raw.githubusercontent.com/inotbs213/ai-image-gen-vast/main/scripts/vast_setup.sh
   chmod +x ~/setup.sh
   ~/setup_with_token.sh
   ```
5. 続いて `start.sh` をダウンロードして起動：
   ```bash
   wget -O ~/start.sh https://raw.githubusercontent.com/inotbs213/ai-image-gen-vast/main/scripts/vast_start.sh
   chmod +x ~/start.sh
   ~/start.sh
   ```
6. 表示されるURLをコピー → Claude Codeに以下を投げる:

   > `.env.local`の`API_URL`を `<URL>` に更新して`npm run dev`を再起動してください

### 📅 毎回起動時（約2分）

1. Vast.aiで該当インスタンスを **Start**
2. Jupyter Lab → Terminal を開く
3. 実行（トークン不要）：
   ```bash
   ~/start.sh
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

- ステップ式UI実装（STEP1〜6 + 確認画面）→ **タブ式UI（6タブ）に全面刷新**
- 選択肢データを `lib/optionsData.ts` に分離（17カテゴリ → 23カテゴリ、+91選択肢）
- シード値機能（顔固定で衣装変更等が可能）
- Better Faces SDXL LoRA をUIに正式組み込み（強度スライダー）
- モデル系統別プロンプトシステム実装（ModelDef型、推奨パラメータ自動適用）
- モデル選択UI（MODELS配列で管理、切り替え時にCFG/steps/解像度が自動更新）
- NSFW強度・シチュエーション選択肢の追加
- 衣装素材・状態・撮影スタイル・ライティング選択肢の追加
- ControlNet・ADetailer 導入
- セットアップ・起動スクリプト作成
- full body時の解像度自動切替（832×1216）
- A1111レスポンスからシード値を取得してフロントに返却

### 🐛 既知の課題

- **顔のバリエーションが少ない問題**: プロンプトを絞ると顔が固定化される傾向あり。Stable Diffusion XLの特性（プロンプトの絞り込みすぎが主因）。根本的な解決策はまだ未実装。

### 🎯 次にやりたい（優先度高）

- [ ] **シックスナイン生成の確実性向上**（視点別の選択肢に分割）
- [ ] **解像度の横長選択が効いていない問題**の調査・修正
- [ ] **X線透視表現の導入**（中出し透視・フェラ透視）
  - 全体透視パターン + 左上インセット切り抜きパターン両方
- [ ] **童顔表現の強化**（保留中、別途相談）
- [ ] **ADetailer に LoRA を効かせる設定**（顔だけ別途LoRA処理でバリエーション改善）
- [ ] **ControlNet の活用**（OpenPose で構図固定）

### 📌 中期ゴール

- [ ] Hires.fix 対応（高解像度）
- [ ] img2img でのバリエーション生成
- [ ] 画像履歴の保存・再生成機能

### 🔮 長期ゴール

- [ ] CharaxAI レベルのUI完成度

---

## 🐛 既知の問題と対処法

### cloudflared URL が毎回変わる
- **対処**：起動するたびにURLをコピー → Claude Code に投げて`.env.local`を更新

### ポート 17860 の競合
- **症状**：A1111 起動時にポート使用中エラー
- **対処**：ポート 17861 を使用（スクリプトで自動設定済み）

### A1111 起動コマンド
- `webui.sh` は root 権限エラーで使用不可
- `python launch.py` を使用（スクリプトで自動）

### VAE設定
- Illustrious系モデルには VAE 内蔵
- 外部VAE設定すると画像が崩れる → **Automatic のまま**

### numpy / scikit-image の互換エラー
- **症状**：`numpy.dtype size changed, may indicate binary incompatibility`
- **対処**：`vast_setup.sh` の `[4/5] 依存関係修正` を必ず実行
- **キモ**：`scikit-image` を `--no-binary` オプションでソースから再ビルド

### ControlNet の mediapipe エラー
- **症状**：拡張インストール時に依存解決失敗
- **対処**：commit `9fae97f`（v1.1.454）に固定

### Civitai のバージョンIDが変わる
- **症状**：以前動いていたDLコマンドがエラー
- **対処**：`vast_setup.sh` で動作確認済みのバージョンIDを使用
- **現行モデルのID**：
  - Nova Asian XL Illustrious v7.0 → `2311249`
  - Hassaku XL Illustrious v2.2 → `1697082`
  - Better Faces SDXL → `142718`

---

## 🔑 開発で使うリソース

### Vast.ai
- ダッシュボード: https://cloud.vast.ai/
- 推奨スペック: RTX 3090 / Japan / 50GB

### Civitai
- API キー: 環境変数経由で渡す（`setup_with_token.sh`）
- モデル一覧: https://civitai.com/

### GitHub
- リポジトリ: `inotbs213/ai-image-gen-vast`（**Public**）
- git履歴クリーンアップ済み（git filter-repo で過去のCivitAIトークンを削除）
- バックアップ: `claude-work/ai-image-gen-vast-backup.git`

### Vercel
- 本番URL: https://ai-image-gen-vast.vercel.app

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
4. **Vast.ai + A1111 + ステップ式UI時代** → UIが使いにくく刷新
5. **Vast.ai + A1111 + タブ式UI時代（現在）** ← ✅
