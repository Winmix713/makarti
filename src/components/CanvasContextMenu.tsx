import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  CopyIcon,
  FileCodeIcon,
  FileJsonIcon,
  DownloadIcon,
  RotateCcwIcon,
  CheckIcon } from
'lucide-react';
import { SuperellipseState } from '../hooks/useSuperellipse';
import { generateCSS } from '../utils/cssGenerator';
import { generateSVG, downloadSVG } from '../utils/svgGenerator';
interface CanvasContextMenuProps {
  state: SuperellipseState;
  resetState: () => void;
  children: React.ReactNode;
}
type MenuItem =
{
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  separator?: false;
} |
{
  separator: true;
  id: string;
};
export function CanvasContextMenu({
  state,
  resetState,
  children
}: CanvasContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }, []);
  const menuItems: MenuItem[] = [
  {
    id: 'copy-svg',
    label: 'Copy SVG',
    icon: <CopyIcon className="w-3.5 h-3.5" />,
    action: () => copyToClipboard(generateSVG(state), 'copy-svg')
  },
  {
    id: 'copy-css',
    label: 'Copy CSS',
    icon: <FileCodeIcon className="w-3.5 h-3.5" />,
    action: () => copyToClipboard(generateCSS(state), 'copy-css')
  },
  {
    id: 'copy-json',
    label: 'Copy JSON',
    icon: <FileJsonIcon className="w-3.5 h-3.5" />,
    action: () =>
    copyToClipboard(JSON.stringify(state, null, 2), 'copy-json')
  },
  {
    separator: true,
    id: 'sep-1'
  },
  {
    id: 'download-svg',
    label: 'Download SVG',
    icon: <DownloadIcon className="w-3.5 h-3.5" />,
    action: () => downloadSVG(state, `superellipse-${Date.now()}.svg`)
  },
  {
    separator: true,
    id: 'sep-2'
  },
  {
    id: 'reset',
    label: 'Reset All',
    icon: <RotateCcwIcon className="w-3.5 h-3.5" />,
    action: resetState
  }];

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const menuW = 200;
    const menuH = 260;
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuW > viewportW) x = viewportW - menuW - 8;
    if (y + menuH > viewportH) y = viewportH - menuH - 8;
    setPosition({
      x,
      y
    });
    setIsOpen(true);
  }, []);
  // Close on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  return (
    <div onContextMenu={handleContextMenu} className="contents">
      {children}

      {isOpen &&
      <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[100]" />

          {/* Menu */}
          <div
          ref={menuRef}
          className="fixed z-[101] min-w-[180px] py-1.5 rounded-xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl animate-fade-in"
          style={{
            left: position.x,
            top: position.y
          }}
          role="menu">
          
            {menuItems.map((item) => {
            if (item.separator) {
              return (
                <div key={item.id} className="h-px bg-border mx-2 my-1" />);

            }
            const isCopied = copiedId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  if (!item.id.startsWith('copy')) {
                    setIsOpen(false);
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                role="menuitem">
                
                  {isCopied ?
                <CheckIcon className="w-3.5 h-3.5 text-green-500" /> :

                item.icon
                }
                  <span>{isCopied ? 'Copied!' : item.label}</span>
                </button>);

          })}
          </div>
        </>
      }
    </div>);

}