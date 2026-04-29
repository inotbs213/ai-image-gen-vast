#!/bin/bash
###############################################################################
# vast_start.sh - A1111 + cloudflared 起動スクリプト
#
# 使い方:
#   インスタンスを Stop → Start した後、ターミナルで以下を実行:
#     ./vast_start.sh
#
# 所要時間: 約2分
###############################################################################

WEBUI_DIR="/workspace/stable-diffusion-webui"
LOG_FILE="/workspace/webui.log"
PORT=17861

echo "================================================"
echo "  A1111 起動開始"
echo "================================================"

###############################################################################
# 1. 既存プロセスの停止
###############################################################################
echo ""
echo "[1/4] 既存プロセスの停止..."
pkill -f "launch.py" 2>/dev/null || true
pkill -f "cloudflared" 2>/dev/null || true
sleep 3

###############################################################################
# 2. A1111起動
###############################################################################
echo ""
echo "[2/4] A1111起動中（約90秒）..."
cd "$WEBUI_DIR"
nohup python launch.py --api --port $PORT --listen > "$LOG_FILE" 2>&1 &

###############################################################################
# 3. Model loaded を待つ
###############################################################################
echo ""
echo "[3/4] モデル読み込み待機..."
TIMEOUT=180
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if grep -q "Model loaded" "$LOG_FILE" 2>/dev/null; then
    echo "  ✓ モデル読み込み完了"
    break
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
  echo "  待機中... ${ELAPSED}秒経過"
done

if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "  ✗ タイムアウト。ログを確認してください: tail -50 $LOG_FILE"
  exit 1
fi

# モデル・LoRA認識
echo ""
echo "  → モデル・LoRA一覧の更新..."
curl -s -X POST "http://localhost:$PORT/sdapi/v1/refresh-checkpoints" > /dev/null
curl -s -X POST "http://localhost:$PORT/sdapi/v1/refresh-loras" > /dev/null
echo "  ✓ 認識完了"

###############################################################################
# 4. cloudflared起動
###############################################################################
echo ""
echo "[4/4] cloudflared起動..."
echo ""
echo "================================================"
echo "  下に表示されるURLをコピーして"
echo "  Claude Codeに以下のように指示してください:"
echo ""
echo "  「.env.localのAPI_URLを <URL> に更新して"
echo "   npm run devを再起動」"
echo "================================================"
echo ""

cloudflared tunnel --url "http://localhost:$PORT"
