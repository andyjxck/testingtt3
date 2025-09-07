import sql from "@/app/api/utils/sql";

// Catalog (server-side source of truth)
const MILITARY_UNITS = {
  INFANTRY: {
    name: "Infantry",
    cost: 500,
    strength: 10,
    description: "Basic ground troops for defense and offense",
  },
  TANKS: {
    name: "Tanks",
    cost: 25000,
    strength: 50,
    description: "Armored vehicles for heavy combat",
  },
  AIR_FORCE: {
    name: "Fighter Jets",
    cost: 50000,
    strength: 100,
    description: "Air superiority fighters",
  },
  NAVY: {
    name: "Naval Ships",
    cost: 100000,
    strength: 200,
    description: "Naval vessels for sea control",
  },
};

// Map catalog key -> DB column name
const UNIT_DB_COL = {
  INFANTRY: "infantry",
  TANKS: "tanks",
  AIR_FORCE: "air_force",
  NAVY: "navy",
};

// safe number
const n = (v, d = 0) => {
  const num = typeof v === "string" ? Number(v.replace?.(/,/g, "")) : Number(v);
  return Number.isFinite(num) ? num : d;
};

export async function POST(request) {
  try {
    const { sessionId, unitType, quantity = 1 } = await request.json();

    console.log("Military recruitment request:", {
      sessionId,
      unitType,
      quantity,
    });

    if (!sessionId || !unitType) {
      return Response.json(
        { error: "Session ID and unit type required" },
        { status: 400 },
      );
    }

    // Normalize unitType to uppercase for comparison
    const normalizedUnitType = String(unitType).toUpperCase();
    console.log("Normalized unit type:", normalizedUnitType);

    const unit = MILITARY_UNITS[normalizedUnitType];
    if (!unit) {
      console.log("Available units:", Object.keys(MILITARY_UNITS));
      return Response.json(
        {
          error: "Invalid unit type",
          received: unitType,
          normalized: normalizedUnitType,
          available: Object.keys(MILITARY_UNITS),
        },
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

    const totalCost = unit.cost * quantity;

    // Check if player has enough money
    if (session.money < totalCost) {
      return Response.json(
        {
          error: "Insufficient funds",
          required: totalCost,
          current: session.money,
        },
        { status: 400 },
      );
    }

    // Ensure military record exists (idempotent)
    const [existingMilitary] = await sql`
      SELECT id FROM military WHERE session_id = ${sessionId}
    `;

    if (!existingMilitary) {
      await sql`
        INSERT INTO military (session_id, infantry, tanks, air_force, navy, total_strength)
        VALUES (${sessionId}, 0, 0, 0, 0, 0)
      `;
    }

    // Ensure population record exists (idempotent)
    const [existingPopulation] = await sql`
      SELECT id FROM population_classes WHERE session_id = ${sessionId}
    `;

    if (!existingPopulation) {
      await sql`
        INSERT INTO population_classes (session_id, working_class_popularity, high_class_popularity, middle_class_popularity, poverty_class_popularity, rebels_popularity)
        VALUES (${sessionId}, 50, 50, 50, 50, 20)
      `;
    }

    // Get the correct database column name
    const dbColumn = UNIT_DB_COL[normalizedUnitType];
    console.log("Database column mapping:", {
      unitType: normalizedUnitType,
      dbColumn,
    });

    if (!dbColumn) {
      return Response.json(
        {
          error: "Database mapping not found for unit type",
          unitType: normalizedUnitType,
          availableMappings: Object.keys(UNIT_DB_COL),
        },
        { status: 400 },
      );
    }

    const strengthIncrease = unit.strength * quantity;

    // Build the update query manually to avoid SQL injection issues
    const updateMilitaryQuery = `
      UPDATE military 
      SET 
        ${dbColumn} = COALESCE(${dbColumn}, 0) + $1,
        total_strength = COALESCE(total_strength, 0) + $2
      WHERE session_id = $3
      RETURNING *
    `;

    // Use a transaction to ensure consistency
    const results = await sql.transaction([
      sql`
        UPDATE game_sessions 
        SET money = money - ${totalCost}
        WHERE id = ${sessionId}
        RETURNING money
      `,
      sql(updateMilitaryQuery, [quantity, strengthIncrease, sessionId]),
      sql`
        UPDATE population_classes
        SET 
          working_class_popularity = GREATEST(0, LEAST(100, working_class_popularity - 2)),
          high_class_popularity = GREATEST(0, LEAST(100, high_class_popularity + 5))
        WHERE session_id = ${sessionId}
        RETURNING *
      `,
    ]);

    const [updatedSession, updatedMilitary, updatedPopulation] = results;

    console.log("Military recruitment successful:", {
      unit: unit.name,
      quantity,
      totalCost,
      strengthAdded: strengthIncrease,
    });

    return Response.json({
      success: true,
      message: `${quantity} ${unit.name} recruited successfully! Military strength provides +${Math.floor(strengthIncrease * 0.5)} tap power.`,
      unit,
      quantity,
      totalCost,
      strengthAdded: strengthIncrease,
      militaryBonus: Math.floor(strengthIncrease * 0.5),
      session: {
        id: sessionId,
        money: updatedSession[0]?.money || 0,
        military: updatedMilitary[0] || {},
        population: updatedPopulation[0] || {},
      },
    });
  } catch (error) {
    console.error("Error recruiting military units:", error);
    return Response.json(
      { error: `Failed to recruit military units: ${error.message}` },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    // sessionId optional here
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || null;

    const availableUnits = Object.entries(MILITARY_UNITS).map(
      ([key, unit]) => ({
        id: key,
        ...unit,
      }),
    );

    let session = null;
    let military = null;

    if (sessionId) {
      const [s] =
        await sql`SELECT id, money FROM game_sessions WHERE id = ${sessionId}`;
      if (s) {
        session = { id: s.id, money: n(s.money, 0) };
        const [m] = await sql`
          SELECT infantry, tanks, air_force, navy, total_strength
          FROM military WHERE session_id = ${sessionId}
        `;
        if (m) {
          military = {
            infantry: n(m.infantry, 0),
            tanks: n(m.tanks, 0),
            air_force: n(m.air_force, 0),
            navy: n(m.navy, 0),
            total_strength: n(m.total_strength, 0),
          };
        }
      }
    }

    return Response.json({ availableUnits, session, military });
  } catch (error) {
    console.error("Error fetching military recruitment data:", error);
    return Response.json(
      { error: "Failed to fetch military data" },
      { status: 500 },
    );
  }
}
