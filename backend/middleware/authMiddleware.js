const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Please login first" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Auth Error:", error.name, error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not allowed to access this route",
      });
    }

    next();
  };
};