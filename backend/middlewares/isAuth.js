import jwt from "jsonwebtoken";
const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "Unauthorized access" });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach user info to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Invalid token" });
  }
};
export default isAuth;
