import React, { useState } from 'react';
import { Download, FileCode, FileJson, Copy, Check, Image } from 'lucide-react';
import { SuperellipseState } from '../hooks/useSuperellipse';
import { downloadSVG } from '../utils/svgGenerator';
import { generateCSS } from '../utils/cssGenerator';
interface ExportPanelProps {
  state: SuperellipseState;
}
export function ExportPanel({ state }: ExportPanelProps) {
  const [showJSON, setShowJSON] = useState(false);
  const [showCSS, setShowCSS] = useState(false);
  const [copiedCSS, setCopiedCSS] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const handleDownloadSVG = () => {
    const filename = `superellipse-${Date.now()}.svg`;
    downloadSVG(state, filename);
  };
  const handleCopyJSON = () => {
    const json = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    });
  };
  const handleCopyCSS = () => {
    const css = generateCSS(state);
    navigator.clipboard.writeText(css).then(() => {
      setCopiedCSS(true);
      setTimeout(() => setCopiedCSS(false), 2000);
    });
  };
  const cssCode = generateCSS(state);
  const jsonCode = JSON.stringify(state, null, 2);
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1 flex items-center gap-2">
        <Download className="w-3.5 h-3.5" />
        Export Options
      </p>

      {/* Primary Export - SVG Download */}
      <div className="space-y-2">
        <button
          onClick={handleDownloadSVG}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] transition-all">
          
          <Image className="w-4 h-4" />
          Download as SVG
        </button>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 px-1">
          Vector format, perfect for web and design tools
        </p>
      </div>

      {/* CSS Export */}
      <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCSS(!showCSS)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
            
            <FileCode className="w-4 h-4" />
            CSS Code
          </button>
          <button
            onClick={handleCopyCSS}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            
            {copiedCSS ?
            <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                Copied!
              </> :

            <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            }
          </button>
        </div>

        {showCSS &&
        <div className="animate-fade-in">
            <div className="relative bg-zinc-900 dark:bg-black border border-zinc-700 dark:border-zinc-800 rounded-lg overflow-hidden">
              <pre className="p-4 text-[11px] leading-relaxed text-green-400 overflow-x-auto max-h-64 font-mono">
                {cssCode}
              </pre>
            </div>
          </div>
        }
      </div>

      {/* JSON Export */}
      <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowJSON(!showJSON)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
            
            <FileJson className="w-4 h-4" />
            JSON Configuration
          </button>
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            
            {copiedJSON ?
            <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                Copied!
              </> :

            <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            }
          </button>
        </div>

        {showJSON &&
        <div className="animate-fade-in">
            <div className="relative bg-zinc-900 dark:bg-black border border-zinc-700 dark:border-zinc-800 rounded-lg overflow-hidden">
              <pre className="p-4 text-[11px] leading-relaxed text-blue-400 overflow-x-auto max-h-64 font-mono">
                {jsonCode}
              </pre>
            </div>
          </div>
        }
      </div>

      {/* Export Info */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-2">
        <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
          Export Formats
        </p>
        <ul className="text-[10px] text-amber-700 dark:text-amber-300 space-y-1 leading-relaxed">
          <li>
            <strong>SVG:</strong> Scalable vector graphics for web and design
          </li>
          <li>
            <strong>CSS:</strong> Ready-to-use stylesheet code
          </li>
          <li>
            <strong>JSON:</strong> Configuration for sharing and backup
          </li>
        </ul>
      </div>
    </div>);

}