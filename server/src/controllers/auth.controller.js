import { getConfig } from '../config/env.js';
import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { authCookieOptions, clearCookieOptions, signToken } from '../services/tokenService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { ROLES } from '../utils/constants.js';

function startSession(res, user) {
  const { cookie } = getConfig();
  res.cookie(cookie.name, signToken(user), authCookieOptions());
}

export const register = asyncHandler(async (req, res) => {
  // Only whitelisted fields are read; "role" in the body is ignored on purpose.
  const { name, email, password, phone } = req.body;
  const exists = await User.exists({ email });
  if (exists) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({
    name,
    email,
    phone: phone || '',
    passwordHash: await User.hashPassword(password),
    role: ROLES.CITIZEN,
  });
  startSession(res, user);
  return sendSuccess(res, { status: 201, message: 'Account created successfully', data: { user } });
});

async function loginForRole(req, res, expectedRole) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message for unknown email and wrong password (prevents account enumeration).
  const valid = user ? await user.comparePassword(password) : false;
  if (!user || !valid) throw ApiError.unauthorized('Invalid email or password');
  if (user.role !== expectedRole) {
    const { cookie } = getConfig();
    res.clearCookie(cookie.name, clearCookieOptions());
    const roleMessage = user.role === ROLES.ADMIN
      ? 'This account has administrator privileges. Please use the Administrator login portal.'
      : user.role === ROLES.STAFF
        ? 'This account is a field staff account. Please use the Staff login portal.'
        : 'This account is a citizen account. Please use the Citizen login portal.';
    throw ApiError.forbidden(roleMessage);
  }
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated. Contact the administrator.');

  user.lastLoginAt = new Date();
  await user.save();
  startSession(res, user);
  return sendSuccess(res, { message: 'Logged in successfully', data: { user: user.toJSON() } });
}

export const login = asyncHandler(async (req, res) => loginForRole(req, res, ROLES.CITIZEN));
export const adminLogin = asyncHandler(async (req, res) => loginForRole(req, res, ROLES.ADMIN));
export const staffLogin = asyncHandler(async (req, res) => loginForRole(req, res, ROLES.STAFF));

export const logout = asyncHandler(async (_req, res) => {
  const { cookie } = getConfig();
  res.clearCookie(cookie.name, clearCookieOptions());
  return sendSuccess(res, { message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  const complaintCount = req.user.role === ROLES.CITIZEN
    ? await Complaint.countDocuments({ citizenId: req.user._id })
    : undefined;
  return sendSuccess(res, { data: { user: req.user, complaintCount } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone || '';
  await req.user.save();
  return sendSuccess(res, { message: 'Profile updated', data: { user: req.user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  const valid = await user.comparePassword(req.body.currentPassword);
  if (!valid) throw ApiError.badRequest('Current password is incorrect');
  user.passwordHash = await User.hashPassword(req.body.newPassword);
  await user.save();
  return sendSuccess(res, { message: 'Password changed' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) throw ApiError.badRequest('Email address is required');

  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.notFound('No account found with this email address');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account is deactivated. Contact administration.');
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordCode = code;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  return sendSuccess(res, {
    message: 'Verification code generated successfully',
    data: {
      email: user.email,
      code,
      expiresInMinutes: 15,
    },
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanCode = (code || '').trim();
  const cleanPass = (newPassword || '').trim();

  if (!cleanEmail || !cleanCode || !cleanPass) {
    throw ApiError.badRequest('Email, verification code, and new password are required');
  }
  if (cleanPass.length < 8) {
    throw ApiError.unprocessable('Password must be at least 8 characters long', [
      { field: 'newPassword', message: 'Password must be at least 8 characters long' },
    ]);
  }

  const user = await User.findOne({ email: cleanEmail }).select('+resetPasswordCode +resetPasswordExpires');
  if (!user) {
    throw ApiError.notFound('Account not found');
  }

  if (!user.resetPasswordCode || user.resetPasswordCode !== cleanCode) {
    throw ApiError.badRequest('Invalid verification code');
  }

  if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
    throw ApiError.badRequest('Verification code has expired. Please request a new one.');
  }

  user.passwordHash = await User.hashPassword(cleanPass);
  user.resetPasswordCode = undefined;
  user.resetPasswordExpires = undefined;
  user.isActive = true;
  await user.save();

  return sendSuccess(res, {
    message: 'Password reset successfully. You can now log in with your new password.',
  });
});
