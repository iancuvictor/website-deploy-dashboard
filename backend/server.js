import express from 'express';
import mongoose from 'mongoose';
import websites from './routes/websites.js';
import cors from 'cors'
import { Server } from 'socket.io';
import {createServer} from 'http';
import { pingLiveUpdate } from './jobs/pingLiveUpdate.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
})

const port = process.env.PORT;

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json())
app.use('/api/websites/', websites)

pingLiveUpdate(io);

server.listen(port, () => {
  console.log(`Server running on port: ${port}`)
});
