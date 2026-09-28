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

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const organization = await Organization.create({ name: orgName, industry });

    const user = await User.create({
      name: userName,
      email,
      password_hash,
      role: "Admin",
      organization_id: organization._id,
    });

    // Do this inside login, signup, AND verify2FA responses:
res.json({
  token: generateToken(user),
  user: { 
    id: user._id, 
    name: user.name,
    email: user.email, 
    role: user.role, 
    orgId: user.organization_id, 
    
    // ADD THIS ONE LINE:
    orgName: organization?.name || 'My Organization', 
    
    industry: organization?.industry || 'general' 
  }
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

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.is2FAEnabled) {
      return res.json({ requires2FA: true, userId: user._id });
    }

    const organization = await Organization.findById(user.organization_id);

    res.json({
      token: generateToken(user),
      user: { 
        id: user._id, 
        name: user.name,
        email: user.email, 
        role: user.role, 
        orgId: user.organization_id, 
        industry: organization?.industry || 'general' 
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

// 3. SETUP 2FA
export const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const secret = speakeasy.generateSecret({ name: `InventoryApp (${user.email})` });
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    res.json({ secret: secret.base32, qrCodeUrl });
  } catch (error) {
    res.status(500).json({ message: "Error setting up 2FA" });
  }
};

// 4. VERIFY 2FA
export const verify2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId || req.user.id);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 1
    });

    if (verified) {
      if (!user.is2FAEnabled) {
        user.is2FAEnabled = true;
        await user.save();
      }
      
      const organization = await Organization.findById(user.organization_id);

      res.json({
        token: generateToken(user),
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, // FIXED: Added email here
          role: user.role, 
          orgId: user.organization_id, 
          industry: organization?.industry || 'general' 
        }
      });
    } else {
      res.status(400).json({ message: "Invalid 2FA token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error verifying 2FA" });
  }
};

// 5. UPDATE SETTINGS
export const updateSettings = async (req, res) => {
  try {
    const { orgName, industry, profilePic } = req.body;

    await Organization.findByIdAndUpdate(req.user.orgId, { 
      name: orgName, 
      industry: industry 
    });

    if (profilePic !== undefined) {
      await User.findByIdAndUpdate(req.user.id, { profilePic });
    }

    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating settings", error: error.message });
  }
};
