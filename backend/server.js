import express from 'express';
import dotenv from 'dotenv'
import { toNodeHandler } from "better-auth/node";
import { auth } from './auth.js';
import CentralRouter from './routes/index.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.all("./api/v1/auth/", toNodeHandler(auth))

app.use(CentralRouter)

app.get('/', (req, res) => {

    res.send('API is running...')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})