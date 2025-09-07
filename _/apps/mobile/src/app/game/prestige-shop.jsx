import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Star, Crown, DollarSign, TrendingUp, Clock, Zap, Users, X } from 'lucide-react-native';

function UpgradeCard({ upgrade, onPurchase, playerTokens, isOwned }) {
  const canAfford = playerTokens >= upgrade.cost && !isOwned;

  const getIcon = () => {
    switch (upgrade.category) {
      case 'income':
        return <TrendingUp size={24} color={canAfford ? '#10B981' : '#6B7280'} />;
      case 'starting':
        return <DollarSign size={24} color={canAfford ? '#F59E0B' : '#6B7280'} />;
      case 'speed':
        return <Clock size={24} color={canAfford ? '#8B5CF6' : '#6B7280'} />;
      case 'special':
        return <Zap size={24} color={canAfford ? '#EF4444' : '#6B7280'} />;
      default:
        return <Star size={24} color={canAfford ? '#3B82F6' : '#6B7280'} />;
    }
  };

  return (
    <View
      style={{
        backgroundColor: isOwned 
          ? 'rgba(16, 185, 129, 0.2)' 
          : canAfford 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(107, 114, 128, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isOwned 
          ? 'rgba(16, 185, 129, 0.4)' 
          : canAfford 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(107, 114, 128, 0.2)',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View style={{ marginRight: 12 }}>
          {getIcon()}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: isOwned ? '#10B981' : '#FFF',
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 4,
            }}
          >
            {upgrade.name}
          </Text>
          <Text
            style={{
              color: isOwned ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255, 255, 255, 0.7)',
              fontSize: 14,
            }}
          >
            {upgrade.description}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Star size={16} color="#F59E0B" />
          <Text
            style={{
              color: '#F59E0B',
              fontSize: 16,
              fontWeight: 'bold',
              marginLeft: 4,
            }}
          >
            {upgrade.cost} tokens
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onPurchase(upgrade)}
          disabled={!canAfford}
          style={{
            backgroundColor: isOwned 
              ? 'rgba(16, 185, 129, 0.3)' 
              : canAfford 
                ? 'rgba(59, 130, 246, 0.8)' 
                : 'rgba(107, 114, 128, 0.3)',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: isOwned 
              ? 'rgba(16, 185, 129, 0.5)' 
              : canAfford 
                ? '#3B82F6' 
                : 'rgba(107, 114, 128, 0.5)',
          }}
        >
          <Text
            style={{
              color: isOwned 
                ? '#10B981' 
                : canAfford 
                  ? '#FFF' 
                  : 'rgba(255, 255, 255, 0.5)',
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            {isOwned ? 'Owned' : canAfford ? 'Purchase' : 'Cannot Afford'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PrestigeShopScreen() {
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

  // Get prestige data
  const { data: prestigeData, isLoading } = useQuery({
    queryKey: ['prestige', sessionData?.session?.id],
    queryFn: async () => {
      if (!sessionData?.session?.id) return null;
      const response = await fetch(
        `/api/game/prestige?sessionId=${sessionData.session.id}&playerId=${sessionData.session.player_id}`
      );
      if (!response.ok) throw new Error('Failed to fetch prestige data');
      return response.json();
    },
    enabled: !!sessionData?.session?.id,
  });

  // Purchase upgrade mutation
  const purchaseMutation = useMutation({
    mutationFn: async (upgradeType) => {
      const response = await fetch('/api/game/prestige', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.session.id,
          playerId: sessionData.session.player_id,
          action: 'purchase',
          upgradeType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to purchase upgrade');
      }
      return response.json();
    },
    onSuccess: (data) => {
      Alert.alert('Success! ⭐', data.message);
      queryClient.invalidateQueries(['prestige']);
    },
    onError: (error) => {
      Alert.alert('Failed', error.message);
    },
  });

  const availableUpgrades = [
    {
      id: 'income_multiplier_1',
      name: 'Income Boost I',
      description: '+10% income from all sources',
      cost: 5,
      category: 'income',
    },
    {
      id: 'income_multiplier_2',
      name: 'Income Boost II',
      description: '+25% income from all sources',
      cost: 15,
      category: 'income',
    },
    {
      id: 'income_multiplier_3',
      name: 'Income Boost III',
      description: '+50% income from all sources',
      cost: 35,
      category: 'income',
    },
    {
      id: 'income_multiplier_4',
      name: 'Income Boost IV',
      description: '+100% income from all sources',
      cost: 75,
      category: 'income',
    },
    {
      id: 'starting_money_1',
      name: 'Rich Start I',
      description: 'Start each reset with +$25,000',
      cost: 8,
      category: 'starting',
    },
    {
      id: 'starting_money_2',
      name: 'Rich Start II',
      description: 'Start each reset with +$100,000',
      cost: 20,
      category: 'starting',
    },
    {
      id: 'starting_money_3',
      name: 'Rich Start III',
      description: 'Start each reset with +$500,000',
      cost: 50,
      category: 'starting',
    },
    {
      id: 'faster_laws',
      name: 'Legislative Speed',
      description: '25% fewer taps required for laws',
      cost: 12,
      category: 'speed',
    },
    {
      id: 'better_events',
      name: 'Fortune\'s Favor',
      description: '20% better random event outcomes',
      cost: 18,
      category: 'special',
    },
    {
      id: 'diplomatic_master',
      name: 'Diplomatic Master',
      description: '30% cheaper alliance costs',
      cost: 30,
      category: 'special',
    },
  ];

  const handlePurchase = (upgrade) => {
    Alert.alert(
      'Purchase Upgrade',
      `Purchase ${upgrade.name} for ${upgrade.cost} diplomacy tokens?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            purchaseMutation.mutate(upgrade.id);
          },
        },
      ]
    );
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    router.replace('/game');
  };

  if (!sessionData?.session || isLoading) {
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

  const ownedUpgrades = prestigeData?.permanentUpgrades?.map(u => u.upgrade_type) || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />

      {/* Background gradient */}
      <LinearGradient
        colors={[
          'rgba(251, 191, 36, 0.4)',
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
          <Crown size={32} color="#F59E0B" />
          <Text
            style={{
              color: '#FFF',
              fontSize: 28,
              fontWeight: 'bold',
              marginLeft: 12,
              flex: 1,
            }}
          >
            Prestige Shop
          </Text>

          <TouchableOpacity
            onPress={handleSkip}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: 8,
            }}
          >
            <X size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 16,
            marginBottom: 16,
          }}
        >
          Spend diplomacy tokens on permanent upgrades
        </Text>

        {/* Token Display */}
        <View
          style={{
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(251, 191, 36, 0.3)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Star size={24} color="#F59E0B" />
            <Text
              style={{
                color: '#F59E0B',
                fontSize: 20,
                fontWeight: 'bold',
                marginLeft: 8,
              }}
            >
              {prestigeData?.currentTokens || 0} Diplomacy Tokens
            </Text>
          </View>
          <Text
            style={{
              color: 'rgba(251, 191, 36, 0.8)',
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Earned from your successful reign
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Income Upgrades */}
        <Text
          style={{
            color: '#FFF',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 16,
          }}
        >
          💰 Income Boosts
        </Text>

        {availableUpgrades
          .filter(u => u.category === 'income')
          .map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              onPurchase={handlePurchase}
              playerTokens={prestigeData?.currentTokens || 0}
              isOwned={ownedUpgrades.includes(upgrade.id)}
            />
          ))}

        {/* Starting Bonuses */}
        <Text
          style={{
            color: '#FFF',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 16,
            marginTop: 20,
          }}
        >
          🚀 Starting Bonuses
        </Text>

        {availableUpgrades
          .filter(u => u.category === 'starting')
          .map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              onPurchase={handlePurchase}
              playerTokens={prestigeData?.currentTokens || 0}
              isOwned={ownedUpgrades.includes(upgrade.id)}
            />
          ))}

        {/* Special Upgrades */}
        <Text
          style={{
            color: '#FFF',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 16,
            marginTop: 20,
          }}
        >
        ⚡ Special Abilities
        </Text>

        {availableUpgrades
          .filter(u => u.category === 'speed' || u.category === 'special')
          .map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              onPurchase={handlePurchase}
              playerTokens={prestigeData?.currentTokens || 0}
              isOwned={ownedUpgrades.includes(upgrade.id)}
            />
          ))}

        {/* Skip Button */}
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 16,
            padding: 16,
            marginTop: 20,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#FFF',
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            Continue to Game
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}