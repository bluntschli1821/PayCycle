import "@/globals.css";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import React, { useEffect } from "react";

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY!;
const posthogHost =
  process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

if (!posthogApiKey || posthogApiKey === "phc_YOUR_API_KEY_HERE") {
  console.warn(
    "PostHog API key not configured. Analytics will be disabled. Add EXPO_PUBLIC_POSTHOG_API_KEY to .env to enable.",
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      console.log("Fonts successfully loaded!");
    } else {
      console.log("Loading fonts...");
    }
  }, [fontsLoaded]);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogProvider
        apiKey={posthogApiKey === "phc_YOUR_API_KEY_HERE" ? "" : posthogApiKey}
        options={{
          host: posthogHost,
          disabled: !posthogApiKey || posthogApiKey === "phc_YOUR_API_KEY_HERE",
        }}
        autocapture
      >
        {fontsLoaded ? <Stack screenOptions={{ headerShown: false }} /> : null}
      </PostHogProvider>
    </ClerkProvider>
  );
}
