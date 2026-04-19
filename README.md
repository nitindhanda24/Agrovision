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

## Run Backend

```bash
cd backend
npm install
npm start
```

The backend defaults to `http://localhost:5000`.

Use another port when `5000` is busy:

```bash
set PORT=5050
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
