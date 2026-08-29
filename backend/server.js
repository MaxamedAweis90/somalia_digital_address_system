import express from 'express';
import dotenv from 'dotenv'
import CentralRouter from './src/routes/index.js';
import cookieParser from 'cookie-parser'

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser())


app.use('/api/v1', CentralRouter)

app.get('/', (req, res) => {

    res.send('API is running...')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})