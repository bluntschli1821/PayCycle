import { useAnalytics } from "@/lib/analytics";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trackEvent = useAnalytics();

  useEffect(() => {
    if (id) {
      trackEvent("subscription_details_viewed", {
        subscriptionId: id,
      });
    }
  }, [id, trackEvent]);

  return (
    <View>
      <Text>Subscription Details: {id}</Text>
    </View>
  );
};

export default SubscriptionDetails;
