import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Gestão de Patrimônio API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      equipment: '/api/equipment',
      purchases: '/api/purchases',
      responsibilityTerms: '/api/responsibility-terms',
      history: '/api/history',
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Gestão de Patrimônio API                           ║
║                                                          ║
║   Server running on: http://localhost:${PORT}              ║
║                                                          ║
║   Available endpoints:                                   ║
║   - GET  /api/health                                     ║
║   - GET  /api/equipment                                  ║
║   - GET  /api/purchases                                  ║
║   - GET  /api/responsibility-terms                       ║
║   - GET  /api/history                                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
