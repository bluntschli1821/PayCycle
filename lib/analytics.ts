import { usePostHog } from "posthog-react-native";
import { useCallback } from "react";

/**
 * Hook to easily track custom events throughout your app
 * Usage:
 * const trackEvent = useAnalytics();
 * trackEvent('user_signed_up', { plan: 'premium' });
 */
export const useAnalytics = () => {
  const posthog = usePostHog();

  return useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      if (posthog) {
        posthog.capture(eventName, properties);
      }
    },
    [posthog],
  );
};

/**
 * Hook to identify the current user
 * Usage:
 * const identifyUser = useIdentifyUser();
 * identifyUser('user@example.com', { name: 'John Doe' });
 */
export const useIdentifyUser = () => {
  const posthog = usePostHog();

  return useCallback(
    (userId: string, properties?: Record<string, any>) => {
      if (posthog) {
        posthog.identify(userId, properties);
      }
    },
    [posthog],
  );
};

/**
 * Hook to track screen views manually
 * Usage:
 * const trackScreen = useTrackScreen();
 * trackScreen('home', { tab: 'subscriptions' });
 */
export const useTrackScreen = () => {
  const posthog = usePostHog();

  return useCallback(
    (screenName: string, properties?: Record<string, any>) => {
      if (posthog) {
        posthog.screen(screenName, properties);
      }
    },
    [posthog],
  );
};

/**
 * Hook to register super properties (sent with every event)
 * Usage:
 * const registerProperties = useRegisterProperties();
 * registerProperties({ app_version: '1.0.0', environment: 'production' });
 */
export const useRegisterProperties = () => {
  const posthog = usePostHog();

  return useCallback(
    (properties: Record<string, any>) => {
      if (posthog) {
        posthog.register(properties);
      }
    },
    [posthog],
  );
};

/**
 * Hook to reset user data (useful on logout)
 * Usage:
 * const resetAnalytics = useResetAnalytics();
 * resetAnalytics();
 */
export const useResetAnalytics = () => {
  const posthog = usePostHog();

  return useCallback(() => {
    if (posthog) {
      posthog.reset();
    }
  }, [posthog]);
};
