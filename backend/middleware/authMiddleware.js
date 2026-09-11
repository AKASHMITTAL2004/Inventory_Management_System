import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;
  // Tokens are typically sent in the headers as: "Bearer <token_string>"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized to access this route" });
  }

  try {
    // Verify the token using the secret we put in our .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded user info (id, role, orgId) to the request object so routes can use it
    req.user = decoded; 
    next(); // Pass control to the next function (the actual route handler)
  } catch (error) {
    return res.status(401).json({ message: "Token failed or expired" });
  }
};