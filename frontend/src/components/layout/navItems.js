import {
  LayoutGrid,
  Building2,
  Home,
  Grid3x3,
  MapPin,
  Search,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
  { key: "districts", label: "Districts", icon: Building2, href: "/districts" },
  { key: "zones", label: "Zones", icon: Home, href: "/zones" },
  { key: "zone-blocks", label: "Zone Blocks", icon: Grid3x3, href: "/zone-blocks" },
  { key: "addresses", label: "Addresses", icon: MapPin, href: "/addresses" },
  { key: "search", label: "Search", icon: Search, href: "/search" },
  { key: "users", label: "Users", icon: Users, href: "/users" },
];
