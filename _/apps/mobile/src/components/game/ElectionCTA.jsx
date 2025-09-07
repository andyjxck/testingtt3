import React from "react";
import { View, Text, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function ElectionCTA({ onHoldElection, isPending }) {
  return (
    <Pressable
      onPress={onHoldElection}
      disabled={isPending}
      style={{
        backgroundColor: "rgba(255, 69, 0, 0.9)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: "#FF4500",
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Ionicons name="ballot" size={24} color="#FFF" />
        <Text
          style={{
            color: "#FFF",
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: 8,
          }}
        >
          Election Time!
        </Text>
      </View>
      <Text
        style={{
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: 14,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        5 years have passed. Face the people's judgment.
      </Text>
      <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
        {isPending ? "Counting Votes..." : "Hold Election"}
      </Text>
    </Pressable>
  );
}
