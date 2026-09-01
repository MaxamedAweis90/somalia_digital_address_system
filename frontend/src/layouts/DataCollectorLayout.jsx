import PortalShell from "@/components/layout/PortalShell";
import { ClipboardList, LayoutDashboard } from "lucide-react";

const navItems = [
  { to: "/collector/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/collector/assignments", label: "My Work", icon: ClipboardList, end: true },
];

export default function DataCollectorLayout() {
  return (
    <PortalShell
      brandSubtitle="Field Collection"
      brandIcon={ClipboardList}
      navItems={navItems}
      roleLabel="DATA_COLLECTOR"
    />
  );
}
