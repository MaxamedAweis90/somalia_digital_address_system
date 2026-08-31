import xss from "xss";

// Recursively walk an object/array and XSS-escape every string value,
// mutating properties in place. Never reassigns the top-level object
// itself (req.query is a getter-only in Express 5, so req.query = x
// throws — but req.query.foo = x is fine).
const sanitizeInPlace = (obj) => {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (typeof value === "string") {
      obj[key] = xss(value);
    } else if (value && typeof value === "object") {
      sanitizeInPlace(value); // recurse into nested objects/arrays
    }
  }
};

export const applySanitizers = (req, res, next) => {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.params);
  sanitizeInPlace(req.query); // mutates keys/values, doesn't reassign req.query itself

  next();
};