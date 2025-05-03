// Simple test endpoint to verify Vercel deployment
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString(),
  });
};