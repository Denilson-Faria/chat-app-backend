import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/authroutes.js';
import stickerRoutes from './routes/stickers.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  '/stickers',
  express.static(path.resolve('stickers'))
);


app.use('/api/auth', authRoutes);
app.use('/api/stickers', stickerRoutes);

export default app;
