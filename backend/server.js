import "dotenv/config";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import CentralRouter from './src/routes/index.js';
import { applySanitizers } from "./src/middleware/sanitize.middleware.js";
import { globalRateLimiter } from "./src/middleware/rateLimiter.middleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Helmet (Security Headers) - Waa inuu ugu horeeyaa
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Ogolaow requests-ka aan origin lahayn (sida Postman) ama kuwa ku jira allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy blook ayuu sameeyay'));
    }
  },
  credentials: true,
}));

// 3. Body Parsers (Laba jeer oo express.json ma aha in la qoro, hal mar oo 10kb ah waa ku filan tahay)
app.use(express.json({ limit: "10kb" })); 
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// 4. Rate Limiter Global ah
app.use("/api/v1", globalRateLimiter);

// 5. Apply Sanitizers (XSS iyo NoSQL Injection)
app.use(applySanitizers);

// 6. Central Routes
app.use('/api/v1', CentralRouter);

app.get('/', (req, res) => {
    res.status(200).send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});