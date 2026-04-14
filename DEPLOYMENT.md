# Deployment Manifest: LootThread

This guide documents the configuration required to deploy the LootThread marketplace to Render (or similar platforms).

## 📊 Environment Variables

### Frontend (`LootThread`)
Configure these in the Render Static Site dashboard:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | The public URL of your deployed backend API. | `https://lootthread-api.onrender.com/api` |

### Backend (`lootthread-server`)
Configure these in the Render Web Service dashboard:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | Your MongoDB Atlas connection string. | `mongodb+srv://user:pass@cluster.mongodb.net/lootthread` |
| `JWT_SECRET` | A secure string for signing tactical auth tokens. | `your_secure_random_production_secret` |
| `FRONTEND_URL` | The public URL of your deployed frontend. | `https://lootthread.onrender.com` |
| `PORT` | The port the server should listen on (Render provides this). | `10000` |
| `NODE_ENV` | Set to `production` to disable verbose error stacks. | `production` |

---

## 🚀 Deployment Sequence

1.  **Database**: Provision a MongoDB Atlas cluster and whitelist access.
2.  **Backend**:
    - Build Command: `npm install && npm run build`
    - Start Command: `npm start`
    - Seed (Optional): Run `npm run seed` once from your local environment pointing to the production URI to initialize data.
3.  **Frontend**:
    - Build Command: `npm install && npm run build`
    - Publish Directory: `dist`
