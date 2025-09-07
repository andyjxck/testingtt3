import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

function LawCard({ law, onAction, actionType, disabled }) {
  const getStatusColor = () => {
    if (actionType === "available") return "#D6F01F";
    if (actionType === "pending") return "#FF9500";
    if (actionType === "active") return "#10B981";
    return "#FFF";
  };

  const getStatusText = () => {
    if (actionType === "available") return "Propose Law";
    if (actionType === "pending") return `${law.taps_remaining} taps remaining`;
    if (actionType === "active") return `Active since Year ${law.enacted_year}`;
    return "";
  };

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
        <Ionicons name="document-text" size={24} color={getStatusColor()} />
        <Text
          style={{
            color: "#FFF",
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 8,
            flex: 1,
          }}
        >
          {law.law_name || law.name}
        </Text>
        <View
          style={{
            backgroundColor: `rgba(${getStatusColor() === "#D6F01F" ? "214, 240, 31" : getStatusColor() === "#FF9500" ? "255, 149, 0" : "16, 185, 129"}, 0.2)`,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: getStatusColor(),
          }}
        >
          <Text
            style={{ color: getStatusColor(), fontSize: 12, fontWeight: "600" }}
          >
            {actionType.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text
        style={{
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: 14,
          marginBottom: 12,
          lineHeight: 20,
        }}
      >
        {law.law_description || law.description}
      </Text>

      {/* Economic Effect */}
      {law.effects?.economy && (
        <View style={{ marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Ionicons
              name={law.effects.economy > 0 ? "trending-up" : "trending-down"}
              size={16}
              color={law.effects.economy > 0 ? "#10B981" : "#EF4444"}
            />
            <Text
              style={{
                color: law.effects.economy > 0 ? "#10B981" : "#EF4444",
                fontSize: 14,
                fontWeight: "600",
                marginLeft: 6,
              }}
            >
              Economy: {law.effects.economy > 0 ? "+" : ""}
              {(law.effects.economy * 100).toFixed(0)}%
            </Text>
          </View>
        </View>
      )}

      {/* Population Effects */}
      {law.effects?.popularity &&
        Object.keys(law.effects.popularity).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              📊 Population Support Changes:
            </Text>
            <View style={{ gap: 6 }}>
              {Object.entries(law.effects.popularity).map(
                ([className, change]) => {
                  const isPositive = change > 0;
                  const displayName = className
                    .replace("_popularity", "")
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase());

                  const getIcon = (className) => {
                    if (className.includes("working_class")) return "construct";
                    if (className.includes("middle_class")) return "home";
                    if (className.includes("high_class")) return "diamond";
                    if (className.includes("poverty_class")) return "heart";
                    if (className.includes("rebels")) return "shield";
                    return "people";
                  };

                  const getColor = (className) => {
                    if (className.includes("working_class")) return "#8CA8A4";
                    if (className.includes("middle_class")) return "#D6F01F";
                    if (className.includes("high_class")) return "#9945FF";
                    if (className.includes("poverty_class")) return "#FF9500";
                    if (className.includes("rebels")) return "#FF5C5C";
                    return "#FFF";
                  };

                  return (
                    <View
                      key={className}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        <Ionicons
                          name={getIcon(className)}
                          size={14}
                          color={getColor(className)}
                        />
                        <Text
                          style={{
                            color: getColor(className),
                            fontSize: 12,
                            marginLeft: 6,
                            flex: 1,
                          }}
                        >
                          {displayName}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: isPositive ? "#10B981" : "#EF4444",
                          fontSize: 12,
                          fontWeight: "bold",
                          marginLeft: 8,
                        }}
                      >
                        {isPositive ? "+" : ""}
                        {change}%
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
          </View>
        )}

      {/* Taps Required */}
      {actionType === "available" && law.tapsRequired && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time" size={14} color="#9945FF" />
            <Text style={{ color: "#9945FF", fontSize: 12, marginLeft: 6 }}>
              {law.tapsRequired} taps to implement
            </Text>
          </View>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}>
          {getStatusText()}
        </Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {actionType === "available" && (
            <TouchableOpacity
              disabled={disabled}
              onPress={() => {
                Haptics.selectionAsync();
                onAction("propose", law);
              }}
              style={{
                backgroundColor: disabled
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(214, 240, 31, 0.2)",
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: disabled ? "rgba(255, 255, 255, 0.1)" : "#D6F01F",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  color: disabled ? "rgba(255, 255, 255, 0.5)" : "#D6F01F",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Propose
              </Text>
            </TouchableOpacity>
          )}

          {actionType === "pending" && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                onAction("cancel", law);
              }}
              style={{
                backgroundColor: "rgba(255, 92, 92, 0.2)",
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: "#FF5C5C",
              }}
            >
              <Text
                style={{ color: "#FF5C5C", fontSize: 14, fontWeight: "600" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          )}

          {actionType === "active" && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                onAction("repeal", law);
              }}
              style={{
                backgroundColor: "rgba(255, 92, 92, 0.2)",
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: "#FF5C5C",
              }}
            >
              <Text
                style={{ color: "#FF5C5C", fontSize: 14, fontWeight: "600" }}
              >
                Repeal
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function LawsScreen() {
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

  // Get laws data
  const { data: lawsData, isLoading } = useQuery({
    queryKey: ["laws", sessionData?.session?.id],
    queryFn: async () => {
      if (!sessionData?.session?.id) return null;
      const response = await fetch(
        `/api/game/laws?sessionId=${sessionData.session.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch laws data");
      return response.json();
    },
    enabled: !!sessionData?.session?.id,
  });

  // Law action mutation
  const lawActionMutation = useMutation({
    mutationFn: async ({ action, law }) => {
      const response = await fetch("/api/game/laws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionData.session.id,
          action,
          lawId: law.id,
          lawType: law.id || law.law_type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process law action");
      }
      return response.json();
    },
    onSuccess: (data) => {
      Alert.alert("Success! 📜", data.message);
      queryClient.invalidateQueries(["laws"]);
      queryClient.invalidateQueries(["gameSession"]);
    },
    onError: (error) => {
      Alert.alert("Failed", error.message);
    },
  });

  const handleLawAction = (action, law) => {
    let title = "";
    let message = "";

    if (action === "propose") {
      title = "Propose Law";
      message = `Propose ${law.name}? It will take ${law.tapsRequired} taps to implement.`;
    } else if (action === "cancel") {
      title = "Cancel Law";
      message = `Cancel ${law.law_name}? This will stop its progress.`;
    } else if (action === "repeal") {
      title = "Repeal Law";
      message = `Repeal ${law.law_name}? This will remove its effects.`;
    }

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text:
          action === "propose"
            ? "Propose"
            : action === "cancel"
              ? "Cancel Law"
              : "Repeal",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          lawActionMutation.mutate({ action, law });
        },
      },
    ]);
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
            📜 Laws & Policies
          </Text>
        </View>

        <Text
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 16,
          }}
        >
          Propose, manage, and repeal laws
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
        {isLoading ? (
          <Text style={{ color: "#FFF", textAlign: "center", marginTop: 20 }}>
            Loading laws...
          </Text>
        ) : (
          <>
            {/* Pending Laws */}
            {lawsData?.pendingLaws?.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 16,
                  }}
                >
                  ⏳ Pending Laws
                </Text>
                {lawsData.pendingLaws.map((law) => (
                  <LawCard
                    key={law.id}
                    law={law}
                    onAction={handleLawAction}
                    actionType="pending"
                  />
                ))}
              </View>
            )}

            {/* Active Laws */}
            {lawsData?.activeLaws?.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 16,
                  }}
                >
                  ✅ Active Laws
                </Text>
                {lawsData.activeLaws.map((law) => (
                  <LawCard
                    key={law.id}
                    law={law}
                    onAction={handleLawAction}
                    actionType="active"
                  />
                ))}
              </View>
            )}

            {/* Available Laws */}
            <Text
              style={{
                color: "#FFF",
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              📋 Available Laws
            </Text>

            {lawsData?.availableLaws?.length === 0 ? (
              <Text
                style={{ color: "#FFF", textAlign: "center", marginTop: 20 }}
              >
                All laws have been proposed or enacted.
              </Text>
            ) : (
              lawsData?.availableLaws?.map((law) => (
                <LawCard
                  key={law.id}
                  law={law}
                  onAction={handleLawAction}
                  actionType="available"
                  disabled={lawActionMutation.isPending}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
