import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';

/* ------------------ helpers: numeric coercion ------------------ */
const n = (v, d = 0) => {
  const num = typeof v === "string" ? Number(v.replace(/,/g, "")) : Number(v);
  return Number.isFinite(num) ? num : d;
};

function DiplomacyCard({ action, onFormAlliance, playerMoney }) {
  const canAfford = playerMoney >= action.cost;

  return (
    <View
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: canAfford
          ? 'rgba(140, 168, 164, 0.3)'
          : 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#FFF',
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 4,
            }}
          >
            {action.name}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {action.description}
          </Text>
        </View>
      </View>

      {/* Benefits */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
          }}
        >
          Benefits:
        </Text>
        <View style={{ gap: 6 }}>
          {action.incomeBonus > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text style={{ color: '#10B981', fontSize: 12, marginLeft: 6 }}>
                +{(action.incomeBonus * 100).toFixed(0)}% Income
              </Text>
            </View>
          )}
          {action.militaryBonus > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="shield" size={16} color="#9945FF" />
              <Text style={{ color: '#9945FF', fontSize: 12, marginLeft: 6 }}>
                +{(action.militaryBonus * 100).toFixed(0)}% Military Strength
              </Text>
            </View>
          )}
          {action.popularityBonus > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="heart" size={16} color="#FF9500" />
              <Text style={{ color: '#FF9500', fontSize: 12, marginLeft: 6 }}>
                +{action.popularityBonus} Popularity
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Cost and Action */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: canAfford ? '#3B82F6' : '#EF4444',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          ${action.cost.toLocaleString()}
        </Text>

        <TouchableOpacity
          onPress={() => onFormAlliance(action)}
          disabled={!canAfford}
          style={{
            backgroundColor: canAfford
              ? 'rgba(140, 168, 164, 0.3)'
              : 'rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: canAfford ? '#8CA8A4' : 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <Text
            style={{
              color: canAfford ? '#8CA8A4' : 'rgba(255, 255, 255, 0.5)',
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            Form Alliance
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AllianceCard({ alliance }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(140, 168, 164, 0.2)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(140, 168, 164, 0.3)',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: '#FFF',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          {alliance.ally_name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="heart" size={16} color="#8CA8A4" />
          <Text
            style={{
              color: '#8CA8A4',
              fontSize: 14,
              fontWeight: '600',
              marginLeft: 4,
            }}
          >
            {alliance.relationship_level}%
          </Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="trending-up" size={14} color="#10B981" />
          <Text style={{ color: '#10B981', fontSize: 12, marginLeft: 6 }}>
            +{(alliance.income_bonus * 100).toFixed(0)}% Income Bonus
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="shield" size={14} color="#9945FF" />
          <Text style={{ color: '#9945FF', fontSize: 12, marginLeft: 6 }}>
            +{(alliance.military_bonus * 100).toFixed(0)}% Military Bonus
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="cash" size={14} color="#FF9500" />
          <Text style={{ color: '#FF9500', fontSize: 12, marginLeft: 6 }}>
            ${alliance.tribute_cost} tribute cost
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function DiplomacyScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Get current session
  const { data: sessionData } = useQuery({
    queryKey: ['gameSession'],
    queryFn: async () => {
      const response = await fetch('/api/game/session');
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },
  });

  // Get diplomacy data
  const { data: diplomacyData, isLoading } = useQuery({
    queryKey: ['diplomacy', sessionData?.session?.id],
    queryFn: async () => {
      if (!sessionData?.session?.id) return null;
      const response = await fetch(
        `/api/game/diplomacy?sessionId=${sessionData.session.id}`
      );
      if (!response.ok) throw new Error('Failed to fetch diplomacy data');
      return response.json();
    },
    enabled: !!sessionData?.session?.id,
  });

  // Form alliance mutation
  const formAllianceMutation = useMutation({
    mutationFn: async (action) => {
      const response = await fetch('/api/game/diplomacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.session.id,
          action: action.id,
          countryName: action.name,
          actionType: 'alliance',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to form alliance');
      }
      return response.json();
    },
    onSuccess: (data) => {
      Alert.alert('Success! 🤝', data.message);
      queryClient.invalidateQueries(['gameSession']);
      queryClient.invalidateQueries(['diplomacy']);
    },
    onError: (error) => {
      Alert.alert('Failed', error.message);
    },
  });

  const handleFormAlliance = (action) => {
    Alert.alert(
      'Form Alliance',
      `Form an alliance with ${action.name} for $${action.cost.toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Form Alliance',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            formAllianceMutation.mutate(action);
          },
        },
      ]
    );
  };

  if (!sessionData?.session) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#FFF', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />

      {/* Background gradient */}
      <LinearGradient
        colors={[
          'rgba(140, 168, 164, 0.4)',
          'rgba(59, 130, 246, 0.3)',
          'rgba(147, 51, 234, 0.2)',
          '#000',
        ]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
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
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: 8,
              marginRight: 16,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text
            style={{
              color: '#FFF',
              fontSize: 28,
              fontWeight: 'bold',
              flex: 1,
            }}
          >
            🤝 Diplomacy
          </Text>
        </View>

        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 16,
          }}
        >
          Form alliances and build relationships
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
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            💰 Diplomatic Budget
          </Text>
          <Text style={{ color: '#3B82F6', fontSize: 24, fontWeight: 'bold' }}>
            ${sessionData.session.money?.toLocaleString() || '0'}
          </Text>
        </View>

        {/* Current Alliances */}
        {diplomacyData?.alliances?.length > 0 && (
          <>
            <Text
              style={{
                color: '#FFF',
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 16,
              }}
            >
              🤝 Current Alliances
            </Text>

            {diplomacyData.alliances.map((alliance) => (
              <AllianceCard key={alliance.id} alliance={alliance} />
            ))}
          </>
        )}

        {/* Available Actions */}
        <Text
          style={{
            color: '#FFF',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 16,
          }}
        >
          🌍 Form New Alliances
        </Text>

        {isLoading ? (
          <Text style={{ color: '#FFF', textAlign: 'center', marginTop: 20 }}>
            Loading diplomatic options...
          </Text>
        ) : (
          diplomacyData?.availableActions?.map((action) => (
            <DiplomacyCard
              key={action.id}
              action={action}
              onFormAlliance={handleFormAlliance}
              playerMoney={sessionData.session.money}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}