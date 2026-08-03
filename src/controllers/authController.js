// Handles account creation (3-step, OTP-verified), login, and
// password recovery (OTP-verified). Every function here either
// creates a session (returns a JWT) or moves a user through a
// multi-step verification flow.

import { prisma } from '../config/prismaClient.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/generateToken.js';
import { generateOtp } from '../utils/generateOtp.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';

// STEP 1 of registration: collect basic info (name, email, phone, role),
// create/update a PendingRegistration row, and email a 4-digit OTP.
export const registerInitiate = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    if (!name || !email || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'name, email, phone, and role are required',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.pendingRegistration.upsert({
      where: { email },
      update: { name, phone, role, otp, otpExpiry, verified: false },
      create: { name, email, phone, role, otp, otpExpiry },
    });

    await sendEmail({
      to: email,
      subject: 'Verify your Hostel Finder email',
      html: `
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <h2>${otp}</h2>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP 2 of registration: confirm the OTP matches and hasn't expired,
// mark the PendingRegistration as verified so registerComplete can proceed.
export const registerVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'email and otp are required',
      });
    }

    const pending = await prisma.pendingRegistration.findFirst({
      where: { email, otp, otpExpiry: { gt: new Date() } },
    });

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code',
      });
    }

    await prisma.pendingRegistration.update({
      where: { email },
      data: { verified: true, otp: null, otpExpiry: null },
    });

    res.status(200).json({ success: true, message: 'Email verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP 3 of registration: set password + role-specific fields (institution
// for students, homeAddress/nin for landlords), create the real User row,
// delete the now-unneeded PendingRegistration, and issue a JWT.
export const registerComplete = async (req, res) => {
  try {
    const { email, password, confirmPassword, institution, housingPreference, homeAddress, nin, profilePicture } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'email, password, and confirmPassword are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });

    if (!pending || !pending.verified) {
      return res.status(400).json({
        success: false,
        message: 'Email not verified. Please verify your email first.',
      });
    }

    if (pending.role === 'student' && !institution) {
      return res.status(400).json({ success: false, message: 'institution is required for students' });
    }

    if (pending.role === 'landlord' && (!homeAddress || !nin)) {
      return res.status(400).json({ success: false, message: 'homeAddress and nin are required for landlords' });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        role: pending.role,
        password: hashedPassword,
        institution: pending.role === 'student' ? institution : null,
        housingPreference: pending.role === 'student' ? housingPreference : null,
        homeAddress: pending.role === 'landlord' ? homeAddress : null,
        nin: pending.role === 'landlord' ? nin : null,
        profilePicture: profilePicture || null,
      },
    });

    await prisma.pendingRegistration.delete({ where: { email } });

    const token = generateToken(newUser);

    const { password: _, nin: __, resetOtp: ___, resetOtpExpiry: ____, resetToken: _____, resetTokenExpiry: ______, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: safeUser,
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verifies email + password against a real User, returns a JWT on success.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    const { password: _, nin: __, resetOtp: ___, resetOtpExpiry: ____, resetToken: _____, resetTokenExpiry: ______, ...safeUser } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: safeUser,
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP 1 of password reset: if the email belongs to a real user, generate
// and email a 4-digit OTP. Responds identically either way, to avoid
// revealing which emails are registered.
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a code has been sent',
      });
    }

    const otp = generateOtp();
    const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetOtp: otp, resetOtpExpiry },
    });

    await sendEmail({
      to: user.email,
      subject: 'Reset your Hostel Finder password',
      html: `
        <p>Hi ${user.name},</p>
        <p>Your password reset code is:</p>
        <h2>${otp}</h2>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a code has been sent',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP 2 of password reset: confirm the OTP, then issue a short-lived
// resetToken the frontend holds onto (silently) to authorize STEP 3 —
// this is what lets the "Create Password" screen skip re-asking for the code.
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'email and otp are required' });
    }

    const user = await prisma.user.findFirst({
      where: { email, resetOtp: otp, resetOtpExpiry: { gt: new Date() } },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry, resetOtp: null, resetOtpExpiry: null },
    });

    res.status(200).json({ success: true, message: 'Code verified', resetToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP 3 of password reset: validate the resetToken from STEP 2, update
// the password, and clear the token so it can't be reused.
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'resetToken, newPassword, and confirmPassword are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const user = await prisma.user.findFirst({
      where: { resetToken, resetTokenExpiry: { gt: new Date() } },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Uploads a single profile picture to Cloudinary and saves the URL
// on the logged-in user's own record.
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: req.file.path },
    });

    const { password: _, nin: __, resetOtp: ___, resetOtpExpiry: ____, resetToken: _____, resetTokenExpiry: ______, ...safeUser } = updatedUser;

    res.status(200).json({ success: true, message: 'Profile picture updated', user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};