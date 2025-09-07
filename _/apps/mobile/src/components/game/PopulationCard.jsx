import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { n } from "../../utils/game/helpers";

export function PopulationCard({ title, popularity, color, icon }) {
  const pct = n(popularity, 0);
  const getBarColor = () => {
    if (pct >= 70) return "#78FF8A";
    if (pct >= 40) return "#D6F01F";
    return "#FF5C5C";
  };

  return (
    <View
      style={{
        backgroundColor: "rgba(26, 26, 26, 0.8)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Ionicons name={icon} size={20} color={color} />
        <Text
          style={{
            color: "#FFF",
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 8,
            flex: 1,
          }}
        >
          {title}
        </Text>
        <Text
          style={{ color: getBarColor(), fontSize: 16, fontWeight: "bold" }}
        >
          {pct}%
        </Text>
      </View>

      <View
        style={{
          height: 6,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: getBarColor(),
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}
