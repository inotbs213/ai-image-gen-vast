# 開発履歴：Google Colab 時代（〜2026-04-18）

## 概要

最初のバージョン。Google Colab の無料 GPU + ngrok でトンネルを張り、
ローカルの Next.js から API 経由で画像生成していた。

## 構成

- **フロント**: Next.js（localhost:3000）
- **バックエンド**: Google Colab（FastAPI + uvicorn）
- **トンネル**: ngrok 無料枠
- **モデル**: Juggernaut-XL-v9（SDXL系）

## メリット

- 完全無料（GPU・ngrok とも無料枠）
- セットアップが比較的シンプル

## 致命的な問題

| 問題 | 詳細 |
|---|---|
| **90分セッション切れ** | Colab無料枠の制限。再起動するたびに全工程やり直し |
| **モデルDL毎回必要** | Colab再起動でファイルが消える |
| **ngrok URL毎回変わる** | `.env.local` の更新が毎回必要 |
| **T4 GPU が遅い** | 1024×1024 で VAE クラッシュ → 768×768 で運用 |

## 主な設定（参考）

```python
# サンプラー
DPMSolverMultistepScheduler（DPM++ 2M Karras）

# パラメータ
steps: 24
cfg_scale: 5.5
解像度: 768x768

# メモリ最適化
pipe.enable_vae_slicing()
pipe.enable_vae_tiling()
```

## 移行理由

90分制限が致命的で、本格的に使うには厳しいと判断。
有料 GPU（Vast.ai）への移行を決定。

## 学び

- Colab は実験には良いが、本番運用には不向き
- GPU メモリの制約が大きい（T4 だと SDXL のフル機能を使えない）
- 無料枠での運用は時間制限が常に足枷になる
