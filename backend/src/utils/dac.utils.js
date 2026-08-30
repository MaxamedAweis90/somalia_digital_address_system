export const DAC_PATTERN = /^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-\d{4}$/;
export const HOUSE_NUMBER_PAD = 4;
export const MAX_HOUSE_NUMBER = 9999;

export function formatHouseNumber(houseNumber) {
  return String(houseNumber).padStart(HOUSE_NUMBER_PAD, "0");
}

export function buildDac({ districtCode, neighborhoodCode, zoneCode, houseNumber }) {
  if (!districtCode || !neighborhoodCode || !zoneCode || houseNumber === undefined) {
    throw new Error("District, neighborhood, zone codes, and house number are required");
  }

  const numericHouse = Number(houseNumber);

  if (!Number.isInteger(numericHouse) || numericHouse < 1 || numericHouse > MAX_HOUSE_NUMBER) {
    throw new Error(`House number must be between 1 and ${MAX_HOUSE_NUMBER}`);
  }

  return `${districtCode}-${neighborhoodCode}-${zoneCode}-${formatHouseNumber(numericHouse)}`.toUpperCase();
}

export function parseDac(addressCode) {
  if (!addressCode?.trim()) {
    throw new Error("Address code is required");
  }

  const normalized = addressCode.trim().toUpperCase();

  if (!DAC_PATTERN.test(normalized)) {
    throw new Error(
      "Invalid DAC format. Expected DISTRICT-NEIGHBORHOOD-ZONE-0001 (e.g. HOD-TLX-Z01-0001)"
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
