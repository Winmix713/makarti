import React from 'react';
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  activeColor?: string;
}
export function ToggleSwitch({
  checked,
  onChange,
  label,
  activeColor
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-2">
      {label &&
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      }
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-ring/50 ring-offset-2 ${checked ? 'bg-primary' : 'bg-secondary'}`}
        role="switch"
        aria-checked={checked}
        style={
        checked && activeColor ?
        {
          backgroundColor: activeColor
        } :
        undefined
        }>
        
        <span
          className="block w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform duration-200"
          style={{
            transform: checked ? 'translateX(1.25rem)' : 'translateX(0.125rem)',
            margin: '0.25rem'
          }} />
        
      </button>
    </div>);

}