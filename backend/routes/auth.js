const express = require("express");
const bcrypt = require("bcryptjs");
let User = require("../models/user");

// Guard: accept common module export shapes (default, named) and fail fast with helpful message
if (!User || typeof User.findOne !== "function") {
  if (User && (User.default || User.User)) {
    User = User.default || User.User;
  }
}
if (!User || typeof User.findOne !== "function") {
  console.error("[Auth] ERROR: Invalid User model imported:", User);
  throw new Error(
    "User model is not a valid Mongoose model. Ensure 'backend/models/user.js' exports mongoose.model('User', schema)"
  );
}

const router = express.Router();
console.log('[Auth] User model loaded, has findOne:', typeof User.findOne === 'function');

// ensure JSON body parsing for this router and simple debug logging
router.use(express.json());
router.use((req, res, next) => {
  console.log(`[Auth] ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * ======================
 * SIGNUP API
 * ======================
 * POST /api/auth/signup
 */
router.post("/signup", async (req, res) => {
  console.log('[Auth] signup handler entered');
  try {
    const { username, email, password } = req.body;
    console.log('[Auth] body:', req.body);

    // 1. Validate input
    if (!username || !email || !password) {
      console.log('[Auth] validation failed');
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // normalize email to avoid case-sensitivity issues
    const normalizedEmail = email.toLowerCase().trim();
    console.log('[Auth] normalizedEmail:', normalizedEmail);

    // 2. Check if user already exists
    console.log('[Auth] calling User.findOne');
    const existingUser = await User.findOne({ email: normalizedEmail });
    console.log('[Auth] findOne returned:', existingUser);
    if (existingUser) {
      console.log('[Auth] user exists, aborting');
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 3. Hash password
    console.log('[Auth] hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[Auth] hashedPassword length:', hashedPassword && hashedPassword.length);

    // 4. Create new user
    console.log('[Auth] creating new User instance');
    const newUser = new User({
      username,
      email: normalizedEmail,
      password: hashedPassword,
    });
    console.log('[Auth] newUser before save:', newUser);

    // 5. Save user to DB
    console.log('[Auth] calling save()');
    await newUser.save();
    console.log('[Auth] save() completed');

    // 6. Success response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('[Auth] signup error:', error && (error.stack || error));

    // Handle duplicate key (unique email) errors from MongoDB
    if (error && (error.code === 11000 || error.code === 11001 || error.name === 'MongoServerError')) {
      console.log('[Auth] duplicate key error detected');
      return res.status(400).json({ message: 'User already exists' });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 4. Success response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;