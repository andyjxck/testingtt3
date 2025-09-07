import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

function CountryCard({ country, isSelected, onSelect }) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.selectionAsync();
        onSelect(country);
      }}
      style={{
        backgroundColor: isSelected
          ? "rgba(214, 240, 31, 0.2)"
          : "rgba(26, 26, 26, 0.8)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: isSelected ? "#D6F01F" : "rgba(255, 255, 255, 0.1)",
        width: (screenWidth - 60) / 2,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 40, marginBottom: 8 }}>
          {country.flag_emoji}
        </Text>
        <Text
          style={{
            color: "#FFF",
            fontSize: 16,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {country.name}
        </Text>
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 12,
            textAlign: "center",
            lineHeight: 16,
          }}
        >
          {country.description}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="trending-up" size={14} color="#8CA8A4" />
          <Text style={{ color: "#8CA8A4", fontSize: 12, marginLeft: 4 }}>
            Economy: {(country.economy_bonus * 100 - 100).toFixed(0)}%
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="shield" size={14} color="#9945FF" />
          <Text style={{ color: "#9945FF", fontSize: 12, marginLeft: 4 }}>
            Military: {(country.military_bonus * 100 - 100).toFixed(0)}%
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="heart" size={14} color="#FF9500" />
          <Text style={{ color: "#FF9500", fontSize: 12, marginLeft: 4 }}>
            Stability: {(country.stability_bonus * 100 - 100).toFixed(0)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SelectCountryScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Fetch countries
  const { data: countriesData, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await fetch("/api/game/countries");
      if (!response.ok) throw new Error("Failed to fetch countries");
      return response.json();
    },
  });

  // Create game session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (countryId) => {
      const response = await fetch("/api/game/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryId }),
      });

      if (!response.ok) throw new Error("Failed to create session");
      return response.json();
    },
    onSuccess: () => {
      router.replace("/game");
    },
  });

  const handleStartGame = () => {
    if (!selectedCountry) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createSessionMutation.mutate(selectedCountry.id);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 18 }}>
          Loading countries...
        </Text>
      </View>
    );
  }

  const countries = countriesData?.countries || [];

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
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFF",
            fontSize: 32,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Tap Tap 3: Nations
        </Text>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Choose your nation to rule
        </Text>
      </View>

      {/* Countries grid */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {countries.map((country) => (
            <CountryCard
              key={country.id}
              country={country}
              isSelected={selectedCountry?.id === country.id}
              onSelect={setSelectedCountry}
            />
          ))}
        </View>
      </ScrollView>

      {/* Start game button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: 20,
        }}
      >
        <TouchableOpacity
          disabled={!selectedCountry || createSessionMutation.isPending}
          onPress={handleStartGame}
          style={{
            backgroundColor: selectedCountry
              ? "#D6F01F"
              : "rgba(255, 255, 255, 0.2)",
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
            opacity: selectedCountry ? 1 : 0.5,
          }}
        >
          <Text
            style={{
              color: selectedCountry ? "#000" : "#FFF",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            {createSessionMutation.isPending ? "Starting..." : "Start Ruling"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
