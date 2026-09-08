import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  collapsible?: boolean;
}

export function Panel({ children, className = '', title, collapsible = false }: PanelProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {title && (
        <div 
          className="px-4 py-3 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
        >
          <h4 className="font-medium text-gray-900">{title}</h4>
          {collapsible && (
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      )}
      {!isCollapsed && <div className="p-4">{children}</div>}
    </div>
  );
}
