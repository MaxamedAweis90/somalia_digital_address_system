export function safeFitBounds(map, bounds, options) {
  try {
    if (!map?.getContainer()?.isConnected || !bounds?.isValid?.()) return;
    map.fitBounds(bounds, options);
  } catch {
    // Ignore if the map unmounted during a zoom transition.
  }
}
