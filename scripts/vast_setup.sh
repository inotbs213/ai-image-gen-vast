#!/bin/bash
###############################################################################
# vast_setup.sh - Vast.ai 新インスタンス初回セットアップ
#
# 使い方:
#   1. Vast.aiで新インスタンスを起動（テンプレート: SD WebUI A1111）
#   2. Jupyter Lab → Terminal を開く
#   3. 以下を実行:
#        wget -O setup.sh https://raw.githubusercontent.com/inotbs213/ai-image-gen-vast/main/scripts/vast_setup.sh
#        chmod +x setup.sh
#        ./setup.sh
#
# 所要時間: 約20分
###############################################################################

set -e  # エラーで停止
CIVITAI_TOKEN="***REMOVED***"

WEBUI_DIR="/workspace/stable-diffusion-webui"
MODELS_DIR="$WEBUI_DIR/models/Stable-diffusion"
LORA_DIR="$WEBUI_DIR/models/Lora"
CONTROLNET_DIR="$WEBUI_DIR/models/ControlNet"
EXT_DIR="$WEBUI_DIR/extensions"

echo "================================================"
echo "  Vast.ai セットアップ開始"
echo "================================================"

###############################################################################
# 1. ディレクトリ作成
###############################################################################
echo ""
echo "[1/5] ディレクトリ作成..."
mkdir -p "$MODELS_DIR" "$LORA_DIR" "$CONTROLNET_DIR" "$EXT_DIR"

###############################################################################
# 2. モデル・LoRAダウンロード（並列）
###############################################################################
echo ""
echo "[2/5] モデル・LoRAダウンロード（並列実行）..."

# RealVisXL V4.0（バージョンID: 361593 - 動作確認済み）
echo "  → RealVisXL V4.0 (6.5GB)"
wget -q -O "$MODELS_DIR/RealVisXL_V4.0.safetensors" \
  "https://civitai.com/api/download/models/361593?token=$CIVITAI_TOKEN" &
PID_REALVIS=$!

# JuggernautXL v9（バージョンID: 782002）
echo "  → JuggernautXL v9 (7GB)"
wget -q -O "$MODELS_DIR/JuggernautXL_v9_RunDiffusionPhoto_v2.safetensors" \
  "https://civitai.com/api/download/models/782002?token=$CIVITAI_TOKEN" &
PID_JUGG=$!

# Better Faces SDXL LoRA（バージョンID: 142718）
echo "  → Better Faces SDXL LoRA (435MB)"
wget -q -O "$LORA_DIR/better_faces_sdxl.safetensors" \
  "https://civitai.com/api/download/models/142718?token=$CIVITAI_TOKEN" &
PID_LORA=$!

# OpenPoseXL2（バージョンID: 135867）※ファイル名注意
echo "  → OpenPoseXL2 ControlNet (218MB)"
wget -q -O "$CONTROLNET_DIR/OpenPoseXL2.safetensors" \
  "https://civitai.com/api/download/models/135867?token=$CIVITAI_TOKEN" &
PID_OPENPOSE=$!

# 全DL待機
wait $PID_REALVIS $PID_JUGG $PID_LORA $PID_OPENPOSE
echo "  ✓ ダウンロード完了"

# サイズ検証
echo ""
echo "  ファイルサイズ確認:"
ls -lh "$MODELS_DIR/RealVisXL_V4.0.safetensors"
ls -lh "$MODELS_DIR/JuggernautXL_v9_RunDiffusionPhoto_v2.safetensors"
ls -lh "$LORA_DIR/better_faces_sdxl.safetensors"
ls -lh "$CONTROLNET_DIR/OpenPoseXL2.safetensors"

###############################################################################
# 3. 拡張機能インストール
###############################################################################
echo ""
echo "[3/5] 拡張機能インストール..."

cd "$EXT_DIR"

if [ ! -d "sd-webui-controlnet" ]; then
  echo "  → ControlNet（v1.1.454 / commit 9fae97f に固定）"
  git clone -q https://github.com/Mikubill/sd-webui-controlnet
  cd sd-webui-controlnet
  git checkout -q 9fae97f
  cd "$EXT_DIR"
fi

if [ ! -d "adetailer" ]; then
  echo "  → ADetailer"
  git clone -q https://github.com/Bing-su/adetailer
fi

###############################################################################
# 4. 依存関係修正（重要：起動前に必ず実行）
###############################################################################
echo ""
echo "[4/5] 依存関係修正..."
echo "  → numpy/pillow/opencv/scikit-image を固定バージョンに"

pip install -q --break-system-packages \
  numpy==1.26.4 \
  "pillow<10" \
  opencv-python==4.8.0.76 \
  opencv-python-headless==4.8.0.76

# scikit-imageはnumpyに合わせてソースから再ビルド
pip install -q --break-system-packages --force-reinstall --no-binary scikit-image scikit-image

echo "  ✓ 依存関係OK"

###############################################################################
# 5. 完了メッセージ
###############################################################################
echo ""
echo "================================================"
echo "  セットアップ完了！"
echo "================================================"
echo ""
echo "次のステップ:"
echo "  ./vast_start.sh を実行してA1111を起動してください"
echo ""
