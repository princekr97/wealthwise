# Vercel Serverless API

This directory contains the serverless function configuration for deploying the WealthWise backend to Vercel.

## Files

- **index.js** - Entry point for the Vercel serverless function. Exports the Express app configured in `../src/app.js`

## How It Works

When deployed to Vercel, this file (`api/index.js`) acts as the handler for all HTTP requests matching the routes defined in `vercel.json`.

The Express application in `../src/app.js` receives all requests and handles them as it would in a traditional server.

## Local Development

For local development, use the `server.js` file in the root directory:
```bash
npm start
```

## Production Deployment

For Vercel deployment, the serverless function automatically uses `api/index.js`:
```bash
vercel --prod
```

## Environment Variables

All environment variables from Vercel's project settings are automatically available to this function through `process.env`.

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Frontend origin for CORS

See `.env.example` in the root directory for all required variables.
