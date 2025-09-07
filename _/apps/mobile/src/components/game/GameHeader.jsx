import React, { useState } from "react";
import { View, Text, Pressable, Modal, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Star, Crown, TrendingUp, Users, Calendar, DollarSign, X } from "lucide-react-native";
import { n } from "../../utils/game/helpers";

const NavButton = ({ href, icon, color, text }) => {
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
          result[3],
          16
        )}`
      : null;
  };

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        router.push(href);
      }}
      style={{
        backgroundColor: `rgba(${hexToRgb(color)}, 0.2)`,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: color,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Ionicons name={icon} size={16} color={color} />
      <Text
        style={{
          color: color,
          fontSize: 12,
          fontWeight: "600",
          marginLeft: 4,
        }}
      >
        {text}
      </Text>
    </Pressable>
  );
};

function PrestigeModal({ visible, onClose, session, onConfirmReset }) {
  const insets = useSafeAreaInsets();
  
  // Get prestige data to show token preview
  const { data: prestigeData } = useQuery({
    queryKey: ['prestige-preview', session?.id],
    queryFn: async () => {
      if (!session?.id) return null;
      const response = await fetch(
        `/api/game/prestige?sessionId=${session.id}&playerId=${session.player_id}`
      );
      if (!response.ok) throw new Error('Failed to fetch prestige data');
      return response.json();
    },
    enabled: !!session?.id && visible,
  });

  const tokensToEarn = prestigeData?.tokensWouldEarn || 0;
  const currentTokens = prestigeData?.currentTokens || 0;
  const progress = prestigeData?.currentProgress || {};

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            borderWidth: 1,
            borderColor: 'rgba(251, 191, 36, 0.3)',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Crown size={28} color="#F59E0B" />
            <Text
              style={{
                color: '#FFF',
                fontSize: 24,
                fontWeight: 'bold',
                marginLeft: 12,
                flex: 1,
              }}
            >
              Prestige Reset
            </Text>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: 8,
              }}
            >
              <X size={20} color="#FFF" />
            </Pressable>
          </View>

          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 16,
              marginBottom: 24,
              lineHeight: 22,
            }}
          >
            Reset your nation and earn diplomacy tokens for permanent upgrades. All progress will be lost, but you'll gain powerful bonuses for future runs.
          </Text>

          {/* Token Earnings Breakdown */}
          <View
            style={{
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: 'rgba(251, 191, 36, 0.2)',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Star size={24} color="#F59E0B" />
              <Text
                style={{
                  color: '#F59E0B',
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginLeft: 8,
                }}
              >
                {tokensToEarn} Diplomacy Tokens
              </Text>
            </View>

            <Text
              style={{
                color: 'rgba(251, 191, 36, 0.8)',
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              Earned from your achievements:
            </Text>

            {/* Breakdown */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <DollarSign size={16} color="rgba(251, 191, 36, 0.8)" />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: 6 }}>
                    Money: ${n(progress.money || 0)}
                  </Text>
                </View>
                <Text style={{ color: '#F59E0B', fontWeight: '600' }}>
                  +{Math.floor((progress.money || 0) / 100000)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TrendingUp size={16} color="rgba(251, 191, 36, 0.8)" />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: 6 }}>
                    Taps: {n(progress.totalTaps || 0)}
                  </Text>
                </View>
                <Text style={{ color: '#F59E0B', fontWeight: '600' }}>
                  +{Math.floor((progress.totalTaps || 0) / 5000)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Calendar size={16} color="rgba(251, 191, 36, 0.8)" />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: 6 }}>
                    Years: {progress.currentYear || 1}
                  </Text>
                </View>
                <Text style={{ color: '#F59E0B', fontWeight: '600' }}>
                  +{Math.floor((progress.currentYear || 1) / 10)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Users size={16} color="rgba(251, 191, 36, 0.8)" />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: 6 }}>
                    Popularity: {Math.round(progress.avgPopularity || 0)}%
                  </Text>
                </View>
                <Text style={{ color: '#F59E0B', fontWeight: '600' }}>
                  +{(progress.avgPopularity || 0) > 85 ? 15 : (progress.avgPopularity || 0) > 70 ? 5 : 0}
                </Text>
              </View>
            </View>

            {/* Current tokens */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: 'rgba(251, 191, 36, 0.3)',
                marginTop: 16,
                paddingTop: 16,
              }}
            >
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
                Current tokens: {currentTokens} → New total: {currentTokens + tokensToEarn}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: 'rgba(107, 114, 128, 0.3)',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(107, 114, 128, 0.5)',
              }}
            >
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirmReset}
              style={{
                flex: 1,
                backgroundColor: 'rgba(251, 191, 36, 0.8)',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#F59E0B',
              }}
            >
              <Text
                style={{
                  color: '#000',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                Reset for Prestige
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function GameHeader({ session, onNewGame }) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);

  // Prestige reset mutation
  const prestigeResetMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/game/prestige', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          playerId: session.player_id,
          action: 'reset',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setShowPrestigeModal(false);
      Alert.alert(
        'Prestige Reset Complete! 👑',
        data.message,
        [
          {
            text: 'Visit Prestige Shop',
            onPress: () => router.replace('/game/prestige-shop'),
          },
          {
            text: 'Continue Playing',
            onPress: () => queryClient.invalidateQueries(['gameSession']),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Failed', error.message);
    },
  });

  const handlePrestigeReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    prestigeResetMutation.mutate();
  };

  return (
    <View
      style={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: "center",
      }}
      pointerEvents="box-none"
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 8,
        }}
      >
        <Pressable
          onPress={() => setShowPrestigeModal(true)}
          style={{
            backgroundColor: "rgba(251, 191, 36, 0.2)",
            borderRadius: 8,
            padding: 8,
            borderWidth: 1,
            borderColor: "#F59E0B",
          }}
        >
          <Crown size={24} color="#F59E0B" />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              color: "#FFF",
              fontSize: 28,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {session.country_name || "Your Nation"} {session.flag_emoji}
          </Text>
        </View>
        <Pressable
          onPress={onNewGame}
          style={{
            backgroundColor: "rgba(255, 92, 92, 0.2)",
            borderRadius: 8,
            padding: 8,
            borderWidth: 1,
            borderColor: "#FF5C5C",
          }}
        >
          <Ionicons name="refresh" size={24} color="#FF5C5C" />
        </Pressable>
      </View>
      <Text
        style={{
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: 16,
          marginTop: 4,
        }}
      >
        Year {n(session.current_year, 1)}
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        <NavButton
          href="/game/military"
          icon="shield"
          color="#9945FF"
          text="Military"
        />
        <NavButton
          href="/game/diplomacy"
          icon="people"
          color="#8CA8A4"
          text="Diplomacy"
        />
        <NavButton
          href="/game/laws"
          icon="document-text"
          color="#D6F01F"
          text="Laws"
        />
      </View>

      <PrestigeModal
        visible={showPrestigeModal}
        onClose={() => setShowPrestigeModal(false)}
        session={session}
        onConfirmReset={handlePrestigeReset}
      />
    </View>
  );
}