import React from "react";
import { View, Text } from "react-native";
import { n } from "../../utils/game/helpers";

export function EconomyCard({ session }) {
  // Use the effective tap value calculated server-side that includes all bonuses
  const displayTapValue = session.tap_value || 1;

  return (
    <View
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        pointerEvents="none"
      />
      <Text
        style={{
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: 14,
          marginBottom: 8,
          fontWeight: "600",
        }}
      >
        💰 National Treasury
      </Text>
      <Text
        style={{
          color: "#3B82F6",
          fontSize: 36,
          fontWeight: "bold",
          marginBottom: 8,
          textShadowColor: "rgba(59, 130, 246, 0.5)",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }}
      >
        ${n(session.money, 0).toLocaleString()}
      </Text>
      <Text
        style={{
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: 12,
          fontWeight: "500",
        }}
      >
        +${displayTapValue} per tap
      </Text>
    </View>
  );
}
