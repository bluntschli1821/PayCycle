import { View, Text, Image } from "react-native";
import React from "react";
import { formatCurrency } from "@/lib/utils";

const UpcomningSubscriptionCard = ({
  name,
  icon,
  daysLeft,
  price,
  currency,
}: UpcomingSubscription) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, (currency = "USD"))}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1 ? `${daysLeft} days left` : `last day`}
          </Text>
        </View>
      </View>
      <Text className="upcoming-name">{name}</Text>
    </View>
  );
};

export default UpcomningSubscriptionCard;
