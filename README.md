# Cloudflare Worker HTML Transformer API - Frontend Client

A simple, single-page API client built with Vue 3, Vite, Tailwind CSS, and shadcn-vue.

## Features
- **Transformer**: Request forms with target URL, output format, cache settings.
- **Cache Update**: Form to manually update cached content for specific URLs.
- **Services**: Register and manage browser services (HTTP or webhooks).
- **Settings**: Configure the backend API URL and Bearer Token.

## Local Development

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173/`.

### Build for Production
```bash
npm run build
```

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages via GitHub Actions.

1. Push your code to the `main` branch.
2. Ensure you have enabled **GitHub Actions** in your repository settings.
3. In your repository settings, go to **Pages** and set the **Source** to **GitHub Actions**.
4. The `.github/workflows/deploy.yml` workflow will automatically build and deploy the `dist` directory.

**Note**: The `base` path in `vite.config.ts` and the vue-router history are configured for a repository named `proxy-api-pages`. If your repository name is different, please update:
- `vite.config.ts`: `base: "/<your-repo-name>/"`
- `src/router/index.ts`: `createWebHashHistory('/<your-repo-name>/')`
