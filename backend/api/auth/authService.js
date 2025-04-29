const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const registerUser = async (username, email, password, locationData = {}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
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
      bio: true,
      city: true,
      state: true,
      experience: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
  return { token, user };
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      bio: true,
      city: true,
      state: true,
      experience: true,
      profilePicture: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
  // Remove password from user object before returning
  const { password: _, ...userWithoutPassword } = user;
  
  return { token, user: userWithoutPassword };
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
        bio: true,
        city: true,
        state: true,
        experience: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Ensure userId is set
    user.userId = user.id;
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const updateProfile = async (userId, profileData) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...profileData,
      updatedAt: new Date()
    },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      location: true,
      experience: true,
      favoriteClasses: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return updatedUser;
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  updateProfile,
  authenticateToken
}; 