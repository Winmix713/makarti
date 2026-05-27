import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
interface CollapsibleSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}
export function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
  icon
}: CollapsibleSectionProps) {
  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group py-2">
        
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground/70">{icon}</span>}
          <span>{title}</span>
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        
      </button>
      {expanded &&
      <div className="pt-2 space-y-4 animate-fade-in">{children}</div>
      }
    </div>);

}