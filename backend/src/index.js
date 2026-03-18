'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const claimsRouter = require('./routes/claims');
const documentsRouter = require('./routes/documents');

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString() },
    message: 'ClaimIQ API is running',
  });
});

app.use('/claims', claimsRouter);
app.use('/claims', documentsRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[global error handler]', err);
  res.status(err.status || 500).json({
    success: false,
    data: null,
    message: err.message || 'Internal server error',
  });
});

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  ClaimIQ API running on http://localhost:${PORT}`);
  console.log(`   Region : ${process.env.AWS_REGION}`);
  console.log(`   Table  : ${process.env.DYNAMODB_TABLE_NAME}`);
  console.log(`   Bucket : ${process.env.S3_BUCKET_NAME}`);
});

module.exports = app;