import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import campusConnectRoutes from './routes/campusConnect.js';
import { env } from './config/env.js';

const app = express();

app.use(cors({ origin: env.nodeEnv === 'production' ? process.env.CLIENT_URL : true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CollegeFlow API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/campus-connect', campusConnectRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(env.port, () => {
  console.log(`CollegeFlow API listening on http://localhost:${env.port}`);
});

export default app;
