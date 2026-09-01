import PortalShell from "@/components/layout/PortalShell";
import { LayoutGrid, Users, ClipboardCheck } from "lucide-react";

const navItems = [
  { to: "/officer/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/officer/workflow", label: "Workflow", icon: ClipboardCheck },
  { to: "/officer/collectors", label: "My Team", icon: Users },
];

export default function DataOfficerLayout() {
  return (
    <PortalShell
      brandSubtitle="Field Operations"
      brandIcon={LayoutGrid}
      navItems={navItems}
      roleLabel="DATA_OFFICER"
    />
  );
}
