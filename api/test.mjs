// This is a test endpoint
export default function handler(req, res) {
  res.status(200).json({
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString(),
  });
}