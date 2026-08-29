const VALID_STATUSES = ["ACTIVE", "INACTIVE"];

export function validateStatus(status) {
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw new Error("Status must be ACTIVE or INACTIVE");
  }
}
