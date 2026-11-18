export interface WelcomePopupOptions {
  force?: boolean;
  isNewUser?: boolean;
  hasSeenWelcome?: boolean;
  markSeen?: (userId: string) => Promise<void> | void;
  onClose?: () => void;
  audioSrc?: string;
}

export const WelcomePopup: {
  isOpen(): boolean;
  hasSeen(userId?: string | null): boolean;
  close(): void;
  show(userId: string, options?: WelcomePopupOptions): boolean;
};

export default WelcomePopup;
