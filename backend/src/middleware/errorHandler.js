export function notFoundHandler(req, res) {
  return res.status(404).json({ message: `Route not found: ${req.path}` });
}

export function errorHandler(error, req, res, next) {
  // Keep next for Express signature compatibility.
  void req;
  void next;
  const statusCode = error.statusCode || 500;
  // eslint-disable-next-line no-console
  console.error(error);
  return res.status(statusCode).json({
    message: error.message || "Internal server error."
  });
}
