/**
 * Normalize list endpoints that return either:
 * - { success, data: Item[] }
 * - { success, data: { data: Item[], pagination } }
 */
export function extractListFromResponse(response) {
  const payload = response?.data?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}
