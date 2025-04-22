const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Helper function to generate verification token
const generateToken = () => crypto.randomBytes(32).toString('hex');

exports.register = async (req, res) => {
  const { username, email, password, location, age, experience, bio } = req.body;
  
  try {
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        location,
        age,
        experience,
        bio,
        verificationToken,
        isVerified: false
      },
    });

    // TODO: Send verification email
    res.status(201).json({ 
      message: 'User created', 
      userId: user.id,
      note: 'Please verify your email address'
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      // Unique constraint violation
      return res.status(400).json({ 
        error: 'User already exists',
        details: error.meta?.target?.join(', ') || 'username or email'
      });
    }
    res.status(500).json({ error: 'Error creating user', details: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Email not verified',
        message: 'Please verify your email address before logging in'
      });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
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