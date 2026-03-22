import jwt from "jsonwebtoken";

/** EventSource Authorization header gönderemediği için ?token=... */
export function requireSSEAuth(req, res, next) {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) {
    res.status(401).end();
    return;
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).end();
  }
}
