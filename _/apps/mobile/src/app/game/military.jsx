import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

function MilitaryUnitCard({ unit, onRecruit, playerMoney, currentCount }) {
  const canAfford = playerMoney >= unit.cost;

  return (
    <View
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Glass overlay */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      />

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Ionicons name="shield" size={24} color="#9945FF" />
        <Text
          style={{
            color: "#FFF",
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 8,
            flex: 1,
          }}
        >
          {unit.name}
        </Text>
        <Text
          style={{
            color: "#D6F01F",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          Own: {currentCount || 0}
        </Text>
      </View>

      <Text
        style={{
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: 14,
          marginBottom: 12,
          lineHeight: 20,
        }}
      >
        {unit.description}
      </Text>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 20,
          }}
        >
          <Ionicons name="flash" size={14} color="#FF9500" />
          <Text style={{ color: "#FF9500", fontSize: 12, marginLeft: 4 }}>
            {unit.strength} Strength
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="cash"
            size={14}
            color={canAfford ? "#78FF8A" : "#FF5C5C"}
          />
          <Text
            style={{
              color: canAfford ? "#78FF8A" : "#FF5C5C",
              fontSize: 12,
              marginLeft: 4,
            }}
          >
            ${unit.cost.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          disabled={!canAfford}
          onPress={() => {
            Haptics.selectionAsync();
            onRecruit(unit, 1);
          }}
          style={{
            flex: 1,
            backgroundColor: canAfford
              ? "rgba(153, 69, 255, 0.2)"
              : "rgba(255, 255, 255, 0.05)",
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: canAfford ? "#9945FF" : "rgba(255, 255, 255, 0.1)",
            opacity: canAfford ? 1 : 0.5,
          }}
        >
          <Text
            style={{
              color: canAfford ? "#9945FF" : "rgba(255, 255, 255, 0.5)",
              fontSize: 14,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Recruit 1
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={playerMoney < unit.cost * 5}
          onPress={() => {
            Haptics.selectionAsync();
            onRecruit(unit, 5);
          }}
          style={{
            flex: 1,
            backgroundColor:
              playerMoney >= unit.cost * 5
                ? "rgba(214, 240, 31, 0.2)"
                : "rgba(255, 255, 255, 0.05)",
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor:
              playerMoney >= unit.cost * 5
                ? "#D6F01F"
                : "rgba(255, 255, 255, 0.1)",
            opacity: playerMoney >= unit.cost * 5 ? 1 : 0.5,
          }}
        >
          <Text
            style={{
              color:
                playerMoney >= unit.cost * 5
                  ? "#D6F01F"
                  : "rgba(255, 255, 255, 0.5)",
              fontSize: 14,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Recruit 5
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MilitaryStatCard({ title, value, icon, color }) {
  return (
    <View
      style={{
        backgroundColor: "rgba(26, 26, 26, 0.8)",
        borderRadius: 12,
        padding: 16,
        flex: 1,
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
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 12,
            marginLeft: 8,
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{
          color: "#FFF",
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        {value?.toLocaleString() || "0"}
      </Text>
    </View>
  );
}

export default function MilitaryScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Get current session
  const { data: sessionData } = useQuery({
    queryKey: ["gameSession"],
    queryFn: async () => {
      const response = await fetch("/api/game/session");
      if (!response.ok) throw new Error("Failed to fetch session");
      return response.json();
    },
  });

  // Get military recruitment data
  const { data: militaryData, isLoading } = useQuery({
    queryKey: ["militaryRecruitment", sessionData?.session?.id],
    queryFn: async () => {
      if (!sessionData?.session?.id) return null;
      const response = await fetch(
        `/api/game/military/recruit?sessionId=${sessionData.session.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch military data");
      return response.json();
    },
    enabled: !!sessionData?.session?.id,
  });

  // Military recruitment mutation
  const recruitMutation = useMutation({
    mutationFn: async ({ unitType, quantity }) => {
      const response = await fetch("/api/game/military/recruit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionData.session.id,
          unitType,
          quantity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to recruit units");
      }
      return response.json();
    },
    onSuccess: (data) => {
      Alert.alert("Success! 🎖️", data.message);
      queryClient.invalidateQueries(["gameSession"]);
      queryClient.invalidateQueries(["militaryRecruitment"]);
    },
    onError: (error) => {
      Alert.alert("Failed", error.message);
    },
  });

  const handleRecruit = (unit, quantity) => {
    const totalCost = unit.cost * quantity;

    Alert.alert(
      "Recruit Military",
      `Recruit ${quantity} ${unit.name} for $${totalCost.toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Recruit",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Map frontend unit IDs to backend unit types
            let unitType = unit.id;
            if (unit.id === "INFANTRY") unitType = "INFANTRY";
            else if (unit.id === "TANKS") unitType = "TANKS";
            else if (unit.id === "AIR_FORCE") unitType = "AIR_FORCE";
            else if (unit.id === "NAVY") unitType = "NAVY";

            recruitMutation.mutate({ unitType, quantity });
          },
        },
      ],
    );
  };

  if (!sessionData?.session) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  const military = sessionData.session.military || {};

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* Background gradient */}
      <LinearGradient
        colors={[
          "rgba(59, 130, 246, 0.4)",
          "rgba(147, 51, 234, 0.6)",
          "rgba(239, 68, 68, 0.3)",
          "#000",
        ]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 8,
              padding: 8,
              marginRight: 16,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text
            style={{
              color: "#FFF",
              fontSize: 28,
              fontWeight: "bold",
              flex: 1,
            }}
          >
            🛡️ Military
          </Text>
        </View>

        <Text
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 16,
          }}
        >
          Build and manage your armed forces
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Money */}
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            💰 Military Budget
          </Text>
          <Text style={{ color: "#3B82F6", fontSize: 24, fontWeight: "bold" }}>
            ${sessionData.session.money?.toLocaleString() || "0"}
          </Text>
        </View>

        {/* Military Stats */}
        <Text
          style={{
            color: "#FFF",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          ⚔️ Current Forces
        </Text>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <MilitaryStatCard
            title="Total Strength"
            value={military.total_strength}
            icon="flash"
            color="#FF9500"
          />
          <MilitaryStatCard
            title="Total Units"
            value={
              (military.infantry || 0) +
              (military.tanks || 0) +
              (military.air_force || 0) +
              (military.navy || 0)
            }
            icon="people"
            color="#9945FF"
          />
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <MilitaryStatCard
            title="Infantry"
            value={military.infantry}
            icon="person"
            color="#8CA8A4"
          />
          <MilitaryStatCard
            title="Tanks"
            value={military.tanks}
            icon="car"
            color="#D6F01F"
          />
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <MilitaryStatCard
            title="Air Force"
            value={military.air_force}
            icon="airplane"
            color="#3B82F6"
          />
          <MilitaryStatCard
            title="Navy"
            value={military.navy}
            icon="boat"
            color="#10B981"
          />
        </View>

        {/* Recruitment */}
        <Text
          style={{
            color: "#FFF",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          🎖️ Recruit Units
        </Text>

        {isLoading ? (
          <Text style={{ color: "#FFF", textAlign: "center", marginTop: 20 }}>
            Loading recruitment options...
          </Text>
        ) : (
          militaryData?.availableUnits?.map((unit) => (
            <MilitaryUnitCard
              key={unit.id}
              unit={unit}
              onRecruit={handleRecruit}
              playerMoney={sessionData.session.money}
              currentCount={military[unit.id.toLowerCase()]}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
