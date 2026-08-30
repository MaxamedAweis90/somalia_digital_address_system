export const DAC_PATTERN = /^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-\d{4}$/;

export function formatHouseNumber(houseNumber) {
  return String(houseNumber).padStart(4, "0");
}

export function buildDacPreview({ districtCode, zoneCode, zoneBlockCode, houseNumber }) {
  if (!districtCode || !zoneCode || !zoneBlockCode || !houseNumber) {
    return "";
  }

  return `${districtCode}-${zoneCode}-${zoneBlockCode}-${formatHouseNumber(houseNumber)}`.toUpperCase();
}

export function isValidDacFormat(code) {
  return DAC_PATTERN.test(code?.trim().toUpperCase());
}
