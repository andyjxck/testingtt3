import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { useGameSession } from "../../hooks/useGameSession";
import { n } from "../../utils/game/helpers";

import { FloatingMoney } from "../../components/game/FloatingMoney";
import { EventCard } from "../../components/game/EventCard";
import { GameHeader } from "../../components/game/GameHeader";
import { EconomyCard } from "../../components/game/EconomyCard";
import { PopulationStats } from "../../components/game/PopulationStats";
import { GameStats } from "../../components/game/GameStats";
import { ElectionCTA } from "../../components/game/ElectionCTA";
import { TapButton } from "../../components/game/TapButton";
import { DropdownNotification } from "../../components/game/DropdownNotification";

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const spinValue = useRef(new Animated.Value(0)).current;
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const {
    isLoading,
    gameSession,
    floatingMoney,
    currentEvent,
    currentNotification,
    electionMutation,
    handleTap,
    removeFloatingMoney,
    dismissNotification,
    handleEventAction,
    handleNewGame,
    handleElection,
  } = useGameSession();

  // Create spinning animation
  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  // Set timeout for loading screen
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  const spinInterpolation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <StatusBar style="light" />

        <LinearGradient
          colors={[
            "rgba(59, 130, 246, 0.6)",
            "rgba(147, 51, 234, 0.8)",
            "rgba(239, 68, 68, 0.4)",
            "#000",
          ]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 24,
              padding: 32,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Animated.View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 4,
                borderColor: "rgba(59, 130, 246, 0.3)",
                borderTopColor: "#3B82F6",
                marginBottom: 24,
                transform: [{ rotate: spinInterpolation }],
              }}
            />

            <Text
              style={{
                color: "#FFF",
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Loading Your Nation
            </Text>

            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: 16,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: loadingTimeout ? 24 : 0,
              }}
            >
              {loadingTimeout
                ? "Taking longer than expected..."
                : "Preparing your government for leadership..."}
            </Text>

            {loadingTimeout && (
              <TouchableOpacity
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.8)",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 16,
                  marginTop: 8,
                }}
                onPress={() => router.replace("/game/select-country")}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Start New Game
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  const showElectionCTA =
    n(gameSession.total_taps, 0) >= 2500 &&
    n(gameSession.total_taps, 0) % 2500 === 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[
          "rgba(59, 130, 246, 0.4)",
          "rgba(147, 51, 234, 0.6)",
          "rgba(239, 68, 68, 0.3)",
          "#000",
        ]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />

      <GameHeader session={gameSession} onNewGame={handleNewGame} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 160,
        }}
        showsVerticalScrollIndicator={false}
        pointerEvents="box-none"
      >
        <EconomyCard session={gameSession} />
        <PopulationStats population={gameSession.population} />
        <GameStats totalTaps={gameSession.total_taps} />

        {showElectionCTA && (
          <ElectionCTA
            onHoldElection={handleElection}
            isPending={electionMutation.isPending}
          />
        )}
      </ScrollView>

      {floatingMoney.map((m) => (
        <FloatingMoney
          key={m.id}
          value={m.value}
          x={m.x}
          y={m.y}
          isDonation={m.isDonation}
          onComplete={() => removeFloatingMoney(m.id)}
        />
      ))}

      {currentEvent && (
        <BlurView
          intensity={80}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
          }}
          pointerEvents="auto"
        />
      )}

      <EventCard event={currentEvent} onAction={handleEventAction} />
      <TapButton onTap={handleTap} />

      <DropdownNotification
        notification={currentNotification}
        onDismiss={dismissNotification}
      />
    </View>
  );
}
