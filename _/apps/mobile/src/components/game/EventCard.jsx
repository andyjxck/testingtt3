import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";

export function EventCard({ event, onAction }) {
  if (!event) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 120,
        left: 20,
        right: 20,
        zIndex: 2500,
        pointerEvents: "box-none",
      }}
    >
      <LinearGradient
        colors={["rgba(138, 43, 226, 0.95)", "rgba(75, 0, 130, 0.95)"]}
        style={{
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons name="document-text" size={24} color="#D6F01F" />
          <Text
            style={{
              color: "#FFF",
              fontSize: 18,
              fontWeight: "bold",
              marginLeft: 8,
              flex: 1,
            }}
          >
            {event.title}
          </Text>
        </View>

        <Text
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: 14,
            marginBottom: 16,
            lineHeight: 20,
          }}
        >
          {event.description}
        </Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={() => onAction("reject")}
            style={{
              flex: 1,
              backgroundColor: "rgba(255, 92, 92, 0.2)",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#FF5C5C",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FF5C5C", fontSize: 14, fontWeight: "600" }}>
              {event.type === "law" ? "Reject" : "Decline"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onAction("accept")}
            style={{
              flex: 1,
              backgroundColor: "rgba(214, 240, 31, 0.2)",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#D6F01F",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#D6F01F", fontSize: 14, fontWeight: "600" }}>
              {event.type === "law" ? "Pass" : "Accept"}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
