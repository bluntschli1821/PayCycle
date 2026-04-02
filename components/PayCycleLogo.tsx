import React from "react";
import { Image, Text, View } from "react-native";

interface PayCycleLogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export default function PayCycleLogo({
  size = "medium",
  showText = true,
}: PayCycleLogoProps) {
  const sizeMap = {
    small: { image: 32, text: 16, gap: 6 },
    medium: { image: 48, text: 24, gap: 8 },
    large: { image: 64, text: 32, gap: 12 },
  };

  const dimensions = sizeMap[size];

  return (
    <View className="flex-row items-center gap-3">
      <Image
        source={require("../assets/images/logo-glow.png")}
        style={{
          width: dimensions.image,
          height: dimensions.image,
          resizeMode: "contain",
        }}
      />
      {showText && (
        <Text
          style={{
            fontSize: dimensions.text,
            fontWeight: "bold",
            color: "#081126",
            fontFamily: "sans-bold",
          }}
        >
          PayCycle
        </Text>
      )}
    </View>
  );
}
