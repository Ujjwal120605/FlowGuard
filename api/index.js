// Vercel serverless function handler
const app = require('../backend/server');

// Export the Express app for Vercel
// Vercel will automatically handle the request/response
module.exports = app;
