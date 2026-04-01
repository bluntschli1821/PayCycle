import { Text } from "react-native";
import React from "react";
import { SafeAreaView as MYSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(MYSafeAreaView);

const Subscriptions = () => {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text className="text-xl font-bold text-success">Subscriptions</Text>
    </SafeAreaView>
  );
};

export default Subscriptions;
