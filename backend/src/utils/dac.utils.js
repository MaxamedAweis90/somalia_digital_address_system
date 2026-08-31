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
  { districtCode, zoneCode, zoneBlockCode, houseNumber },
  pad = HOUSE_NUMBER_PAD
) {
  if (!districtCode || !zoneCode || !zoneBlockCode || houseNumber === undefined) {
    throw new Error("District, zone, zone block codes, and house number are required");
  }

  const numericHouse = Number(houseNumber);

  if (!Number.isInteger(numericHouse) || numericHouse < 1 || numericHouse > MAX_HOUSE_NUMBER) {
    throw new Error(`House number must be between 1 and ${MAX_HOUSE_NUMBER}`);
  }

  return `${districtCode}-${zoneCode}-${zoneBlockCode}-${formatHouseNumber(numericHouse, pad)}`.toUpperCase();
}

export function parseDac(addressCode, pad = HOUSE_NUMBER_PAD) {
  if (!addressCode?.trim()) {
    throw new Error("Address code is required");
  }

  const normalized = addressCode.trim().toUpperCase();

  if (!buildDacPattern(pad).test(normalized)) {
    throw new Error(
      `Invalid DAC format. Expected DISTRICT-ZONE-ZONEBLOCK-${"0".repeat(pad - 1)}1 (e.g. HOD-TLX-Z01-0001)`
    );
  }

  const [districtCode, zoneCode, zoneBlockCode, houseSegment] = normalized.split("-");

  return {
    districtCode,
    zoneCode,
    zoneBlockCode,
    houseNumber: Number(houseSegment),
    addressCode: normalized,
  };
}

export function validateDac(addressCode) {
  parseDac(addressCode);
  return true;
}
