import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { SuperellipseState } from '../hooks/useSuperellipse';
import { generateCSS } from '../utils/cssGenerator';
interface CSSOutputProps {
  state: SuperellipseState;
}
export function CSSOutput({ state }: CSSOutputProps) {
  const [copied, setCopied] = useState(false);
  const css = generateCSS(state);
  const handleCopy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Generated CSS
        </label>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          
          {copied ?
          <Check className="w-3 h-3 text-green-500" /> :

          <Copy className="w-3 h-3" />
          }
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="relative flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden group">
        <textarea
          readOnly
          value={css}
          className="w-full h-full p-4 font-mono text-[11px] leading-relaxed bg-transparent resize-none focus:outline-none text-zinc-600 dark:text-zinc-400 selection:bg-indigo-500/20" />
        
      </div>
    </div>);

}