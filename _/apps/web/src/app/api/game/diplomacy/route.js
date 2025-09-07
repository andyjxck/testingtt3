import sql from "@/app/api/utils/sql";

// Expanded diplomatic actions with more variety and strategic depth
const DIPLOMATIC_ACTIONS = {
  TRADE_PARTNERSHIP: {
    name: "Trade Partnership Agreement",
    description: "Establish lucrative trade routes for economic growth",
    cost: 5000,
    incomeBonus: 0.08,
    militaryBonus: 0,
    popularityBonus: 5,
    relationshipBonus: 15,
  },
  MILITARY_ALLIANCE: {
    name: "Military Defense Pact",
    description: "Joint military cooperation and shared defense",
    cost: 15000,
    incomeBonus: 0,
    militaryBonus: 0.12,
    popularityBonus: -2,
    relationshipBonus: 25,
  },
  CULTURAL_EXCHANGE: {
    name: "Cultural Exchange Program",
    description: "Promote arts, education, and cultural understanding",
    cost: 3000,
    incomeBonus: 0.03,
    militaryBonus: 0,
    popularityBonus: 8,
    relationshipBonus: 20,
  },
  TECHNOLOGY_SHARING: {
    name: "Technology Sharing Agreement",
    description: "Exchange scientific knowledge and innovations",
    cost: 12000,
    incomeBonus: 0.1,
    militaryBonus: 0.05,
    popularityBonus: 3,
    relationshipBonus: 18,
  },
  HUMANITARIAN_AID: {
    name: "Humanitarian Aid Partnership",
    description: "Coordinate disaster relief and medical assistance",
    cost: 8000,
    incomeBonus: 0.02,
    militaryBonus: 0,
    popularityBonus: 12,
    relationshipBonus: 22,
  },
  ENERGY_COOPERATION: {
    name: "Energy Cooperation Treaty",
    description: "Share renewable energy resources and technology",
    cost: 10000,
    incomeBonus: 0.06,
    militaryBonus: 0,
    popularityBonus: 6,
    relationshipBonus: 16,
  },
  SPACE_COLLABORATION: {
    name: "Space Exploration Partnership",
    description: "Joint space missions and satellite programs",
    cost: 25000,
    incomeBonus: 0.05,
    militaryBonus: 0.03,
    popularityBonus: 10,
    relationshipBonus: 30,
  },
  INTELLIGENCE_SHARING: {
    name: "Intelligence Sharing Agreement",
    description: "Exchange security information and counterterrorism data",
    cost: 18000,
    incomeBonus: 0.02,
    militaryBonus: 0.08,
    popularityBonus: -5,
    relationshipBonus: 15,
  },
  ENVIRONMENTAL_PACT: {
    name: "Environmental Protection Pact",
    description: "Joint efforts to combat climate change and pollution",
    cost: 7000,
    incomeBonus: 0.04,
    militaryBonus: 0,
    popularityBonus: 15,
    relationshipBonus: 25,
  },
  STUDENT_EXCHANGE: {
    name: "Student Exchange Program",
    description: "Educational partnerships and scholarship programs",
    cost: 4000,
    incomeBonus: 0.03,
    militaryBonus: 0,
    popularityBonus: 9,
    relationshipBonus: 18,
  },
  CYBER_SECURITY_ALLIANCE: {
    name: "Cyber Security Alliance",
    description: "Protect against cyber threats and digital warfare",
    cost: 14000,
    incomeBonus: 0.02,
    militaryBonus: 0.06,
    popularityBonus: 2,
    relationshipBonus: 12,
  },
  RESEARCH_CONSORTIUM: {
    name: "Scientific Research Consortium",
    description: "Collaborative research in medicine and technology",
    cost: 16000,
    incomeBonus: 0.07,
    militaryBonus: 0.02,
    popularityBonus: 7,
    relationshipBonus: 20,
  },
  TOURISM_PROMOTION: {
    name: "Tourism Promotion Alliance",
    description: "Joint marketing and visa-free travel agreements",
    cost: 6000,
    incomeBonus: 0.05,
    militaryBonus: 0,
    popularityBonus: 8,
    relationshipBonus: 14,
  },
  AGRICULTURAL_COOPERATION: {
    name: "Agricultural Cooperation Treaty",
    description: "Share farming techniques and food security programs",
    cost: 5500,
    incomeBonus: 0.04,
    militaryBonus: 0,
    popularityBonus: 10,
    relationshipBonus: 17,
  },
  MARITIME_SECURITY: {
    name: "Maritime Security Partnership",
    description: "Joint naval patrols and shipping lane protection",
    cost: 13000,
    incomeBonus: 0.03,
    militaryBonus: 0.07,
    popularityBonus: 1,
    relationshipBonus: 13,
  },
};

