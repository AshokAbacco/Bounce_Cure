

// server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
// import { initEmail } from "./utils/emailService.js";
import supportRoutes from "./routes/supportRoutes.js";


dotenv.config();
import bodyParser from "body-parser";

/* Middlewares */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* Routes */
app.use("/verification", verificationRoutes);

app.use(cors({
  origin: process.env.BASE_URL, // frontend URL
  credentials: true               // allow cookies & auth headers
}));
app.use(express.json());

// Use routes
app.use('/verification', verificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes);
app.use("/api/users", authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});


/* Start */
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
