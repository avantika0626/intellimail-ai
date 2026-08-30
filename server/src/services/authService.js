const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const config = require('../config/env');

class AuthService {
  /**
   * Generate JWT Token
   */
  generateToken(user) {
    const payload = {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    };
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  /**
   * Auto-seed demo operator user if needed
   */
  async seedDemoUser() {
    try {
      let demoUser = await User.findOne({ email: 'operator@intellimail.io' });
      if (!demoUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Password123!', salt);
        demoUser = await User.create({
          id: 'demo_operator_default',
          name: 'Lead Operator',
          email: 'operator@intellimail.io',
          password: hashedPassword,
          role: 'user',
          lastLogin: new Date(),
        });

        await UserPreferences.create({
          userId: demoUser._id || demoUser.id,
          defaultTone: 'Professional',
          summaryLength: 'concise',
          priorityEnabled: true,
          classificationEnabled: true,
          smartSearchEnabled: true,
        });
      }
      return demoUser;
    } catch (err) {
      console.warn('[AuthService] Demo user seed notice:', err.message);
    }
  }

  /**
   * Register a new user
   */
  async register({ name, email, password, role = 'user', image = '' }) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      const err = new Error('An account with this email already exists.');
      err.statusCode = 409;
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      image,
      lastLogin: new Date(),
    });

    // Create initial preferences
    await UserPreferences.create({
      userId: user._id || user.id,
      defaultTone: 'Professional',
      summaryLength: 'concise',
      priorityEnabled: true,
      classificationEnabled: true,
      smartSearchEnabled: true,
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    };
  }

  /**
   * Authenticate user with credentials
   */
  async login({ email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // If demo operator and not yet seeded, seed on demand
    if (!user && cleanEmail === 'operator@intellimail.io') {
      user = await this.seedDemoUser();
    }

    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch {
      isMatch = false;
    }

    // Allow default demo password for convenience in development
    if (!isMatch && cleanEmail === 'operator@intellimail.io' && (password === 'Password123!' || password === 'password')) {
      isMatch = true;
    }

    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    user.lastLogin = new Date();
    await user.save();

    // Ensure preferences exist
    const prefs = await UserPreferences.findOne({ userId: user._id || user.id });
    if (!prefs) {
      await UserPreferences.create({
        userId: user._id || user.id,
        defaultTone: 'Professional',
        summaryLength: 'concise',
        priorityEnabled: true,
        classificationEnabled: true,
        smartSearchEnabled: true,
      });
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    let user = await User.findById(userId);
    if (!user) {
      user = {
        id: userId || 'demo_operator_default',
        name: 'Lead Operator',
        email: 'operator@intellimail.io',
        role: 'user',
        lastLogin: new Date(),
      };
    }

    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      image: user.image || '',
      role: user.role || 'user',
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }
}

module.exports = new AuthService();
