import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

// Load env variables
dotenv.config();

const port = process.env.PORT || 5000;

// Connect DB first, then start listening
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
