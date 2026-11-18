/**
 * WelcomePopup — First-time sign-in welcome voice modal.
 * Plain vanilla JavaScript (no external dependencies).
 *
 * Usage:
 *   import { WelcomePopup } from './welcome-popup.js';
 *   WelcomePopup.show(userId, {
 *     hasSeenWelcome: false, // optional server/DB flag
 *     markSeen: () => api.markWelcomeSeen(userId), // optional server/DB persist callback
 *     force: false,
 *     onClose: () => navigate('/dashboard'),
 *   });
 */

const DEFAULT_WELCOME_AUDIO =
  '/assets/aistudio/ElevenLabs_2026-11-18T12_45_48_Harry_-_Fierce_Warrior_pre_s50_sim75_v4__1__88c4c1eb.mp3';

const STORAGE_PREFIX = 'welcomePopupSeen:';
const STYLE_ELEMENT_ID = 'rf-welcome-popup-styles';

let activeInstance = null;

/**
 * Safely read localStorage without throwing in Safari Private Mode or blocked iframes.
 * @param {string} key
 * @returns {string | null}
 */
function safeGetStorage(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Ignore storage access errors (e.g. Safari Private Browsing, disabled cookies)
  }
  return null;
}

/**
 * Safely write localStorage without throwing in Safari Private Mode or quota-full states.
 * @param {string} key
 * @param {string} value
 */
function safeSetStorage(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage access errors
  }
}

/**
 * Check local fallback flag for whether this user has already seen the welcome popup.
 * @param {string | undefined | null} userId
 * @returns {boolean}
 */
function hasSeenLocally(userId) {
  if (!userId) return false;
  return safeGetStorage(`${STORAGE_PREFIX}${userId}`) === '1';
}

/**
 * Persist local fallback flag for this user.
 * @param {string | undefined | null} userId
 */
function markSeenLocally(userId) {
  if (!userId) return;
  safeSetStorage(`${STORAGE_PREFIX}${userId}`, '1');
}

/**
 * Inject scoped modal styles once, matching ResumeFlow's dark UI tokens & fonts.
 */
