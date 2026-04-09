function notFound(req, res) {
  return res.status(404).json({
    ok: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  return res.status(err.status || 500).json({
    ok: false,
    error: err.message || "Internal server error",
  });
}

module.exports = { notFound, errorHandler };