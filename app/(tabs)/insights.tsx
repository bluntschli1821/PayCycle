import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView as MYSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(MYSafeAreaView);

const insights = () => {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text>insights</Text>
    </SafeAreaView>
  );
};

export default insights;
