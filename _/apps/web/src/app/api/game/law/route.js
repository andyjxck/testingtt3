import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { sessionId, lawName, lawDescription, effects, action } =
      await request.json();

    const [session] = await sql`
      SELECT * FROM game_sessions WHERE id = ${sessionId}
    `;

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    if (action === "pass") {
      // Pass the law
      await sql`
        INSERT INTO active_laws (session_id, law_name, law_description, economy_effect, popularity_effects, enacted_year)
        VALUES (${sessionId}, ${lawName}, ${lawDescription}, ${effects.economy || 0}, ${JSON.stringify(effects.popularity || {})}, ${session.current_year})
      `;

      // Update population popularity with new structure
      const [currentPop] = await sql`
        SELECT * FROM population_classes WHERE session_id = ${sessionId}
      `;

      // Handle new popularity structure
      const popularityEffects = effects.popularity || {};
      const updatedPop = {
        rebels_popularity: Math.max(
          0,
          Math.min(
            100,
            currentPop.rebels_popularity +
              (popularityEffects.rebels_popularity || 0),
          ),
        ),
        working_class_popularity: Math.max(
          0,
          Math.min(
            100,
            currentPop.working_class_popularity +
              (popularityEffects.working_class_popularity || 0),
          ),
        ),
        high_class_popularity: Math.max(
          0,
          Math.min(
            100,
            currentPop.high_class_popularity +
              (popularityEffects.high_class_popularity || 0),
          ),
        ),
        poverty_class_popularity: Math.max(
          0,
          Math.min(
            100,
            currentPop.poverty_class_popularity +
              (popularityEffects.poverty_class_popularity || 0),
          ),
        ),
        middle_class_popularity: Math.max(
          0,
          Math.min(
            100,
            currentPop.middle_class_popularity +
              (popularityEffects.middle_class_popularity || 0),
          ),
        ),
      };

      await sql`
        UPDATE population_classes 
        SET 
          rebels_popularity = ${updatedPop.rebels_popularity},
          working_class_popularity = ${updatedPop.working_class_popularity},
          high_class_popularity = ${updatedPop.high_class_popularity},
          poverty_class_popularity = ${updatedPop.poverty_class_popularity},
          middle_class_popularity = ${updatedPop.middle_class_popularity}
        WHERE session_id = ${sessionId}
      `;

      // Update tap value if economy effect
      if (effects.economy) {
        const newTapValue = Math.max(
          1,
          Math.floor(session.tap_value * (1 + effects.economy)),
        );
        await sql`
          UPDATE game_sessions 
          SET tap_value = ${newTapValue}
          WHERE id = ${sessionId}
        `;
      }

      return Response.json({
        success: true,
        action: "passed",
        effects: updatedPop,
        message: `${lawName} has been enacted!`,
      });
    } else {
      // Reject the law - small popularity penalty
      await sql`
        UPDATE population_classes 
        SET 
          working_class_popularity = GREATEST(0, working_class_popularity - 2),
          middle_class_popularity = GREATEST(0, middle_class_popularity - 1)
        WHERE session_id = ${sessionId}
      `;

      return Response.json({
        success: true,
        action: "rejected",
        message: `${lawName} has been rejected.`,
      });
    }
  } catch (error) {
    console.error("Error processing law:", error);
    return Response.json({ error: "Failed to process law" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lawId = searchParams.get("lawId");
    const sessionId = searchParams.get("sessionId");

    // Remove the law
    await sql`
      DELETE FROM active_laws 
      WHERE id = ${lawId} AND session_id = ${sessionId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error removing law:", error);
    return Response.json({ error: "Failed to remove law" }, { status: 500 });
  }
}
