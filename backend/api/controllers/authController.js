const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = new PrismaClient();
const authService = require('../services/authService');

// Helper function to generate verification token
const generateToken = () => crypto.randomBytes(32).toString('hex');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await authService.registerUser(username, email, password);
    res.status(201).json(user);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(500).json({ error: 'Error logging in', details: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: 'If an account exists, a password reset email has been sent' });
    }

    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // TODO: Send password reset email
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Error processing password reset', details: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error resetting password', details: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        isVerified: false
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying email', details: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { isVerified: true, verificationToken: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const newToken = generateToken();
    await prisma.user.update({
      where: { email },
      data: { verificationToken: newToken }
    });

    // TODO: Send new verification email
    res.json({ message: 'Verification email resent' });
  } catch (error) {
    res.status(500).json({ error: 'Error resending verification', details: error.message });
  }
};

exports.verify = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = await authService.verifyToken(token);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};