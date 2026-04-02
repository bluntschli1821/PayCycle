import { Alert, Linking, Platform } from "react-native";

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
 * @param phoneNumber - Phone number to call
 */
export const callPhone = async (phoneNumber: string) => {
  const telUrl = `tel:${phoneNumber.replace(/\D/g, "")}`;
  await openURL(telUrl, "Cannot open phone dialer");
};

/**
 * Open SMS/messaging app
 * @param phoneNumber - Phone number to text
 * @param message - Optional message text
 */
export const sendSMS = async (phoneNumber: string, message?: string) => {
  const smsUrl = `sms:${phoneNumber.replace(/\D/g, "")}${
    message ? `?body=${encodeURIComponent(message)}` : ""
  }`;

  await openURL(smsUrl, "Cannot open messaging app");
};
