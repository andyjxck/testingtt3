import React, { useEffect, useRef } from "react";
import { Animated, View, Text } from "react-native";

export function FloatingMoney({ value, x, y, onComplete, isDonation = false }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isDonation ? -200 : -150,
        duration: isDonation ? 2000 : 1500, // Donations float longer and higher
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: isDonation ? 2000 : 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: isDonation ? 1.5 : 1.2, // Donations are bigger
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete?.());
  }, [onComplete, opacity, translateY, scale, isDonation]);

  const displayValue = typeof value === "string" ? value : `+$${value}`;

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: [{ translateY }, { scale }],
        opacity,
        zIndex: 3000,
      }}
      pointerEvents="none"
    >
      <View
        style={{
          backgroundColor: isDonation
            ? "rgba(255, 215, 0, 0.2)"
            : "rgba(255, 255, 255, 0.15)",
          borderRadius: 20,
          padding: 8,
          borderWidth: 1,
          borderColor: isDonation
            ? "rgba(255, 215, 0, 0.5)"
            : "rgba(214, 240, 31, 0.3)",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            backgroundColor: isDonation
              ? "rgba(255, 215, 0, 0.1)"
              : "rgba(255, 255, 255, 0.1)",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        />
        <Text
          style={{
            color: isDonation ? "#FFD700" : "#D6F01F", // Gold for donations
            fontSize: isDonation ? 18 : 20,
            fontWeight: "bold",
            textShadowColor: isDonation
              ? "rgba(255, 215, 0, 0.8)"
              : "rgba(214, 240, 31, 0.8)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          }}
        >
          {displayValue}
        </Text>
      </View>
    </Animated.View>
  );
}
