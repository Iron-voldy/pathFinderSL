/**
 * Request Logger Middleware
 * Logs incoming requests with timestamp
 */

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Log request body for POST/PUT/PATCH (exclude sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields from logs
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    console.log('Request Body:', JSON.stringify(sanitizedBody, null, 2));
  }

  next();
};

module.exports = { logger };
