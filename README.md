# AgroVision

Smart Crop Price Information System for farmers and traders.

## Features

- Farmer and trader registration/login
- Farmer crop listings with price, quantity and mandi
- Trader crop browsing and order requests
- Farmer order approval/rejection
- Trader purchase requests with crop name, image upload, price, quantity and notes
- Farmer request review with accept/reject actions and trader details
- Chat through the backend API

## Main APIs

- `POST /api/crop-requests/upload-image` uploads a request image
- `POST /api/crop-requests` sends a trader crop purchase request
- `GET /api/crop-requests` fetches role-based crop requests
- `PUT /api/crop-requests/:id` edits pending trader requests or accepts/rejects farmer requests
- `GET /api/products` fetches crop listings

## Requirements

- Node.js
- MongoDB running locally, or a `MONGO_URI` environment variable

## Environment Variables

Backend:

- `MONGO_URI` MongoDB connection string
- `JWT_SECRET` secret used to sign auth tokens
- `CLIENT_URL` allowed frontend origin for CORS
  Multiple origins can be provided as a comma-separated list.
- `PORT` optional backend port, defaults to `5000`

Frontend:

- `VITE_API_PROXY_TARGET` backend URL used only for local `vite` dev proxy
- `VITE_API_URL` backend base URL used in production builds

## Run Backend

```bash
cd backend
npm install
set JWT_SECRET=replace-with-a-strong-secret
npm start
```

The backend defaults to `http://localhost:5000`.

Use another port when `5000` is busy:

```bash
set PORT=5050
npm start
```

To allow a deployed frontend:

```bash
set CLIENT_URL=https://your-frontend-domain.vercel.app
npm start
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:3000` and proxies `/api` to `http://localhost:5000`.

If the backend is on another port:

```bash
set VITE_API_PROXY_TARGET=http://localhost:5050
npm run dev
```

## Deploy Notes

Backend:

- Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`
- Start command: `npm start`
- Health check: `/api/health`
- Uploaded images are saved in `backend/uploads`; on many cloud hosts this storage is temporary, so uploaded files may disappear after redeploys or restarts

Frontend:

- Install dependencies before building: `npm install`
- Build command: `npm run build`
- Set `VITE_API_URL` to your deployed backend base URL, for example `https://your-backend-domain.onrender.com/api`

Common deployment issue:

- If login or API calls fail in the browser but work in Postman, the first thing to verify is that `CLIENT_URL` exactly matches the frontend domain and that `VITE_API_URL` points to the backend `/api` base
