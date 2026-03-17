import { useEffect, useState } from 'react';

/**
 * Component to detect and handle iframe embedding
 * This ensures the app works correctly when embedded in other applications
 */
export function IframeDetector({ children }: { children: React.ReactNode }) {
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Detect if running in iframe
    let inIframe = false;
    try {
      inIframe = window.self !== window.top;
    } catch (e) {
      // Cross-origin iframe access may throw
      inIframe = true;
    }
    setIsInIframe(inIframe);

    if (inIframe) {
      console.log('✅ App is running in iframe mode');
      
      // Only send ready message if not inside Figma's preview iframe
      try {
        if (!window.location.ancestorOrigins?.contains('https://www.figma.com')) {
          window.parent.postMessage({
            type: 'HELPDESK_READY',
            timestamp: new Date().toISOString()
          }, '*');
        }
      } catch (e) {
        // Silently ignore - parent frame may not accept messages
      }
    } else {
      console.log('✅ App is running in standalone mode');
    }

    // Listen for messages from parent
    const handleMessage = (event: MessageEvent) => {
      // Guard against null/undefined data or non-object messages
      if (!event.data || typeof event.data !== 'object') return;
      // Ignore Figma internal messages
      if (event.origin?.includes('figma.com')) return;
      
      if (event.data.type === 'NAVIGATE') {
        console.log('Received navigation request from parent:', event.data.path);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Add data attribute to body for iframe mode styling if needed
  useEffect(() => {
    if (isInIframe) {
      document.body.setAttribute('data-iframe-mode', 'true');
    } else {
      document.body.removeAttribute('data-iframe-mode');
    }
  }, [isInIframe]);

  return <>{children}</>;
}

/**
 * Hook to detect if app is in iframe
 */
export function useIsInIframe() {
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  return isInIframe;
}

/**
 * Utility to send messages to parent window
 */
export function sendToParent(type: string, data?: any) {
  try {
    if (window.self !== window.top) {
      window.parent.postMessage({
        type,
        data,
        timestamp: new Date().toISOString(),
        source: 'helpdesk-app'
      }, '*');
    }
  } catch (e) {
    // Silently fail - cross-origin or destroyed port
  }
}