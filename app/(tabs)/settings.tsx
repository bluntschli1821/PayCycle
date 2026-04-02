import { useAnalytics, useResetAnalytics } from "@/lib/analytics";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView as MYSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(MYSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const resetAnalytics = useResetAnalytics();
  const trackEvent = useAnalytics();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Track logout event
      trackEvent("user_signed_out", {
        email: user?.emailAddresses?.[0]?.emailAddress || "unknown",
      });

      await signOut();
      resetAnalytics(); // Clear analytics data on logout
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <View className="flex-1 justify-between">
        <View>
          <Text className="text-2xl font-bold text-slate-900 mb-6">
            Settings
          </Text>
        </View>

        <View className="gap-4 flex-1 position-absolute">
          <Pressable
            className={`rounded-xl items-center py-4 px-6 flex-row gap-3 ${
              isLoggingOut ? "opacity-50" : "opacity-100"
            } active:opacity-80`}
            style={{
              backgroundColor: "#E07856",
            }}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-out" size={20} color="#fff" />
                <Text className="text-white font-semibold text-base">
                  Logout
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
