import { prisma } from "../db.js";
import { verifyToken } from "../utils/jwt.utils.js";

export const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        message: "User session is no longer valid. Please sign in again.",
      });
    }

    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Token already expired" });
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    next();
  };

export const authenticateToken = protect;
export const requireAdmin = authorize("SYS_ADMIN");

