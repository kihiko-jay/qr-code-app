import cors from 'cors';

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://*.app.github.dev',
  'https://*.github.dev',
  ...(process.env.ADDITIONAL_ALLOWED_ORIGINS?.split(',') || [])
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Check against allowed origins
    if (allowedOrigins.some(allowed => {
      return origin === allowed || 
             (allowed.includes('*') && origin.endsWith(allowed.split('*')[1]));
    })) {
      return callback(null, true);
    }

    console.warn(`CORS blocked for origin: ${origin}`);
    callback(new Error(`Not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Forwarded-For',
    'X-Access-Token'
  ],
  exposedHeaders: [
    'Authorization',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining'
  ],
  maxAge: 600, // 10 minutes
  optionsSuccessStatus: 204
};

// Create middleware instances
export const corsMiddleware = cors(corsOptions);
export const corsPreflight = cors(corsOptions);

// Debugging middleware (separate file recommended)
export const requestLogger = (req, res, next) => {
  console.log('\n===== Incoming Request =====');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', {
    'content-type': req.headers['content-type'],
    authorization: req.headers.authorization ? '*****' : 'none',
    cookie: req.headers.cookie ? '*****' : 'none'
  });
  console.log('===========================');
  next();
};