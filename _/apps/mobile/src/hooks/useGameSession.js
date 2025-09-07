import { useState, useEffect, useRef } from "react";
import { Alert, Dimensions } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { n, normalizeSession } from "../utils/game/helpers";

const { width: screenWidth } = Dimensions.get("window");

export function useGameSession() {
  const queryClient = useQueryClient();
  const [floatingMoney, setFloatingMoney] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  const lastSessionRef = useRef(null);
  const pendingTaps = useRef(0);
  const tapQueue = useRef([]);
  const tapTimeout = useRef(null);

  // Simple tap feedback - just haptics, no audio
  const playTapSound = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Batch tap processing
  const processBatchedTaps = () => {
    if (pendingTaps.current > 0) {
      const tapsToProcess = pendingTaps.current;
      pendingTaps.current = 0;
      tapMutation.mutate(tapsToProcess);
    }
  };

  // Fetch game session
  const {
    data: sessionData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gameSession"],
    queryFn: async () => {
      const response = await fetch("/api/game/session");
      if (!response.ok) throw new Error("Failed to fetch session");
      const json = await response.json();
      return {
        ...json,
        session: json?.session ? normalizeSession(json.session) : null,
      };
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  // Tap mutation
  const tapMutation = useMutation({
    mutationFn: async (taps) => {
      if (!gameSession?.id) throw new Error("No active session");
      const response = await fetch("/api/game/tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: gameSession.id, taps }),
      });
      if (!response.ok) throw new Error("Failed to process tap");
      const json = await response.json();
      return {
        ...json,
        session: json?.session ? normalizeSession(json.session) : null,
      };
    },
    onSuccess: (data) => {
      if (data?.session) {
        // Always trust the server's authoritative data, especially for pending laws
        setGameSession((prev) => ({
          ...(prev || {}),
          ...data.session,
          // For real-time law tracking, always use server money if significantly different
          money:
            Math.abs((prev?.money || 0) - data.session.money) > 100
              ? data.session.money
              : Math.max(prev?.money || 0, data.session.money),
          // Always use server data for these critical fields
          pendingLaws: data.session.pendingLaws || [],
          population: data.session.population,
          tap_value: data.session.tap_value,
          total_taps: data.session.total_taps,
          current_year: data.session.current_year,
        }));
      }

      // Handle donations with floating money effect
      if (data?.donationReceived) {
        const randomX = Math.random() * (screenWidth - 80) + 40;
        const randomY = Math.random() * 100 + 50;

        setFloatingMoney((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random() + 1000, // Different ID from tap money
            value: `+$${data.donationReceived.amount.toLocaleString()}💰`,
            x: randomX,
            y: randomY,
            isDonation: true,
          },
        ]);

        // Update money with donation amount
        setGameSession((prev) =>
          prev
            ? {
                ...prev,
                money: (prev.money || 0) + data.donationReceived.amount,
              }
            : prev,
        );

        // Show dropdown notification instead of alert
        setCurrentNotification({
          id: Date.now(),
          type: "donation",
          title: data.donationReceived.title,
          description: data.donationReceived.description,
          amount: data.donationReceived.amount,
        });
      }

      // Handle enacted laws as dropdown notifications
      if (data?.enactedLaws && data.enactedLaws.length > 0) {
        data.enactedLaws.forEach((lawName, index) => {
          setTimeout(() => {
            setCurrentNotification({
              id: Date.now() + index,
              type: "law",
              title: "Law Enacted",
              description: `${lawName} is now in effect!`,
            });
          }, index * 1000); // Stagger multiple law notifications
        });
      }

      if (data?.eventTriggered) setCurrentEvent(data.eventTriggered);

      // Process any remaining pending taps if they accumulated during the request
      if (pendingTaps.current > 0) {
        clearTimeout(tapTimeout.current);
        tapTimeout.current = setTimeout(processBatchedTaps, 100);
      }

      queryClient.invalidateQueries({ queryKey: ["gameSession"] });
    },
    onError: () => {
      setGameSession(lastSessionRef.current);
    },
  });

  // Event/Law mutation
  const eventMutation = useMutation({
    mutationFn: async ({ action, event }) => {
      if (!gameSession?.id) throw new Error("No active session");
      const response = await fetch("/api/game/law", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: gameSession.id,
          lawName: event.title,
          lawDescription: event.description,
          effects: event.effects,
          action: action === "accept" ? "pass" : "reject",
        }),
      });
      if (!response.ok) throw new Error("Failed to process event");
      const json = await response.json();
      return {
        ...json,
        session: json?.session ? normalizeSession(json.session) : null,
      };
    },
    onSuccess: () => {
      setCurrentEvent(null);
      queryClient.invalidateQueries({ queryKey: ["gameSession"] });
    },
  });

  // Election mutation
  const electionMutation = useMutation({
    mutationFn: async () => {
      if (!gameSession?.id) throw new Error("No active session");
      const response = await fetch("/api/game/election", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: gameSession.id }),
      });
      if (!response.ok) throw new Error("Failed to process election");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.won) {
        Alert.alert(
          "Election Victory! 🎉",
          data.message +
            "\n\n📊 Vote Breakdown:\n" +
            `Working Class: ${data.voteBreakdown?.working_class?.votes || 0}/100\n` +
            `Middle Class: ${data.voteBreakdown?.middle_class?.votes || 0}/100\n` +
            `High Class: ${data.voteBreakdown?.high_class?.votes || 0}/100\n` +
            `Poverty Class: ${data.voteBreakdown?.poverty_class?.votes || 0}/100\n` +
            `Anti-Rebel: ${data.voteBreakdown?.rebels?.votes || 0}/100\n\n` +
            `Victory Margin: +${data.victoryMargin || 0} votes\n` +
            `Leadership Bonus: ${((data.bonusMultiplier - 1) * 100).toFixed(1)}%`,
          [
            {
              text: "Continue Ruling",
              onPress: () =>
                queryClient.invalidateQueries({ queryKey: ["gameSession"] }),
            },
          ],
        );
      } else {
        Alert.alert(
          "Election Defeat 💔",
          data.message +
            "\n\n📊 Vote Breakdown:\n" +
            `Working Class: ${data.voteBreakdown?.working_class?.votes || 0}/100\n` +
            `Middle Class: ${data.voteBreakdown?.middle_class?.votes || 0}/100\n` +
            `High Class: ${data.voteBreakdown?.high_class?.votes || 0}/100\n` +
            `Poverty Class: ${data.voteBreakdown?.poverty_class?.votes || 0}/100\n` +
            `Anti-Rebel: ${data.voteBreakdown?.rebels?.votes || 0}/100\n\n` +
            "Your government has fallen. The people have spoken.",
          [
            {
              text: "Start New Nation",
              onPress: () => router.replace("/game/select-country"),
            },
            { text: "View Final Stats", style: "cancel" },
          ],
        );
      }
    },
  });

  // Apply session data from query to local state
  useEffect(() => {
    if (sessionData?.session) {
      setGameSession(normalizeSession(sessionData.session));
    } else if (sessionData && !sessionData.session) {
      router.replace("/game/select-country");
    }
  }, [sessionData]);

  const handleTap = () => {
    if (!gameSession || currentEvent) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTapSound();

    const randomX = Math.random() * (screenWidth - 80) + 40;
    const randomY = Math.random() * 100 + 100;

    // Use the server-calculated tap value that includes all bonuses
    const actualTapValue = gameSession.tap_value || 1;

    // Add floating money animation
    setFloatingMoney((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        value: actualTapValue,
        x: randomX,
        y: randomY,
      },
    ]);

    // Optimistically update local state
    setGameSession((prev) => {
      if (!prev) return prev;
      lastSessionRef.current = prev;
      return {
        ...prev,
        money: n(prev.money, 0) + actualTapValue,
        total_taps: n(prev.total_taps, 0) + 1,
      };
    });

    // Add to pending taps for batching
    pendingTaps.current += 1;

    // Clear existing timeout and set new one
    clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(processBatchedTaps, 50); // Much shorter timeout for real-time feel
  };

  const removeFloatingMoney = (id) => {
    setFloatingMoney((prev) => prev.filter((item) => item.id !== id));
  };

  const dismissNotification = () => {
    setCurrentNotification(null);
  };

  const handleEventAction = (action) => {
    if (!currentEvent) return;
    eventMutation.mutate({ action, event: currentEvent });
  };

  const handleNewGame = () => {
    Alert.alert(
      "Start New Game?",
      "Are you sure you want to abandon your current nation and start over? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Over",
          style: "destructive",
          onPress: () => router.replace("/game/select-country"),
        },
      ],
    );
  };

  const handleElection = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    electionMutation.mutate();
  };

  return {
    isLoading: isLoading || !gameSession,
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
  };
}
