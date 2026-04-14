# Deployment Manifest: LootThread

This guide documents the configuration required to deploy the LootThread marketplace to Render.

## 📊 Environment Variables

### Frontend (`LootThread`)
Configure these in the Render Static Site dashboard:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | The public URL of your deployed backend API. | `https://lootthread-server.onrender.com/api` |

### Backend (`lootthread-server`)
Configure these in the Render Web Service dashboard:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | Your MongoDB Atlas connection string. | `mongodb+srv://user:pass@cluster.mongodb.net/lootthread` |
| `JWT_SECRET` | A secure string for signing tactical auth tokens. | `your_secure_random_production_secret` |
| `FRONTEND_URL` | The public URL of your deployed frontend. | `https://lootthread.onrender.com` |
| `PORT` | The port Render listens on. | `10000` |
| `NODE_ENV` | Set to `production`. | `production` |

---

## 🚀 Render Dashboard Settings (Backend)

To avoid `MODULE_NOT_FOUND` errors, ensure these settings are used:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

---

## 🛠️ Troubleshooting: "TypeScript in Production"

If you encounter `MODULE_NOT_FOUND` errors:
1.  **Check Build Output**: Ensure `npm run build` is running in your dashboard. This command compiles `.ts` files into the `dist/` directory.
2.  **Verify Start Command**: Ensure your **Start Command** is `npm start`. This points Render to `node dist/index.js`, which is the compiled entry point.
3.  **Local Test**: You can test the production build locally by running:
    ```bash
    npm run build
    npm start
    ```
