module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Marden SEO Audit API is running',
    timestamp: new Date().toISOString(),
  });
};
