const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.password;
    delete sanitizedBody.newPassword;
    delete sanitizedBody.token;
    delete sanitizedBody.resetToken;
    delete sanitizedBody.otp;

    console.log('Request Body:', JSON.stringify(sanitizedBody, null, 2));
  }

  next();
};

module.exports = { logger };
