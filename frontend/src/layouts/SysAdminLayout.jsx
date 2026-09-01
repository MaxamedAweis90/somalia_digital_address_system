import PortalShell from "@/components/layout/PortalShell";
import {
  LayoutGrid,
  Building2,
  Home,
  Grid3x3,
  MapPin,
  ShieldCheck,
  Settings,
  Users,
  Globe,
  ClipboardList,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/regions", label: "Regions", icon: Globe },
  { to: "/admin/districts", label: "Districts", icon: Building2 },
  { to: "/admin/zones", label: "Zones", icon: Home },
  { to: "/admin/zone-blocks", label: "Zone Blocks", icon: Grid3x3 },
  { to: "/admin/addresses", label: "Addresses", icon: MapPin },
  { to: "/admin/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/admin/staff", label: "Staff", icon: Users, matchPrefixes: ["/admin/data-officers", "/admin/data-collectors"] },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
];

const footerNavItems = [
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function SysAdminLayout() {
  return (
    <PortalShell
      brandSubtitle="Digital Infrastructure"
      brandIcon={Building2}
      navItems={navItems}
      footerNavItems={footerNavItems}
      roleLabel="SYS_ADMIN"
      searchPath="/admin/search"
    />
  );
}
