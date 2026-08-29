import "dotenv/config";
import express from 'express';
import cors from 'cors';
import CentralRouter from './src/routes/index.js';
import cookieParser from 'cookie-parser'

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser())


app.use('/api/v1', CentralRouter)

app.get('/', (req, res) => {

    res.send('API is running...')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})