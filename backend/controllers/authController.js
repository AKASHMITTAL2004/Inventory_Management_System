import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

// Helper function to generate a JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, orgId: user.organization_id }, 
    process.env.JWT_SECRET, 
    { expiresIn: "1d" } // Token expires in 1 day
  );
};

// 1. SIGNUP: Create Org + Admin User
export const signup = async (req, res) => {
  try {
    const { orgName, industry, userName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Hash the password (scrambles it so it isn't saved as plain text)
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create the organization first
    const organization = await Organization.create({ name: orgName, industry });

    // Create the user, make them Admin, and link to the new org
    const user = await User.create({
      name: userName,
      email,
      password_hash,
      role: "Admin",
      organization_id: organization._id,
    });

    res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, role: user.role, orgId: organization._id }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during signup", error: error.message });
  }
};

// 2. LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Check user and compare hashed password
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If they have 2FA enabled, we don't give the full token yet
    if (user.is2FAEnabled) {
      return res.json({ requires2FA: true, userId: user._id });
    }

    res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, role: user.role, orgId: user.organization_id }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

// 3. SETUP 2FA (Generates the QR Code for Google Authenticator)
export const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // req.user comes from our middleware
    
    // Generate a secure secret
    const secret = speakeasy.generateSecret({ name: `InventoryApp (${user.email})` });
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Convert that secret into a QR code image URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    res.json({ secret: secret.base32, qrCodeUrl });
  } catch (error) {
    res.status(500).json({ message: "Error setting up 2FA" });
  }
};

// 4. VERIFY 2FA (Used during setup OR during login)
export const verify2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId || req.user.id);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 1 // allows slight time drift
    });

    if (verified) {
      // If verifying for the first time during setup, enable it
      if (!user.is2FAEnabled) {
        user.is2FAEnabled = true;
        await user.save();
      }
      
      // Issue the real JWT now that they've passed 2FA
      res.json({
        token: generateToken(user),
        user: { id: user._id, name: user.name, role: user.role, orgId: user.organization_id }
      });
    } else {
      res.status(400).json({ message: "Invalid 2FA token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error verifying 2FA" });
  }
};