import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TapButton({ onTap }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 160,
        paddingBottom: insets.bottom,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 4000,
        pointerEvents: "box-none",
      }}
    >
      <Pressable
        onPressIn={onTap}
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 2,
          borderColor: "rgba(59, 130, 246, 0.6)",
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 20,
          elevation: 10,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LinearGradient
          colors={[
            "rgba(59, 130, 246, 0.8)",
            "rgba(147, 51, 234, 0.6)",
            "rgba(239, 68, 68, 0.4)",
          ]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 58,
          }}
          pointerEvents="none"
        />
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            right: 8,
            height: "40%",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 50,
          }}
          pointerEvents="none"
        />
        <Ionicons
          name="flash"
          size={36}
          color="#FFF"
          style={{ marginBottom: 4 }}
        />
        <Text
          style={{
            color: "#FFF",
            fontSize: 14,
            fontWeight: "bold",
            textAlign: "center",
            textShadowColor: "rgba(0, 0, 0, 0.5)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          TAP TO RULE
        </Text>
      </Pressable>
    </View>
  );
}
