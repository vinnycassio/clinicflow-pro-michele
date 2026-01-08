import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PatientAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
};

const avatarColors = [
  "bg-primary/80",
  "bg-secondary/80",
  "bg-success/80",
  "bg-warning/80",
  "bg-accent/60",
  "bg-destructive/60",
];

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.substring(0, 2).toUpperCase() || "??";
}

function getColorFromName(name: string): string {
  const charSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarColors[charSum % avatarColors.length];
}

export function PatientAvatar({
  name,
  imageUrl,
  size = "md",
  className,
}: PatientAvatarProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <Avatar className={cn(sizeClasses[size], "border-2 border-card", className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback
        className={cn(bgColor, "text-white font-semibold")}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
