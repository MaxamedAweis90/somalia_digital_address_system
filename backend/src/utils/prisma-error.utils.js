export function getErrorMessage(error) {
  if (error.code === "23505") {
    return "A record with this value already exists";
  }

  if (error.code === "P2002") {
    const field = error.meta?.target?.[0];

    if (field === "email") {
      return "An account with this email address already exists";
    }

    return `A record with this ${field || "value"} already exists`;
  }

  if (error.code === "P2025") {
    return "Record not found";
  }

  if (error.code === "P2003") {
    return "This action could not be completed because a related record is missing";
  }

  return error.message || "Something went wrong. Please try again.";
}

export function getHttpStatus(error) {
  const message = error.message || "";

  if (message.includes("not found")) {
    return 404;
  }

  if (
    message.includes("cannot") ||
    message.includes("not allowed") ||
    message.includes("required") ||
    message.includes("must") ||
    message.includes("valid") ||
    message.includes("already exists") ||
    message.includes("Password")
  ) {
    return 400;
  }

  if (error.code === "P2002") {
    return 409;
  }

  if (error.code === "P2025") {
    return 404;
  }

  return 500;
}
