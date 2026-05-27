import React, { useCallback, useMemo, useState, Component } from 'react';
import {
  CopyIcon,
  CheckIcon,
  FileCodeIcon,
  FileTextIcon,
  CodeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  WrapTextIcon } from
'lucide-react';
import { SuperellipseState } from '../../hooks/useSuperellipse';
import { generateCSS } from '../../utils/cssGenerator';
import { generateSVG } from '../../utils/svgGenerator';
import { generateReactComponent } from '../../utils/reactGenerator';
interface LiveCodePanelProps {
  state: SuperellipseState;
}
type CodeTab = 'css' | 'svg' | 'react';
const TAB_CONFIG: {
  id: CodeTab;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
{
  id: 'css',
  label: 'CSS',
  icon: <FileCodeIcon className="w-3 h-3" />,
  color: 'text-emerald-400'
},
{
  id: 'svg',
  label: 'SVG',
  icon: <FileTextIcon className="w-3 h-3" />,
  color: 'text-sky-400'
},
{
  id: 'react',
  label: 'React',
  icon: <CodeIcon className="w-3 h-3" />,
  color: 'text-violet-400'
}];

function highlightCSS(code: string): React.ReactNode[] {
  return code.split('\n').map((line, i) => {
    // Property: value pattern
    const match = line.match(/^(\s*)([\w-]+)(\s*:\s*)(.+)(;?)$/);
    if (match) {
      return (
        <div key={i} className="leading-relaxed">
          <span>{match[1]}</span>
          <span className="text-sky-300">{match[2]}</span>
          <span className="text-muted-foreground">{match[3]}</span>
          <span className="text-emerald-300">{match[4]}</span>
          <span className="text-muted-foreground">{match[5]}</span>
        </div>);

    }
    return (
      <div key={i} className="leading-relaxed text-foreground/70">
        {line || '\u00A0'}
      </div>);

  });
}
function highlightSVG(code: string): React.ReactNode[] {
  return code.split('\n').map((line, i) => {
    // Simple XML highlighting
    const highlighted = line.
    replace(/(<\/?[\w-]+)/g, '§TAG§$1§/TAG§').
    replace(/([\w-]+)(=)/g, '§ATTR§$1§/ATTR§$2').
    replace(/"([^"]*)"/g, '"§VAL§$1§/VAL§"');
    const parts: React.ReactNode[] = [];
    let remaining = highlighted;
    let key = 0;
    while (remaining.length > 0) {
      const tagStart = remaining.indexOf('§TAG§');
      const attrStart = remaining.indexOf('§ATTR§');
      const valStart = remaining.indexOf('§VAL§');
      const nextMarker = Math.min(
        tagStart >= 0 ? tagStart : Infinity,
        attrStart >= 0 ? attrStart : Infinity,
        valStart >= 0 ? valStart : Infinity
      );
      if (nextMarker === Infinity) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
      if (nextMarker > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, nextMarker)}</span>);
      }
      if (nextMarker === tagStart) {
        const end = remaining.indexOf('§/TAG§', tagStart);
        const content = remaining.slice(tagStart + 5, end);
        parts.push(
          <span key={key++} className="text-rose-400">
            {content}
          </span>
        );
        remaining = remaining.slice(end + 6);
      } else if (nextMarker === attrStart) {
        const end = remaining.indexOf('§/ATTR§', attrStart);
        const content = remaining.slice(attrStart + 6, end);
        parts.push(
          <span key={key++} className="text-sky-300">
            {content}
          </span>
        );
        remaining = remaining.slice(end + 7);
      } else if (nextMarker === valStart) {
        const end = remaining.indexOf('§/VAL§', valStart);
        const content = remaining.slice(valStart + 5, end);
        parts.push(
          <span key={key++} className="text-emerald-300">
            {content}
          </span>
        );
        remaining = remaining.slice(end + 6);
      }
    }
    return (
      <div key={i} className="leading-relaxed">
        {parts}
      </div>);

  });
}
function highlightReact(code: string): React.ReactNode[] {
  return code.split('\n').map((line, i) => {
    // Import statements
    if (line.startsWith('import')) {
      return (
        <div key={i} className="leading-relaxed">
          <span className="text-violet-400">import</span>
          <span className="text-foreground/70">{line.slice(6)}</span>
        </div>);

    }
    // Export/function
    if (line.startsWith('export function')) {
      return (
        <div key={i} className="leading-relaxed">
          <span className="text-violet-400">export </span>
          <span className="text-sky-300">function </span>
          <span className="text-amber-300">{line.slice(16)}</span>
        </div>);

    }
    // const
    if (line.trim().startsWith('const ')) {
      const indent = line.match(/^\s*/)?.[0] || '';
      const rest = line.trim().slice(6);
      return (
        <div key={i} className="leading-relaxed">
          <span>{indent}</span>
          <span className="text-violet-400">const </span>
          <span className="text-foreground/70">{rest}</span>
        </div>);

    }
    // return with JSX
    if (line.trim().startsWith('return')) {
      const indent = line.match(/^\s*/)?.[0] || '';
      const rest = line.trim().slice(6);
      return (
        <div key={i} className="leading-relaxed">
          <span>{indent}</span>
          <span className="text-violet-400">return</span>
          <span className="text-rose-400">{rest}</span>
        </div>);

    }
    // Property lines (key: value)
    const propMatch = line.match(/^(\s+)([\w]+)(\s*:\s*)(.+?)(,?)$/);
    if (propMatch) {
      return (
        <div key={i} className="leading-relaxed">
          <span>{propMatch[1]}</span>
          <span className="text-sky-300">{propMatch[2]}</span>
          <span className="text-muted-foreground">{propMatch[3]}</span>
          <span className="text-emerald-300">{propMatch[4]}</span>
          <span className="text-muted-foreground">{propMatch[5]}</span>
        </div>);

    }
    // Comments
    if (line.trim().startsWith('//')) {
      return (
        <div
          key={i}
          className="leading-relaxed text-muted-foreground/60 italic">
          
          {line}
        </div>);

    }
    return (
      <div key={i} className="leading-relaxed text-foreground/70">
        {line || '\u00A0'}
      </div>);

  });
}
export function LiveCodePanel({ state }: LiveCodePanelProps) {
  const [activeTab, setActiveTab] = useState<CodeTab>('css');
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const code = useMemo(() => {
    switch (activeTab) {
      case 'css':
        return generateCSS(state);
      case 'svg':
        return generateSVG(state);
      case 'react':
        return generateReactComponent(state);
    }
  }, [state, activeTab]);
  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const highlighted = useMemo(() => {
    switch (activeTab) {
      case 'css':
        return highlightCSS(code);
      case 'svg':
        return highlightSVG(code);
      case 'react':
        return highlightReact(code);
    }
  }, [code, activeTab]);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);
  return (
    <div className="h-full flex flex-col bg-card border-t border-border">
      {/* Tab Bar */}
      <div className="flex items-center justify-between px-3 h-9 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-0.5">
          {TAB_CONFIG.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${activeTab === tab.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
            
              {tab.icon}
              {tab.label}
            </button>
          )}

          {/* Line count badge */}
          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono text-muted-foreground bg-secondary">
            {lineCount} lines
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Word wrap toggle */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`p-1.5 rounded-md transition-colors ${wordWrap ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
            title="Toggle word wrap">
            
            <WrapTextIcon className="w-3.5 h-3.5" />
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${copied ? 'bg-emerald-500/15 text-emerald-500' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>
            
            {copied ?
            <>
                <CheckIcon className="w-3 h-3" />
                Copied!
              </> :

            <>
                <CopyIcon className="w-3 h-3" />
                Copy
              </>
            }
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto custom-scroll">
        <div className="flex min-h-full">
          {/* Line Numbers */}
          <div className="flex-shrink-0 py-2.5 pl-3 pr-2 select-none border-r border-border/50">
            {Array.from(
              {
                length: lineCount
              },
              (_, i) =>
              <div
                key={i}
                className="text-[10px] font-mono leading-relaxed text-muted-foreground/40 text-right"
                style={{
                  minWidth: '1.5rem'
                }}>
                
                  {i + 1}
                </div>

            )}
          </div>

          {/* Code Content */}
          <pre
            className={`flex-1 py-2.5 px-3 text-[11px] font-mono ${wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}>
            
            {highlighted}
          </pre>
        </div>
      </div>
    </div>);

}