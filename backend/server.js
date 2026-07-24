import express from 'express';
import mongoose from 'mongoose';
import websites from './routes/websites.js';
import cors from 'cors'

const server = express();
const port = process.env.PORT;

server.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

server.use(express.json())
server.use('/api/websites/', websites)

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
});
