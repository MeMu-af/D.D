const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const registerUser = async (username, email, password, locationData = {}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      ...locationData
    },
    select: {
      id: true,
      username: true,
      email: true,
      location: true,
      latitude: true,
      longitude: true,
      createdAt: true
    }
  });
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture
    }
  };
};

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyToken
}; 