// Expanded list of countries for diplomacy
const COUNTRIES_FOR_DIPLOMACY = [
  {
    name: "United States",
    region: "North America",
    stability: "High",
    flag: "🇺🇸",
  },
  { name: "European Union", region: "Europe", stability: "High", flag: "🇪🇺" },
  { name: "China", region: "Asia", stability: "High", flag: "🇨🇳" },
  { name: "Japan", region: "Asia", stability: "High", flag: "🇯🇵" },
  { name: "India", region: "Asia", stability: "Medium", flag: "🇮🇳" },
  { name: "Brazil", region: "South America", stability: "Medium", flag: "🇧🇷" },
  { name: "Russia", region: "Eurasia", stability: "Medium", flag: "🇷🇺" },
  { name: "Canada", region: "North America", stability: "High", flag: "🇨🇦" },
  { name: "Australia", region: "Oceania", stability: "High", flag: "🇦🇺" },
  { name: "South Korea", region: "Asia", stability: "High", flag: "🇰🇷" },
  { name: "Mexico", region: "North America", stability: "Medium", flag: "🇲🇽" },
  { name: "Turkey", region: "Eurasia", stability: "Medium", flag: "🇹🇷" },
  {
    name: "Saudi Arabia",
    region: "Middle East",
    stability: "Medium",
    flag: "🇸🇦",
  },
  { name: "South Africa", region: "Africa", stability: "Medium", flag: "🇿🇦" },
  { name: "Indonesia", region: "Asia", stability: "Medium", flag: "🇮🇩" },
  { name: "Nigeria", region: "Africa", stability: "Low", flag: "🇳🇬" },
  { name: "Egypt", region: "Africa", stability: "Medium", flag: "🇪🇬" },
  {
    name: "Argentina",
    region: "South America",
    stability: "Medium",
    flag: "🇦🇷",
  },
  { name: "Iran", region: "Middle East", stability: "Low", flag: "🇮🇷" },
  { name: "Pakistan", region: "Asia", stability: "Low", flag: "🇵🇰" },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "Session ID required" }, { status: 400 });
    }

    // Get current alliances
    const alliances = await sql`
      SELECT * FROM alliances WHERE session_id = ${sessionId} AND is_active = true
    `;

    // Get list of countries already allied with
    const alliedCountries = alliances.map((a) => a.ally_name);

    // Get available diplomatic actions (filter out already completed ones)
    const allAvailableActions = Object.entries(DIPLOMATIC_ACTIONS).map(
      ([key, action]) => ({
        id: key,
        ...action,
      }),
    );

    // Filter out actions that have already been taken
    const completedActions = alliances.map((a) => a.ally_name);
    const availableActions = allAvailableActions.filter(
      (action) => !completedActions.includes(action.name),
    );

    return Response.json({
      alliances,
      availableActions,
      availableCountries: COUNTRIES_FOR_DIPLOMACY,
    });
  } catch (error) {
    console.error("Error fetching diplomacy data:", error);
    return Response.json(
      { error: "Failed to fetch diplomacy data" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { sessionId, action, countryName, actionType } = await request.json();

    if (!sessionId || !action) {
      return Response.json(
        { error: "Session ID and action required" },
        { status: 400 },
      );
    }

    // Get current session
    const [session] = await sql`
      SELECT * FROM game_sessions WHERE id = ${sessionId}
    `;

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const actionData = DIPLOMATIC_ACTIONS[action];

    if (!actionData) {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    // Check if player has enough money
    if (session.money < actionData.cost) {
      return Response.json(
        {
          error: "Insufficient funds",
          required: actionData.cost,
          current: session.money,
        },
        { status: 400 },
      );
    }

    // Deduct cost
    await sql`
      UPDATE game_sessions 
      SET money = money - ${actionData.cost}
      WHERE id = ${sessionId}
    `;

    // Create alliance record (income bonus will be applied in tap calculation)
    await sql`
      INSERT INTO alliances (
        session_id, 
        ally_name, 
        relationship_level, 
        income_bonus, 
        military_bonus, 
        tribute_cost
      )
      VALUES (
        ${sessionId},
        ${countryName || actionData.name},
        75,
        ${actionData.incomeBonus || 0},
        ${actionData.militaryBonus || 0},
        ${actionData.cost}
      )
    `;

    // Apply popularity bonuses
    if (actionData.popularityBonus) {
      await sql`
        UPDATE population_classes
        SET 
          working_class_popularity = LEAST(100, working_class_popularity + ${actionData.popularityBonus}),
          middle_class_popularity = LEAST(100, middle_class_popularity + ${actionData.popularityBonus})
        WHERE session_id = ${sessionId}
      `;
    }

    return Response.json({
      success: true,
      message: `${actionData.name} established successfully!`,
      action: actionData,
      costPaid: actionData.cost,
    });
  } catch (error) {
    console.error("Error processing diplomatic action:", error);
    return Response.json(
      { error: "Failed to process diplomatic action" },
      { status: 500 },
    );
  }
}

// Delete alliance
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const allianceId = searchParams.get("allianceId");
    const sessionId = searchParams.get("sessionId");

    if (!allianceId || !sessionId) {
      return Response.json(
        { error: "Alliance ID and Session ID required" },
        { status: 400 },
      );
    }

    // Get alliance details before deletion
    const [alliance] = await sql`
      SELECT * FROM alliances WHERE id = ${allianceId} AND session_id = ${sessionId}
    `;

    if (!alliance) {
      return Response.json({ error: "Alliance not found" }, { status: 404 });
    }

    // Remove alliance
    await sql`
      DELETE FROM alliances WHERE id = ${allianceId} AND session_id = ${sessionId}
    `;

    return Response.json({
      success: true,
      message: `Alliance with ${alliance.ally_name} has been dissolved.`,
    });
  } catch (error) {
    console.error("Error dissolving alliance:", error);
    return Response.json(
      { error: "Failed to dissolve alliance" },
      { status: 500 },
    );
  }
}