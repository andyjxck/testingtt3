import React, { useEffect, useRef } from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gift, DollarSign, X, Scale } from "lucide-react-native";

export function DropdownNotification({ notification, onDismiss }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notification) {
      // Slide down and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      const timeout = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [notification]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case "donation":
        return <Gift size={20} color="#10B981" />;
      case "money":
        return <DollarSign size={20} color="#F59E0B" />;
      case "law":
        return <Scale size={20} color="#8B5CF6" />;
      default:
        return <Gift size={20} color="#10B981" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "donation":
        return "rgba(16, 185, 129, 0.9)";
      case "money":
        return "rgba(245, 158, 11, 0.9)";
      case "law":
        return "rgba(139, 92, 246, 0.9)";
      default:
        return "rgba(16, 185, 129, 0.9)";
    }
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: insets.top + 10,
        left: 20,
        right: 20,
        zIndex: 1000,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View
        style={{
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View style={{ marginRight: 12 }}>{getIcon()}</View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#FFF",
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 2,
            }}
          >
            {notification.title}
          </Text>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: 14,
            }}
          >
            {notification.description}
          </Text>
          {notification.amount && (
            <Text
              style={{
                color: "#FFF",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 4,
              }}
            >
              +${notification.amount.toLocaleString()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={{
            marginLeft: 12,
            padding: 4,
          }}
        >
          <X size={20} color="rgba(255, 255, 255, 0.8)" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
