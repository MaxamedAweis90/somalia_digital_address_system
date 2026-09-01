import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapLifecycleGuard() {
  const map = useMap();

  useEffect(() => {
    return () => {
      try {
        map.stop();
      } catch {
        // Map already torn down.
      }
    };
  }, [map]);

  return null;
}
