import { Badge } from "@/components/ui/badge";
import type { MemberRole } from "../member-types";

const roleConfig: Record<MemberRole, { label: string; className: string }> = {
  owner: {
    label: "Propriétaire",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  admin: {
    label: "Administrateur",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  member: {
    label: "Membre",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  viewer: {
    label: "Observateur",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export default function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role as MemberRole] ?? roleConfig.member;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
