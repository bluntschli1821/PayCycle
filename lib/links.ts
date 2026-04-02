import { Alert, Linking, Platform } from "react-native";

/**
 * Normalize phone number for tel: and sms: URLs
 * Keeps only digits and a single leading '+' for E.164 format
 * @param phoneNumber - Phone number to normalize
 * @returns Normalized phone number (e.g., "+15551234567" or "15551234567")
 */
const normalizePhoneNumber = (phoneNumber: string) =>
  phoneNumber
    .trim()
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "");

/**
 * Opens a URL in the default browser or app
 * Safe for both web and native environments
 * @param url - The URL to open
 * @param title - Optional title for the error alert
 */
export const openURL = async (
  url: string,
  title: string = "Cannot open URL",
) => {
  try {
    // Validate URL
    if (!url) {
      Alert.alert(title, "No URL provided");
      return;
    }

    // Ensure URL has protocol
    const urlWithProtocol =
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:")
        ? url
        : `https://${url}`;

    // Check if URL can be opened
    const canOpen = await Linking.canOpenURL(urlWithProtocol);

    if (canOpen) {
      await Linking.openURL(urlWithProtocol);
    } else {
      Alert.alert(
        title,
        `Unable to open this URL on ${Platform.OS}. URL: ${urlWithProtocol}`,
      );
    }
  } catch (error) {
    console.error("Error opening URL:", error);
    Alert.alert(title, "An error occurred while trying to open the link");
  }
};

/**
 * Open an email client
 * @param email - Email address
 * @param subject - Optional email subject
 * @param body - Optional email body text
 */
export const sendEmail = async (
  email: string,
  subject?: string,
  body?: string,
) => {
  const mailtoUrl = `mailto:${email}${subject || body ? "?" : ""}${
    subject ? `subject=${encodeURIComponent(subject)}` : ""
  }${subject && body ? "&" : ""}${
    body ? `body=${encodeURIComponent(body)}` : ""
  }`;

  await openURL(mailtoUrl, "Cannot open email client");
};

/**
 * Open phone dialer
 * @param phoneNumber - Phone number to call (can include +, spaces, dashes, etc.)
 * @example
 * callPhone("+1 (555) 123-4567") // Dials +15551234567
 * callPhone("15551234567") // Dials 15551234567
 */
export const callPhone = async (phoneNumber: string) => {
  const telUrl = `tel:${normalizePhoneNumber(phoneNumber)}`;
  await openURL(telUrl, "Cannot open phone dialer");
};

/**
 * Open SMS/messaging app
 * @param phoneNumber - Phone number to text (can include +, spaces, dashes, etc.)
 * @param message - Optional message text
 * @example
 * sendSMS("+1 (555) 123-4567", "Hello!")  // Texts +15551234567 with "Hello!"
 * sendSMS("15551234567")  // Opens SMS to 15551234567
 */
export const sendSMS = async (phoneNumber: string, message?: string) => {
  const smsUrl = `sms:${normalizePhoneNumber(phoneNumber)}${
    message ? `?body=${encodeURIComponent(message)}` : ""
  }`;

  await openURL(smsUrl, "Cannot open messaging app");
};
