const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const connectMongoDB = require('./config/db');
const router = require('./routes');

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve static garment product images directly if accessed via backend
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));

// API Routes
app.use("/api", router);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Orange Garments API Server is running", status: "OK" });
});

const PORT = process.env.PORT || 8080;

// Start server and initiate database connection
connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}....`);
});
