import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { countryId, playerId = "player1" } = await request.json();

    // Get country details for starting bonuses
    const [country] = await sql`
      SELECT * FROM countries WHERE id = ${countryId}
    `;

    if (!country) {
      return Response.json({ error: "Country not found" }, { status: 404 });
    }

    // Get permanent upgrades for starting bonuses
    const permanentUpgrades = await sql`
      SELECT upgrade_type, bonus_value FROM permanent_upgrades 
      WHERE player_id = ${playerId}
    `;

    // Calculate starting money with permanent bonuses
    const baseStartingMoney = 5000;
    let startingMoney = Math.floor(
      baseStartingMoney * (country.economy_bonus || 1.0),
    );

    // Apply permanent starting money bonuses
    for (const upgrade of permanentUpgrades) {
      if (upgrade.upgrade_type.startsWith("starting_money")) {
        startingMoney += upgrade.bonus_value;
        console.log(
          `💰 Starting money bonus: +$${upgrade.bonus_value} from ${upgrade.upgrade_type}`,
        );
      }
    }

    console.log(`💰 Total starting money: $${startingMoney}`);

    // Calculate starting tap value based on country
    const baseTapValue = 10;
    const startingTapValue = Math.floor(
      baseTapValue * (country.economy_bonus || 1.0),
    );

    // Create new game session with country-specific bonuses
    const [session] = await sql`
      INSERT INTO game_sessions (player_id, country_id, money, tap_value)
      VALUES (${playerId}, ${countryId}, ${startingMoney}, ${startingTapValue})
      RETURNING *
    `;

    // Initialize population classes with proper rebel logic (rebels start high)
    await sql`
      INSERT INTO population_classes (session_id, working_class_popularity, high_class_popularity, middle_class_popularity, poverty_class_popularity, rebels_popularity)
      VALUES (${session.id}, 60, 70, 55, 40, 80)
    `;

    // Initialize military
    await sql`
      INSERT INTO military (session_id, infantry, tanks, air_force, navy, total_strength)
      VALUES (${session.id}, 0, 0, 0, 0, 0)
    `;

    // Initialize prestige
    await sql`
      INSERT INTO prestige (session_id, prestige_level, global_influence_points, economy_multiplier, military_multiplier, popularity_multiplier)
      VALUES (${session.id}, 0, 0, 1.0, 1.0, 1.0)
    `;

    return Response.json({
      session: {
        ...session,
        country_name: country.name,
        flag_emoji: country.flag_emoji,
      },
      message: `Welcome to ${country.name}! Starting with $${startingMoney.toLocaleString()}`,
    });
  } catch (error) {
    console.error("Error creating game session:", error);
    return Response.json(
      { error: "Failed to create game session" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId") || "player1";

    const [session] = await sql`
      SELECT gs.*, c.name as country_name, c.flag_emoji, c.economy_bonus, c.military_bonus, c.stability_bonus
      FROM game_sessions gs
      JOIN countries c ON gs.country_id = c.id
      WHERE gs.player_id = ${playerId}
      ORDER BY gs.updated_at DESC
      LIMIT 1
    `;

    if (!session) {
      return Response.json({ session: null });
    }

    // Get population data
    const [population] = await sql`
      SELECT * FROM population_classes WHERE session_id = ${session.id}
    `;

    // Get military data
    const [military] = await sql`
      SELECT * FROM military WHERE session_id = ${session.id}
    `;

    // Get prestige data
    const [prestige] = await sql`
      SELECT * FROM prestige WHERE session_id = ${session.id}
    `;

    // Get active laws
    const laws = await sql`
      SELECT * FROM active_laws WHERE session_id = ${session.id}
    `;

    // Get territories
    const territories = await sql`
      SELECT * FROM territories WHERE session_id = ${session.id}
    `;

    // Get alliances
    const alliances = await sql`
      SELECT * FROM alliances WHERE session_id = ${session.id}
    `;

    // Calculate effective tap value including all bonuses (same logic as tap endpoint)
    const baseTapValue = session.tap_value || 1;

    // Calculate law effects on economy
    let lawEconomyMultiplier = 1.0;
    for (const law of laws) {
      if (law.economy_effect) {
        lawEconomyMultiplier *= 1 + law.economy_effect;
      }
    }

    // Apply law effects to base tap value
    const lawAdjustedTapValue = Math.max(
      1,
      Math.floor(baseTapValue * lawEconomyMultiplier),
    );

    const militaryBonus = Math.floor((military?.total_strength || 0) * 0.5);
    const economyMultiplier = session.economy_bonus || 1.0;
    const prestigeMultiplier = prestige?.economy_multiplier || 1.0;
    const allianceBonusTotal = alliances.reduce(
      (sum, alliance) => sum + (alliance.income_bonus || 0),
      0,
    );
    const allianceBonus = allianceBonusTotal + 1;

    const effectiveTapValue = Math.floor(
      lawAdjustedTapValue *
        economyMultiplier *
        prestigeMultiplier *
        allianceBonus +
        militaryBonus,
    );

    return Response.json({
      session: {
        ...session,
        tap_value: effectiveTapValue, // Show the effective tap value
        base_tap_value: baseTapValue, // Keep original for reference
        law_economy_multiplier: lawEconomyMultiplier, // Show law effects
        military_bonus: militaryBonus, // Show military bonus separately
        economy_multiplier: economyMultiplier,
        prestige_multiplier: prestigeMultiplier,
        alliance_bonus: allianceBonus,
        alliance_income_total: allianceBonusTotal, // Show total alliance income bonus
        population,
        military,
        prestige,
        laws,
        territories,
        alliances,
      },
    });
  } catch (error) {
    console.error("Error fetching game session:", error);
    return Response.json(
      { error: "Failed to fetch game session" },
      { status: 500 },
    );
  }
}
