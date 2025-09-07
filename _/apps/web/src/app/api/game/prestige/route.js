import sql from "@/app/api/utils/sql";

// Calculate diplomacy tokens earned based on progress
function calculateTokensEarned(session, population, military) {
  let tokens = 0;
  
  // Base tokens from money (1 token per 100k money)
  tokens += Math.floor(session.money / 100000);
  
  // Tokens from total taps (1 token per 5000 taps)
  tokens += Math.floor(session.total_taps / 5000);
  
  // Tokens from years ruled (1 token per 10 years)
  tokens += Math.floor(session.current_year / 10);
  
  // Bonus tokens for high popularity (average > 70)
  if (population) {
    const avgPopularity = (
      (population.working_class_popularity || 0) +
      (population.middle_class_popularity || 0) +
      (population.high_class_popularity || 0) +
      (population.poverty_class_popularity || 0)
    ) / 4;
    
    if (avgPopularity > 70) tokens += 5;
    if (avgPopularity > 85) tokens += 10;
  }
  
  // Bonus tokens for strong military
  if (military && military.total_strength > 500) {
    tokens += Math.floor(military.total_strength / 200);
  }
  
  // Minimum 1 token, maximum 50 tokens per reset
  return Math.max(1, Math.min(50, tokens));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const playerId = searchParams.get('playerId');

    if (!sessionId || !playerId) {
      return Response.json(
        { error: 'Session ID and Player ID required' },
        { status: 400 }
      );
    }

    // Get current session data
    const [session] = await sql`
      SELECT * FROM game_sessions WHERE id = ${sessionId}
    `;

    const [population] = await sql`
      SELECT * FROM population_classes WHERE session_id = ${sessionId}
    `;

    const [military] = await sql`
      SELECT * FROM military WHERE session_id = ${sessionId}
    `;

    // Get current prestige data
    let [prestige] = await sql`
      SELECT * FROM prestige WHERE session_id = ${sessionId}
    `;

    // Get permanent upgrades
    const permanentUpgrades = await sql`
      SELECT * FROM permanent_upgrades WHERE player_id = ${playerId}
    `;

    const tokensWouldEarn = calculateTokensEarned(session, population, military);

    return Response.json({
      currentProgress: {
        money: session.money,
        totalTaps: session.total_taps,
        currentYear: session.current_year,
        avgPopularity: population ? (
          (population.working_class_popularity || 0) +
          (population.middle_class_popularity || 0) +
          (population.high_class_popularity || 0) +
          (population.poverty_class_popularity || 0)
        ) / 4 : 0,
        militaryStrength: military?.total_strength || 0,
      },
      tokensWouldEarn,
      currentTokens: prestige?.diplomacy_tokens || 0,
      totalResets: prestige?.total_resets || 0,
      permanentUpgrades,
    });
  } catch (error) {
    console.error('Error fetching prestige data:', error);
    return Response.json(
      { error: 'Failed to fetch prestige data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { sessionId, playerId, action, upgradeType } = await request.json();

    if (!sessionId || !playerId || !action) {
      return Response.json(
        { error: 'Session ID, Player ID, and action required' },
        { status: 400 }
      );
    }

    if (action === 'reset') {
      // Get current session data for token calculation
      const [session] = await sql`
        SELECT * FROM game_sessions WHERE id = ${sessionId}
      `;

      const [population] = await sql`
        SELECT * FROM population_classes WHERE session_id = ${sessionId}
      `;

      const [military] = await sql`
        SELECT * FROM military WHERE session_id = ${sessionId}
      `;

      // Calculate tokens earned
      const tokensEarned = calculateTokensEarned(session, population, military);

      // Get or create prestige record
      let [prestige] = await sql`
        SELECT * FROM prestige WHERE session_id = ${sessionId}
      `;

      if (!prestige) {
        await sql`
          INSERT INTO prestige (session_id, diplomacy_tokens, total_resets, lifetime_money, lifetime_taps)
          VALUES (${sessionId}, ${tokensEarned}, 1, ${session.money}, ${session.total_taps})
        `;
      } else {
        await sql`
          UPDATE prestige 
          SET 
            diplomacy_tokens = diplomacy_tokens + ${tokensEarned},
            total_resets = total_resets + 1,
            lifetime_money = lifetime_money + ${session.money},
            lifetime_taps = lifetime_taps + ${session.total_taps}
          WHERE session_id = ${sessionId}
        `;
      }

      // Reset all game data but keep prestige
      await sql`
        UPDATE game_sessions 
        SET 
          money = 1000,
          total_taps = 0,
          current_year = 1,
          tap_value = 1
        WHERE id = ${sessionId}
      `;

      // Reset population to defaults
      await sql`
        UPDATE population_classes 
        SET 
          rebels_popularity = 20,
          working_class_popularity = 60,
          high_class_popularity = 70,
          poverty_class_popularity = 40,
          middle_class_popularity = 55
        WHERE session_id = ${sessionId}
      `;

      // Reset military
      await sql`
        UPDATE military 
        SET 
          infantry = 0,
          tanks = 0,
          air_force = 0,
          navy = 0,
          total_strength = 0
        WHERE session_id = ${sessionId}
      `;

      // Clear active laws, pending laws, and non-permanent alliances
      await sql`DELETE FROM active_laws WHERE session_id = ${sessionId}`;
      await sql`DELETE FROM pending_laws WHERE session_id = ${sessionId}`;
      await sql`DELETE FROM alliances WHERE session_id = ${sessionId}`;
      await sql`DELETE FROM territories WHERE session_id = ${sessionId}`;
      await sql`DELETE FROM elections WHERE session_id = ${sessionId}`;

      return Response.json({
        success: true,
        message: `Prestige reset complete! Earned ${tokensEarned} diplomacy tokens.`,
        tokensEarned,
      });

    } else if (action === 'purchase') {
      // Handle prestige shop purchases
      const upgradeCosts = {
        income_multiplier_1: { cost: 5, bonus: 0.10, name: 'Income Boost I (+10%)' },
        income_multiplier_2: { cost: 15, bonus: 0.25, name: 'Income Boost II (+25%)' },
        income_multiplier_3: { cost: 35, bonus: 0.50, name: 'Income Boost III (+50%)' },
        income_multiplier_4: { cost: 75, bonus: 1.00, name: 'Income Boost IV (+100%)' },
        starting_money_1: { cost: 8, bonus: 25000, name: 'Rich Start I (+$25K)' },
        starting_money_2: { cost: 20, bonus: 100000, name: 'Rich Start II (+$100K)' },
        starting_money_3: { cost: 50, bonus: 500000, name: 'Rich Start III (+$500K)' },
        faster_laws: { cost: 12, bonus: 0.25, name: 'Faster Laws (-25% taps required)' },
        better_events: { cost: 18, bonus: 0.20, name: 'Better Events (+20% positive outcomes)' },
        diplomatic_master: { cost: 30, bonus: 0.30, name: 'Diplomatic Master (-30% alliance costs)' },
      };

      const upgrade = upgradeCosts[upgradeType];
      if (!upgrade) {
        return Response.json({ error: 'Invalid upgrade type' }, { status: 400 });
      }

      // Check if player already has this upgrade
      const [existingUpgrade] = await sql`
        SELECT * FROM permanent_upgrades 
        WHERE player_id = ${playerId} AND upgrade_type = ${upgradeType}
      `;

      if (existingUpgrade) {
        return Response.json({ error: 'Upgrade already purchased' }, { status: 400 });
      }

      // Get current prestige data
      const [prestige] = await sql`
        SELECT * FROM prestige WHERE session_id = ${sessionId}
      `;

      if (!prestige || prestige.diplomacy_tokens < upgrade.cost) {
        return Response.json(
          { error: 'Insufficient diplomacy tokens' },
          { status: 400 }
        );
      }

      // Deduct tokens and add upgrade
      await sql`
        UPDATE prestige 
        SET diplomacy_tokens = diplomacy_tokens - ${upgrade.cost}
        WHERE session_id = ${sessionId}
      `;

      await sql`
        INSERT INTO permanent_upgrades (player_id, upgrade_type, upgrade_name, bonus_value)
        VALUES (${playerId}, ${upgradeType}, ${upgrade.name}, ${upgrade.bonus})
      `;

      return Response.json({
        success: true,
        message: `${upgrade.name} purchased successfully!`,
        upgrade,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing prestige action:', error);
    return Response.json(
      { error: 'Failed to process prestige action' },
      { status: 500 }
    );
  }
}