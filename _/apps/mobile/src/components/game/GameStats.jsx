import React from "react";
import { View, Text } from "react-native";
import { n } from "../../utils/game/helpers";

const StatBox = ({ label, value }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: "rgba(26, 26, 26, 0.8)",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
    }}
  >
    <Text
      style={{
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 12,
        marginBottom: 4,
      }}
    >
      {label}
    </Text>
    <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>
      {value}
    </Text>
  </View>
);

export function GameStats({ totalTaps }) {
  const taps = n(totalTaps, 0);
  const nextElectionTaps = Math.max(0, 2500 - (taps % 2500));

  return (
    <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
      <StatBox label="Total Taps" value={taps.toLocaleString()} />
      <StatBox label="Next Election" value={`${nextElectionTaps} taps`} />
    </View>
  );
}
