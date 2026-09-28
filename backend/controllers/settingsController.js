import Organization from '../models/Organization.js';
import User from '../models/User.js';

export const updateSettings = async (req, res) => {
  try {
    const { orgName, industry, profilePic } = req.body;

    // 1. Update the Organization document
    await Organization.findByIdAndUpdate(req.user.orgId, { 
      name: orgName, 
      industry: industry 
    });

    // 2. Update the User document (for profile pic)
    if (profilePic !== undefined) {
      await User.findByIdAndUpdate(req.user.id, { profilePic });
    }

    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating settings", error: error.message });
  }
};
