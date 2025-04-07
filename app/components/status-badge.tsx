import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'paid' | 'due' | 'overdue'
  dueDays?: number
}

export function StatusBadge({ status, dueDays, className, ...props }: StatusBadgeProps) {
  let variant: BadgeProps['variant'] = 'default'
  let label = status.charAt(0).toUpperCase() + status.slice(1)
  
  switch (status) {
    case 'paid':
      variant = 'outline'
      break
    case 'due':
      variant = 'secondary'
      if (dueDays !== undefined && dueDays <= 7 && dueDays >= 0) {
        label = `Due Soon (${dueDays} days)`
      }
      break
    case 'overdue':
      variant = 'destructive'
      if (dueDays !== undefined) {
        label = `Overdue (${Math.abs(dueDays)} days)`
      }
      break
  }
  
  return (
    <Badge variant={variant} className={cn("capitalize", className)} {...props}>
      {label}
    </Badge>
  )
}

// Re-export Badge variants for type safety
export { badgeVariants } from "@/components/ui/badge"