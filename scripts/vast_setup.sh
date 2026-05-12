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
CIVITAI_TOKEN="${CIVITAI_TOKEN:?'環境変数 CIVITAI_TOKEN を設定してください（例: export CIVITAI_TOKEN=xxxxx）'}"

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

NOVA_FILE="$MODELS_DIR/novaAsianXL_illustrious_v7.safetensors"
HASSAKU_FILE="$MODELS_DIR/hassakuXLIllustrious_v22.safetensors"
FACES_FILE="$LORA_DIR/better_faces_sdxl.safetensors"
OPENPOSE_FILE="$CONTROLNET_DIR/OpenPoseXL2.safetensors"

# Nova Asian XL Illustrious v7.0（バージョンID: 2311249）
echo "  → Nova Asian XL Illustrious v7.0"
wget -q --content-disposition -O "$NOVA_FILE" \
  "https://civitai.com/api/download/models/2311249?token=$CIVITAI_TOKEN" &
PID_NOVA=$!

# Hassaku XL Illustrious v2.2（バージョンID: 1697082）
echo "  → Hassaku XL Illustrious v2.2"
wget -q --content-disposition -O "$HASSAKU_FILE" \
  "https://civitai.com/api/download/models/1697082?token=$CIVITAI_TOKEN" &
PID_HASSAKU=$!

# Better Faces SDXL LoRA（バージョンID: 142718）
echo "  → Better Faces SDXL LoRA (435MB)"
wget -q --content-disposition -O "$FACES_FILE" \
  "https://civitai.com/api/download/models/142718?token=$CIVITAI_TOKEN" &
PID_LORA=$!

# OpenPoseXL2 ControlNet（バージョンID: 135867）
echo "  → OpenPoseXL2 ControlNet (218MB)"
wget -q --content-disposition -O "$OPENPOSE_FILE" \
  "https://civitai.com/api/download/models/135867?token=$CIVITAI_TOKEN" &
PID_OPENPOSE=$!

# 各ジョブを個別に待機して終了コードを記録
set +e
wait $PID_NOVA;     RC_NOVA=$?
wait $PID_HASSAKU;  RC_HASSAKU=$?
wait $PID_LORA;     RC_LORA=$?
wait $PID_OPENPOSE; RC_OPENPOSE=$?
set -e

# ダウンロード結果チェック（終了コード + ファイルサイズ検証）
check_job() {
  local label="$1" rc="$2" file="$3" min_bytes="$4"
  if [ "$rc" -ne 0 ]; then
    echo "  ✗ $label: wget 失敗 (終了コード: $rc)" >&2
    return 1
  fi
  if [ ! -f "$file" ]; then
    echo "  ✗ $label: ファイルが存在しません" >&2
    return 1
  fi
  local size
  size=$(stat -c%s "$file")
  if [ "$size" -lt "$min_bytes" ]; then
    echo "  ✗ $label: サイズ異常 ($(( size / 1024 / 1024 ))MB) - ダウンロード失敗の可能性" >&2
    return 1
  fi
  echo "  ✓ $label: $(( size / 1024 / 1024 ))MB"
}

echo ""
echo "  ダウンロード結果:"
DOWNLOAD_OK=true
# モデルは最低500MB、LoRA/ControlNetは最低50MB を閾値とする
check_job "Nova Asian XL Illustrious v7.0" $RC_NOVA     "$NOVA_FILE"     524288000 || DOWNLOAD_OK=false
check_job "Hassaku XL Illustrious v2.2"    $RC_HASSAKU  "$HASSAKU_FILE"  524288000 || DOWNLOAD_OK=false
check_job "Better Faces SDXL LoRA"         $RC_LORA     "$FACES_FILE"     52428800 || DOWNLOAD_OK=false
check_job "OpenPoseXL2 ControlNet"         $RC_OPENPOSE "$OPENPOSE_FILE"  52428800 || DOWNLOAD_OK=false

if [ "$DOWNLOAD_OK" = false ]; then
  echo ""
  echo "  ✗ ダウンロードに失敗したファイルがあります。上記のエラーを確認してください。"
  exit 1
fi
echo ""
echo "  ✓ 全ファイルのダウンロード完了"

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
