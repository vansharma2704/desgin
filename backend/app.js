import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import designRoutes from './routes/designRoutes.js';
import assetRoutes from './routes/assetRoutes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// REST APIs
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/assets', assetRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