function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
    .rf-wp-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(5, 7, 12, 0.78);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: rfWpFadeIn 180ms ease-out;
    }

    .rf-wp-dialog {
      width: min(92vw, 360px);
      background: #101219;
      color: #e2e8f0;
      border: 1px solid #232736;
      border-radius: 16px;
      padding: 28px 24px 22px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(99, 102, 241, 0.08);
      text-align: center;
      box-sizing: border-box;
      animation: rfWpPopIn 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .rf-wp-icon {
      width: 52px;
      height: 52px;
      margin: 0 auto 14px;
      border-radius: 14px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      line-height: 1;
      user-select: none;
    }

    .rf-wp-title {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: #ffffff;
    }

    .rf-wp-text {
      margin: 0 0 20px;
      font-size: 13.5px;
      line-height: 1.5;
      color: #94a3b8;
    }

    .rf-wp-btn {
      width: 100%;
      min-height: 44px;
      padding: 12px 18px;
      border: 0;
      border-radius: 10px;
      background: #4f46e5;
      color: #ffffff;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.2;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background-color 150ms ease, transform 120ms ease, opacity 150ms ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    .rf-wp-btn:hover:not(:disabled) {
      background: #6366f1;
    }

    .rf-wp-btn:active:not(:disabled) {
      transform: scale(0.985);
    }

    .rf-wp-btn:focus-visible {
      outline: 2px solid #818cf8;
      outline-offset: 2px;
    }

    .rf-wp-btn:disabled {
      opacity: 0.72;
      cursor: not-allowed;
      background: #3730a3;
    }

    .rf-wp-status {
      margin: 10px 0 0;
      min-height: 16px;
      font-size: 12px;
      line-height: 1.4;
      color: #fda4af;
    }

    .rf-wp-status:empty {
      display: none;
    }

    .rf-wp-skip-wrap {
      margin-top: 10px;
      display: flex;
      justify-content: center;
    }

    .rf-wp-skip {
      background: transparent;
      border: 0;
      padding: 8px 14px;
      min-height: 36px;
      font-family: inherit;
      font-size: 12.5px;
      font-weight: 500;
      color: #94a3b8;
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
      border-radius: 8px;
      transition: color 150ms ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    .rf-wp-skip:hover {
      color: #ffffff;
    }

    .rf-wp-skip:focus-visible {
      outline: 2px solid #818cf8;
      outline-offset: 2px;
    }

    @keyframes rfWpFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes rfWpPopIn {
      from { opacity: 0; transform: scale(0.96) translateY(6px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .rf-wp-overlay, .rf-wp-dialog {
        animation: none;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Determine whether the welcome popup should be displayed for this user.
 * @param {string | undefined | null} userId
 * @param {object} options
 * @returns {boolean}
 */
function shouldShowPopup(userId, options = {}) {
  if (options.force === true) return true;

  // Prefer server/database flag when provided
  if (options.hasSeenWelcome === true) return false;
  if (options.isNewUser === false && options.hasSeenWelcome !== false) return false;

  // Fallback to per-user localStorage flag (safe in private mode)
  if (hasSeenLocally(userId)) return false;

  return true;
}

export const WelcomePopup = {
  /**
   * Check whether a welcome popup is currently open.
   * @returns {boolean}
   */
  isOpen() {
    return Boolean(activeInstance);
  },

  /**
   * Check whether this user already has the local fallback flag set.
   * @param {string | undefined | null} userId
   * @returns {boolean}
   */
  hasSeen(userId) {
    return hasSeenLocally(userId);
  },

  /**
   * Close any active popup immediately.
   */
  close() {
    if (activeInstance && typeof activeInstance.close === 'function') {
      activeInstance.close();
    }
  },

  /**
   * Show the first-time welcome voice popup if appropriate, otherwise invoke onClose immediately.
   *
   * @param {string} userId
   * @param {object} [options]
   * @param {boolean} [options.force=false] Show popup even if user already saw it
   * @param {boolean} [options.isNewUser] Optional server-side flag indicating first login
   * @param {boolean} [options.hasSeenWelcome] Optional server-side flag indicating prior completion
   * @param {(userId: string) => (Promise<void> | void)} [options.markSeen] Optional server-side persistence callback
   * @param {() => void} [options.onClose] Callback invoked after popup closes (or immediately if skipped)
   * @param {string} [options.audioSrc] Optional custom audio path
   * @returns {boolean} True if popup was rendered, false if skipped
   */
  show(userId, options = {}) {
    const onClose = typeof options.onClose === 'function' ? options.onClose : () => {};
    const audioSrc = options.audioSrc || DEFAULT_WELCOME_AUDIO;

    if (typeof document === 'undefined') {
      onClose();
      return false;
    }

    if (!shouldShowPopup(userId, options)) {
      onClose();
      return false;
    }

    // Close any stale instance cleanly before opening a new one
    if (activeInstance) {
      activeInstance.cleanupOnly();
    }

    ensureStyles();

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let closed = false;
    let seenPersisted = false;
    let audio = null;

    const persistSeen = () => {
      if (seenPersisted) return;
      seenPersisted = true;
      markSeenLocally(userId);
      if (typeof options.markSeen === 'function') {
        try {
          Promise.resolve(options.markSeen(userId)).catch(() => {
            // Do not block UI if background persistence fails
          });
        } catch {
          // Ignore synchronous callback errors
        }
      }
    };

    // Build accessible DOM structure
    const overlay = document.createElement('div');
    overlay.className = 'rf-wp-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'rf-wp-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'rf-welcome-title');
    dialog.setAttribute('aria-describedby', 'rf-welcome-desc');

    const icon = document.createElement('div');
    icon.className = 'rf-wp-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '🎉';

    const title = document.createElement('h2');
    title.id = 'rf-welcome-title';
    title.className = 'rf-wp-title';
    title.textContent = 'Welcome!';

    const desc = document.createElement('p');
    desc.id = 'rf-welcome-desc';
    desc.className = 'rf-wp-text';
    desc.textContent = 'Tap below to hear your welcome message.';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'rf-wp-btn';
    playBtn.textContent = '▶ Click here';

    const statusMsg = document.createElement('p');
    statusMsg.className = 'rf-wp-status';
    statusMsg.setAttribute('aria-live', 'polite');

    const skipWrap = document.createElement('div');
    skipWrap.className = 'rf-wp-skip-wrap';

    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'rf-wp-skip';
    skipBtn.textContent = 'Skip';

    skipWrap.appendChild(skipBtn);
    dialog.appendChild(icon);
    dialog.appendChild(title);
    dialog.appendChild(desc);
    dialog.appendChild(playBtn);
    dialog.appendChild(statusMsg);
    dialog.appendChild(skipWrap);
    overlay.appendChild(dialog);

    const stopAudio = () => {
      if (!audio) return;
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // Ignore cleanup errors
      }
      audio = null;
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      // Trap Tab focus within the modal's interactive controls
      if (event.key === 'Tab') {
        const focusables = [playBtn, skipBtn].filter((el) => !el.disabled);
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const cleanupDom = () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      stopAudio();
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      document.body.style.overflow = previousBodyOverflow;
      if (activeInstance && activeInstance.overlay === overlay) {
        activeInstance = null;
      }
    };

    const closeModal = () => {
      if (closed) return;
      closed = true;
      persistSeen();
      cleanupDom();
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus();
        } catch {
          // Ignore focus restore errors if element was unmounted
        }
      }
      onClose();
    };

    // Audio is ONLY created and played directly inside this user click handler
    playBtn.addEventListener('click', () => {
      if (closed || playBtn.disabled) return;

      persistSeen();
      statusMsg.textContent = '';
      playBtn.disabled = true;
      playBtn.setAttribute('aria-disabled', 'true');
      playBtn.textContent = '🔊 Playing…';

      try {
        audio = new Audio(audioSrc);
        audio.preload = 'auto';
        // Ensure inline playback on iOS Safari & mobile browsers
        audio.playsInline = true;
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');

        audio.onended = () => {
          closeModal();
        };

        audio.onerror = () => {
          stopAudio();
          if (closed) return;
          playBtn.disabled = false;
          playBtn.removeAttribute('aria-disabled');
          playBtn.textContent = '▶ Click here';
          statusMsg.textContent = 'Could not load audio. Tap again or Skip.';
        };

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            stopAudio();
            if (closed) return;
            playBtn.disabled = false;
            playBtn.removeAttribute('aria-disabled');
            playBtn.textContent = '▶ Click here';
            statusMsg.textContent = 'Playback blocked by browser. Tap again or Skip.';
          });
        }
      } catch {
        stopAudio();
        playBtn.disabled = false;
        playBtn.removeAttribute('aria-disabled');
        playBtn.textContent = '▶ Click here';
        statusMsg.textContent = 'Unable to start audio. Tap again or Skip.';
      }
    });

    skipBtn.addEventListener('click', () => {
      closeModal();
    });

    // Mark seen as soon as the welcome dialog is presented to a first-time user
    persistSeen();

    document.addEventListener('keydown', handleKeyDown, true);
    document.body.appendChild(overlay);

    activeInstance = {
      overlay,
      close: closeModal,
      cleanupOnly: cleanupDom,
    };

    // Move focus to primary action button once mounted
    requestAnimationFrame(() => {
      if (!closed) {
        playBtn.focus();
      }
    });

    return true;
  },
};

if (typeof window !== 'undefined') {
  window.WelcomePopup = WelcomePopup;
}

export default WelcomePopup;
