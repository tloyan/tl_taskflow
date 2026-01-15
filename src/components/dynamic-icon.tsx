import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = LucideIcons[
    name as keyof typeof LucideIcons
  ] as React.ComponentType<LucideProps>;

  if (!Icon) {
    return <LucideIcons.FileQuestion {...props} />; // Fallback
  }

  return <Icon {...props} />;
}
