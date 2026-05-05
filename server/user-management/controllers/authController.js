const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail, sendPasswordOtpEmail } = require('../services/mailService');

const PASSWORD_SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const signAuthToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      purpose: 'auth',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );

const signResetToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      purpose: 'password-reset',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || '15m',
    }
  );

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  isDriver: user.is_driver || false,
  nationality: user.nationality,
  location: user.location,
  profilePicture: user.profile_picture,
  isActive: user.is_active,
  lastLoginAt: user.last_login_at,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const issueAuthResponse = async (user, res, statusCode = 200, message = 'Success') => {
  const token = signAuthToken(user);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
};

const registerUser = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw createError(409, 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(req.body.password, PASSWORD_SALT_ROUNDS);

    const user = await User.create({
      full_name: req.body.fullName.trim(),
      email,
      password_hash: passwordHash,
      role: 'user',
    });

    try {
      await sendWelcomeEmail(user);
      await user.update({ welcome_email_sent_at: new Date() });
    } catch (mailError) {
      console.error('Welcome email error:', mailError.message);
    }

    await issueAuthResponse(user, res, 201, 'User account created successfully');
  } catch (error) {
    next(error);
  }
};

const loginWithRole = (expectedRole) => async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw createError(401, 'Invalid email or password');
    }

    if (user.role !== expectedRole) {
      const message =
        expectedRole === 'admin'
          ? 'This account is not allowed in the admin portal'
          : 'Please use the admin login for admin accounts';
      throw createError(403, message);
    }

    if (!user.is_active) {
      throw createError(403, 'This account has been deactivated');
    }

    const passwordMatches = await bcrypt.compare(req.body.password, user.password_hash);

    if (!passwordMatches) {
      throw createError(401, 'Invalid email or password');
    }

    await user.update({ last_login_at: new Date() });

    await issueAuthResponse(
      user,
      res,
      200,
      expectedRole === 'admin' ? 'Admin login successful' : 'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const portal = req.body.portal || 'user';
    const user = await User.findOne({ where: { email, role: portal } });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, an OTP has been sent to the email address',
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    await user.update({
      password_reset_otp_hash: hashOtp(otp),
      password_reset_otp_expires_at: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    await sendPasswordOtpEmail({ user, otp, portal });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

const verifyResetOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const portal = req.body.portal || 'user';
    const user = await User.findOne({ where: { email, role: portal } });

    if (
      !user ||
      !user.password_reset_otp_hash ||
      !user.password_reset_otp_expires_at ||
      user.password_reset_otp_expires_at < new Date()
    ) {
      throw createError(400, 'OTP is invalid or expired');
    }

    if (user.password_reset_otp_hash !== hashOtp(req.body.otp.trim())) {
      throw createError(400, 'OTP is invalid or expired');
    }

    await user.update({
      password_reset_otp_hash: null,
      password_reset_otp_expires_at: null,
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        resetToken: signResetToken(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.body.resetToken, process.env.JWT_SECRET);

    if (decoded.purpose !== 'password-reset') {
      throw createError(401, 'Invalid password reset token');
    }

    const user = await User.findByPk(decoded.sub);

    if (!user || user.email !== decoded.email) {
      throw createError(404, 'Account not found');
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword, PASSWORD_SALT_ROUNDS);

    await user.update({
      password_hash: passwordHash,
      password_reset_otp_hash: null,
      password_reset_otp_expires_at: null,
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current user retrieved successfully',
    data: sanitizeUser(req.user),
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = {};

    if (req.body.fullName !== undefined) {
      updates.full_name = req.body.fullName.trim();
    }

    if (req.body.nationality !== undefined) {
      updates.nationality = req.body.nationality || null;
    }

    if (req.body.location !== undefined) {
      updates.location = req.body.location || null;
    }

    if (req.body.profilePicture !== undefined) {
      updates.profile_picture = req.body.profilePicture || null;
    }

    await req.user.update(updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

const ensureDefaultAdmin = async () => {
  const adminCount = await User.count({ where: { role: 'admin' } });

  if (adminCount > 0) {
    return;
  }

  const email = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@pathfindersl.com');
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  await User.create({
    full_name: process.env.ADMIN_NAME || 'PathFinderSL Admin',
    email,
    password_hash: passwordHash,
    role: 'admin',
    is_active: true,
  });

  console.log(`Default admin account created for ${email}`);
};

const { Op } = require('sequelize');

const getAllUsers = async (req, res, next) => {
  try {
    const { search = '', role = '', page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'password_reset_otp_hash', 'password_reset_otp_expires_at'] },
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });
    res.json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = req.user;

    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        throw createError(403, 'Cannot delete the last admin account');
      }
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw createError(401, 'Incorrect password');
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser: loginWithRole('user'),
  loginAdmin: loginWithRole('admin'),
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getCurrentUser,
  updateProfile,
  deleteAccount,
  getAllUsers,
  ensureDefaultAdmin,
};
