/**
 * PostHog Analytics Utilities
 * Use these functions to track events from non-React contexts (validators, utilities, etc)
 */

import {posthog} from "@/src/config/posthog";

/**
 * Capture an event from anywhere in the app (not just React components)
 * @param eventName - Name of the event
 * @param properties - Optional event properties
 */
export const captureEvent = (
    eventName: string,
    properties?: Record<string, any>,
) => {
    if (posthog) {
        posthog.capture(eventName, properties);
    }
};

/**
 * Identify a user with properties (call after authentication)
 * @param distinctId - Unique identifier for the user (usually email)
 * @param properties - Optional user properties
 */
export const identifyUser = (
    distinctId: string,
    properties?: Record<string, any>,
) => {
    if (posthog) {
        posthog.identify(distinctId, properties);
    }
};

/**
 * Track a screen view
 * @param screenName - Name of the screen
 * @param properties - Optional screen properties
 */
export const trackScreen = (
    screenName: string,
    properties?: Record<string, any>,
) => {
    if (posthog) {
        posthog.screen(screenName, properties);
    }
};

/**
 * Register super properties (sent with every event)
 * @param properties - Properties to register
 */
export const registerProperties = (properties: Record<string, any>) => {
    if (posthog) {
        posthog.register(properties);
    }
};

/**
 * Clear user data (call on logout)
 */
export const resetAnalytics = () => {
    if (posthog) {
        posthog.reset();
    }
};

/**
 * Get the current distinct ID
 */
export const getDistinctId = () => {
    return (posthog as any)?.distinctId;
};

/**
 * Flush pending events immediately
 */
export const flushEvents = async () => {
    if (posthog) {
        await posthog.flush();
    }
};

/**
 * Example: Validate email and track validation event
 * Usage: const isValid = validateEmailAndTrack('user@example.com')
 */
export const validateEmailAndTrack = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    if (!isValid) {
        captureEvent("email_validation_failed", {
            // email,
            // Avoid logging PII - only track that validation failed
            email_domain: email.includes("@") ? email.split("@")[1] : undefined,
            error: "Invalid email format",
        });
    }

    return isValid;
};

/**
 * Example: Track data processing events
 * Usage: trackDataProcessing('subscription_import', { count: 5 })
 */
export const trackDataProcessing = (
    processName: string,
    properties?: Record<string, any>,
) => {
    captureEvent(`data_processing_${processName}`, properties);
};
