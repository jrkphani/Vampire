import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

export function GlobalShortcuts() {
  const navigate = useNavigate();
  const { toggleCommandPalette, keyboardShortcutsEnabled, addToast } =
    useUIStore();
  const { logout } = useAuthStore();

  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields, textareas, or content-editable elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.isContentEditable
      ) {
        // Allow Ctrl+K to work even in input fields for command palette
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          toggleCommandPalette();
        }
        return;
      }

      // Handle keyboard shortcuts
      switch (true) {
        // Command Palette - Ctrl+K or Cmd+K
        case (event.ctrlKey || event.metaKey) && event.key === 'k':
          event.preventDefault();
          toggleCommandPalette();
          break;

        // Quick Search - / key (alternative to Ctrl+K)
        case event.key === '/' &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey:
          event.preventDefault();
          toggleCommandPalette();
          break;

        // Function Key Shortcuts
        case event.key === 'F1':
          event.preventDefault();
          navigate('/dashboard');
          addToast({
            title: 'Navigation',
            message: 'Opened Dashboard (F1)',
            type: 'success',
          });
          break;

        case event.key === 'F2':
          event.preventDefault();
          navigate('/enquiry');
          addToast({
            title: 'Navigation',
            message: 'Opened Customer Enquiry (F2)',
            type: 'success',
          });
          break;

        case event.key === 'F3':
          event.preventDefault();
          navigate('/enquiry');
          addToast({
            title: 'Navigation',
            message: 'Opened Universal Search (F3)',
            type: 'success',
          });
          break;

        case event.key === 'F4':
          event.preventDefault();
          navigate('/transactions/renewal');
          addToast({
            title: 'Navigation',
            message: 'Opened Ticket Renewal (F4)',
            type: 'success',
          });
          break;

        case event.key === 'F5' && !event.ctrlKey:
          event.preventDefault();
          navigate('/transactions/redemption');
          addToast({
            title: 'Navigation',
            message: 'Opened Ticket Redemption (F5)',
            type: 'success',
          });
          break;

        case event.key === 'F6':
          event.preventDefault();
          addToast({
            title: 'Feature',
            message: 'Lost Pledge Report (F6) - Not yet implemented',
            type: 'info',
          });
          break;

        case event.key === 'F12':
          event.preventDefault();
          addToast({
            title: 'Feature',
            message: 'Settings (F12) - Not yet implemented',
            type: 'info',
          });
          break;

        // Ctrl+Shift+L for logout
        case event.ctrlKey && event.shiftKey && event.key === 'L':
          event.preventDefault();
          logout();
          addToast({
            title: 'Authentication',
            message: 'Logged out (Ctrl+Shift+L)',
            type: 'success',
          });
          break;

        // Escape to close command palette (handled by the command palette itself)
        case event.key === 'Escape':
          // Let this bubble up to be handled by individual components
          break;

        default:
          // No action for other keys
          break;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    navigate,
    toggleCommandPalette,
    keyboardShortcutsEnabled,
    addToast,
    logout,
  ]);

  // This component doesn't render anything
  return null;
}
