export const HOUSE_NUMBER_PAD = 4;
export const MAX_HOUSE_NUMBER = 9999;

export function buildDacPattern(pad = HOUSE_NUMBER_PAD) {
  return new RegExp(`^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-\\d{${pad}}$`);
}

export const DAC_PATTERN = buildDacPattern();

export function formatHouseNumber(houseNumber, pad = HOUSE_NUMBER_PAD) {
  return String(houseNumber).padStart(pad, "0");
}

export function buildDac(
  { districtCode, neighborhoodCode, zoneCode, houseNumber },
  pad = HOUSE_NUMBER_PAD
) {
  if (!districtCode || !neighborhoodCode || !zoneCode || houseNumber === undefined) {
    throw new Error("District, neighborhood, zone codes, and house number are required");
  }

  const numericHouse = Number(houseNumber);

  if (!Number.isInteger(numericHouse) || numericHouse < 1 || numericHouse > MAX_HOUSE_NUMBER) {
    throw new Error(`House number must be between 1 and ${MAX_HOUSE_NUMBER}`);
  }

  return `${districtCode}-${neighborhoodCode}-${zoneCode}-${formatHouseNumber(numericHouse, pad)}`.toUpperCase();
}

export function parseDac(addressCode, pad = HOUSE_NUMBER_PAD) {
  if (!addressCode?.trim()) {
    throw new Error("Address code is required");
  }

  const normalized = addressCode.trim().toUpperCase();

  if (!buildDacPattern(pad).test(normalized)) {
    throw new Error(
      `Invalid DAC format. Expected DISTRICT-NEIGHBORHOOD-ZONE-${"0".repeat(pad - 1)}1 (e.g. HOD-TLX-Z01-0001)`
    );
  }

  const [districtCode, neighborhoodCode, zoneCode, houseSegment] = normalized.split("-");

  return {
    districtCode,
    neighborhoodCode,
    zoneCode,
    houseNumber: Number(houseSegment),
    addressCode: normalized,
  };
}

export function validateDac(addressCode) {
  parseDac(addressCode);
  return true;
}
