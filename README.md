# AI Image Generator (Vast.ai + SDXL)

Next.js フロントエンドから Vast.ai 上の Stable Diffusion WebUI (A1111) を操作する画像生成アプリ。

## Vast.ai 上での運用手順

### 初回セットアップ（新インスタンス起動時）

1. Vast.ai でインスタンスを起動し、Jupyter Lab → Terminal を開く

2. セットアップスクリプトを取得：
   ```bash
   wget -O ~/setup.sh https://raw.githubusercontent.com/inotbs213/ai-image-gen-vast/main/scripts/vast_setup.sh
   chmod +x ~/setup.sh
   ```

3. CivitAI トークンをセットして実行（トークンは環境変数で渡す）：
   ```bash
   export CIVITAI_TOKEN="your_civitai_token_here"
   bash ~/setup.sh
   ```

   > トークンを毎回入力する手間を省くには、ローカルにラッパースクリプトを作っておくと便利です（Gitには含めない）:
   > ```bash
   > cat > ~/setup_with_token.sh << 'EOF'
   > #!/bin/bash
   > export CIVITAI_TOKEN="your_civitai_token_here"
   > bash ~/setup.sh
   > EOF
   > chmod +x ~/setup_with_token.sh
   > ```
   > 以降は `./setup_with_token.sh` だけで実行できます。

4. セットアップ完了後、A1111 を起動：
   ```bash
   wget -O ~/start.sh https://raw.githubusercontent.com/inotbs213/ai-image-gen-vast/main/scripts/vast_start.sh
   chmod +x ~/start.sh
   ./start.sh
   ```

### 2回目以降の起動（Stop → Start 後）

インスタンスを再起動したら Start のみ：

```bash
./start.sh
```

表示された cloudflare URL を `.env.local` の `API_URL` に設定して `npm run dev` を再起動。

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
