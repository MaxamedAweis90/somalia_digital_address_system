export function getErrorMessage(error) {
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "field";
    return `A record with this ${field} already exists`;
  }

  if (error.code === "P2025") {
    return "Record not found";
  }

  if (error.code === "P2003") {
    return "Related record not found";
  }

  return error.message;
}
