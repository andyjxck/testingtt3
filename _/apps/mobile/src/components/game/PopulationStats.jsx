import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PopulationCard } from "./PopulationCard";
import { n } from "../../utils/game/helpers";

export function PopulationStats({ population }) {
  const pop = population || {};

  const totalPopularity = Math.round(
    (n(pop.working_class_popularity, 50) +
      n(pop.high_class_popularity, 50) +
      n(pop.poverty_class_popularity, 50) +
      n(pop.middle_class_popularity, 50)) /
      4
  );

  return (
    <View
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        shadowColor: "#9333EA",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "20%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        pointerEvents="none"
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>
          👥 Population Support
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color: totalPopularity >= 50 ? "#10B981" : "#EF4444",
              fontSize: 18,
              fontWeight: "bold",
              textShadowColor:
                totalPopularity >= 50
                  ? "rgba(16, 185, 129, 0.5)"
                  : "rgba(239, 68, 68, 0.5)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {totalPopularity}%
          </Text>
          <Ionicons
            name={totalPopularity >= 50 ? "trending-up" : "trending-down"}
            size={18}
            color={totalPopularity >= 50 ? "#10B981" : "#EF4444"}
            style={{ marginLeft: 6 }}
          />
        </View>
      </View>

      <PopulationCard
        title="Working Class"
        popularity={pop.working_class_popularity}
        color="#8CA8A4"
        icon="construct"
      />
      <PopulationCard
        title="Middle Class"
        popularity={pop.middle_class_popularity}
        color="#D6F01F"
        icon="home"
      />
      <PopulationCard
        title="High Class"
        popularity={pop.high_class_popularity}
        color="#9945FF"
        icon="diamond"
      />
      <PopulationCard
        title="Poverty Class"
        popularity={pop.poverty_class_popularity}
        color="#FF9500"
        icon="heart"
      />
      <PopulationCard
        title="Rebels"
        popularity={pop.rebels_popularity}
        color="#FF5C5C"
        icon="shield"
      />
    </View>
  );
}
