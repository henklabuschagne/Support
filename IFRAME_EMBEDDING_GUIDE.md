# HelpDesk Pro - Iframe Embedding Guide

## ✅ Iframe Embedding Enabled

This application is fully configured to be embedded in iframes within your internal applications.

## Configuration

The following configurations have been implemented to allow iframe embedding:

### 1. **HTTP Headers** 
- `X-Frame-Options`: Set to empty (allows embedding)
- `Content-Security-Policy`: `frame-ancestors *` (allows embedding from any origin)

### 2. **Vite Server Configuration**
Both development (`server`) and production (`preview`) modes are configured with appropriate headers in `vite.config.ts`.

### 3. **Runtime Detection**
The app automatically detects when it's running in an iframe and:
- Sets `data-iframe-mode="true"` on the body element
- Sends a ready message to the parent window
- Listens for messages from the parent application

## How to Embed

### Basic Embedding

```html
<iframe 
  src="https://your-helpdesk-app-url.com" 
  width="100%" 
  height="800px"
  frameborder="0"
  allow="clipboard-write; clipboard-read"
  title="HelpDesk Pro">
</iframe>
```

### Responsive Full-Height Embedding

```html
<div style="width: 100%; height: 100vh;">
  <iframe 
    src="https://your-helpdesk-app-url.com" 
    style="width: 100%; height: 100%; border: none;"
    allow="clipboard-write; clipboard-read"
    title="HelpDesk Pro">
  </iframe>
</div>
```

### React Component Example

```tsx
import { useEffect, useRef } from 'react';

function HelpdeskEmbed() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle messages from the helpdesk app
      if (event.data.source === 'helpdesk-app') {
        console.log('Message from HelpDesk:', event.data);
        
        if (event.data.type === 'HELPDESK_READY') {
          console.log('HelpDesk app is ready!');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="https://your-helpdesk-app-url.com"
      style={{ width: '100%', height: '100vh', border: 'none' }}
      allow="clipboard-write; clipboard-read"
      title="HelpDesk Pro"
    />
  );
}

export default HelpdeskEmbed;
```

## Communication with Parent Window

### Messages Sent by HelpDesk App

The app automatically sends messages to the parent window:

```javascript
{
  type: 'HELPDESK_READY',
  timestamp: '2026-02-25T10:30:00.000Z',
  source: 'helpdesk-app'
}
```

### Sending Messages to HelpDesk App

You can send navigation or configuration messages:

```javascript
// From your parent application
const helpdeskIframe = document.querySelector('iframe[title="HelpDesk Pro"]');

helpdeskIframe.contentWindow.postMessage({
  type: 'NAVIGATE',
  path: '/tickets'
}, '*');
```

## Security Considerations

### Production Deployment

For production, you should restrict the `frame-ancestors` CSP directive to specific domains:

**In `vite.config.ts`:**

```typescript
server: {
  headers: {
    'X-Frame-Options': '',
    'Content-Security-Policy': "frame-ancestors 'self' https://your-internal-app.com https://another-trusted-domain.com",
  },
},
```

### Recommended Settings

```typescript
// For internal company use
'Content-Security-Policy': "frame-ancestors 'self' https://*.yourcompany.com",

// For specific trusted domains
'Content-Security-Policy': "frame-ancestors 'self' https://app1.company.com https://app2.company.com",
```

## Testing Iframe Embedding

### Local Testing

1. Create a simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>HelpDesk Embed Test</title>
</head>
<body style="margin: 0; padding: 0;">
  <iframe 
    src="http://localhost:5173" 
    style="width: 100vw; height: 100vh; border: none;">
  </iframe>

  <script>
    window.addEventListener('message', (event) => {
      if (event.data.source === 'helpdesk-app') {
        console.log('Received from HelpDesk:', event.data);
      }
    });
  </script>
</body>
</html>
```

2. Open this file in a browser to test embedding

### Verification

To verify iframe embedding is working:

1. Open browser DevTools Console
2. Look for: `✅ App is running in iframe mode`
3. Check that no X-Frame-Options errors appear
4. Verify the app displays correctly within the iframe

## Features in Iframe Mode

All features work identically in iframe mode:
- ✅ Navigation between pages
- ✅ Creating and editing tickets
- ✅ Dashboard analytics
- ✅ Operations and queue management
- ✅ Settings and configuration
- ✅ Toast notifications
- ✅ Dialogs and modals
- ✅ File operations (within browser limits)

## Styling in Iframe Mode

The app automatically adjusts styling when embedded:
- Removes body margins/padding
- Ensures proper scrolling behavior
- Fills the iframe container completely

Custom iframe-specific styles can be added by targeting:

```css
body[data-iframe-mode="true"] {
  /* Your custom styles */
}
```

## Troubleshooting

### Issue: Iframe shows blank page
**Solution:** Check browser console for CSP or X-Frame-Options errors. Verify server headers are configured correctly.

### Issue: App doesn't fill iframe
**Solution:** Ensure iframe has explicit width/height and the parent container is sized properly.

### Issue: Scrolling doesn't work
**Solution:** Check that the iframe has appropriate height and overflow settings.

### Issue: Can't communicate with parent
**Solution:** Verify both apps are using `postMessage` correctly and listening for messages.

## Browser Compatibility

Iframe embedding is supported in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Additional Notes

- The app automatically detects iframe mode on load
- No manual configuration needed in the app itself
- Parent-child communication uses standard `postMessage` API
- All routes and deep links work when embedded

## Support

For issues with iframe embedding, check:
1. Browser console for errors
2. Network tab for failed requests
3. Server response headers
4. CSP violations in DevTools Security tab
