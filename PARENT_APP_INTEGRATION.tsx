/**
 * Parent Application Integration Utilities
 * 
 * Copy these components/hooks into your parent application
 * to easily integrate the HelpDesk Pro iframe
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Type definitions for communication
 */
interface HelpdeskMessage {
  type: string;
  data?: any;
  timestamp?: string;
  source?: string;
}

interface UseHelpdeskIframeOptions {
  src: string;
  onReady?: () => void;
  onMessage?: (message: HelpdeskMessage) => void;
}

/**
 * React Hook for HelpDesk iframe integration
 * 
 * Usage:
 * ```tsx
 * const { iframeRef, isReady, navigate, sendMessage } = useHelpdeskIframe({
 *   src: 'https://your-helpdesk-url.com',
 *   onReady: () => console.log('HelpDesk is ready!'),
 *   onMessage: (msg) => console.log('Received:', msg)
 * });
 * 
 * return <iframe ref={iframeRef} style={{ width: '100%', height: '100vh' }} />;
 * ```
 */
export function useHelpdeskIframe({
  src,
  onReady,
  onMessage
}: UseHelpdeskIframeOptions) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Listen for messages from HelpDesk
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message: HelpdeskMessage = event.data;

      // Call custom message handler
      if (onMessage) {
        onMessage(message);
      }

      // Handle ready event
      if (message.source === 'helpdesk-app' && message.type === 'HELPDESK_READY') {
        setIsReady(true);
        if (onReady) {
          onReady();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMessage, onReady]);

  // Navigate to a specific route
  const navigate = useCallback((path: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'NAVIGATE',
        path
      }, '*');
    }
  }, []);

  // Send custom message to HelpDesk
  const sendMessage = useCallback((type: string, data?: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type,
        data,
        timestamp: new Date().toISOString()
      }, '*');
    }
  }, []);

  return {
    iframeRef,
    isReady,
    navigate,
    sendMessage
  };
}

/**
 * Pre-built HelpDesk Iframe Component
 * 
 * Usage:
 * ```tsx
 * <HelpdeskIframe 
 *   src="https://your-helpdesk-url.com"
 *   onReady={() => console.log('Ready!')}
 *   className="my-custom-class"
 * />
 * ```
 */
interface HelpdeskIframeProps {
  src: string;
  onReady?: () => void;
  onMessage?: (message: HelpdeskMessage) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function HelpdeskIframe({
  src,
  onReady,
  onMessage,
  className,
  style
}: HelpdeskIframeProps) {
  const { iframeRef, isReady } = useHelpdeskIframe({ src, onReady, onMessage });

  return (
    <div className={className} style={style || { width: '100%', height: '100%' }}>
      {!isReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <div style={{
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Loading HelpDesk...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
        allow="clipboard-write; clipboard-read"
        title="HelpDesk Pro"
      />
    </div>
  );
}

/**
 * HelpDesk Navigation Sidebar (optional)
 * 
 * Usage:
 * ```tsx
 * const { navigate } = useHelpdeskIframe({ src: '...' });
 * 
 * <HelpdeskNavSidebar onNavigate={navigate} />
 * ```
 */
interface HelpdeskNavSidebarProps {
  onNavigate: (path: string) => void;
}

export function HelpdeskNavSidebar({ onNavigate }: HelpdeskNavSidebarProps) {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Tickets', path: '/tickets', icon: '🎫' },
    { label: 'Operations', path: '/operations', icon: '⚡' },
    { label: 'Queue', path: '/queue', icon: '📋' },
    { label: 'Duplicates', path: '/duplicates', icon: '📑' },
    { label: 'Performance', path: '/performance', icon: '🏆' },
    { label: 'Reports', path: '/reports', icon: '📈' },
    { label: 'Knowledge Base', path: '/knowledge-base', icon: '💡' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div style={{
      width: '250px',
      background: '#fff',
      borderRight: '1px solid #e5e7eb',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#111827'
      }}>
        HelpDesk Navigation
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Complete Example Component
 */
export function HelpdeskEmbedExample() {
  const { iframeRef, isReady, navigate, sendMessage } = useHelpdeskIframe({
    src: 'https://your-helpdesk-url.com',
    onReady: () => {
      console.log('✅ HelpDesk is ready!');
    },
    onMessage: (msg) => {
      console.log('📨 Received message:', msg);
    }
  });

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Optional sidebar */}
      <HelpdeskNavSidebar onNavigate={navigate} />
      
      {/* Main iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        {!isReady && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: '#3b82f6',
            color: 'white',
            padding: '0.5rem',
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            Connecting to HelpDesk...
          </div>
        )}
        <iframe
          ref={iframeRef}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="clipboard-write; clipboard-read"
          title="HelpDesk Pro"
        />
      </div>
    </div>
  );
}

/**
 * CSS Animation (add to your global styles)
 */
const globalStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Add to document if needed
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = globalStyles;
  document.head.appendChild(styleEl);
}
