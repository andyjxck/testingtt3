import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return Response.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Get session data
    const [session] = await sql`
      SELECT * FROM game_sessions WHERE id = ${sessionId}
    `;

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if election is due (every 2500 taps)
    if (session.total_taps < 2500 || session.total_taps % 2500 !== 0) {
      return Response.json(
        { error: "Election is not due yet" },
        { status: 400 },
      );
    }

    // Get population data
    const [population] = await sql`
      SELECT * FROM population_classes WHERE session_id = ${sessionId}
    `;

    if (!population) {
      return Response.json(
        { error: "Population data not found" },
        { status: 404 },
      );
    }

    // Calculate votes from each demographic (100 votes per group)
    const workingClassVotes = Math.round(
      (population.working_class_popularity / 100) * 100,
    );
    const middleClassVotes = Math.round(
      (population.middle_class_popularity / 100) * 100,
    );
    const highClassVotes = Math.round(
      (population.high_class_popularity / 100) * 100,
    );
    const povertyClassVotes = Math.round(
      (population.poverty_class_popularity / 100) * 100,
    );

    // Rebels vote against you - inverted
    const rebelVotes = Math.round(
      ((100 - population.rebels_popularity) / 100) * 100,
    );

    const totalVotesForYou =
      workingClassVotes +
      middleClassVotes +
      highClassVotes +
      povertyClassVotes +
      rebelVotes;
    const totalPossibleVotes = 500; // 5 demographics × 100 votes each
    const votesAgainstYou = totalPossibleVotes - totalVotesForYou;

    const winPercentage = Math.round(
      (totalVotesForYou / totalPossibleVotes) * 100,
    );
    const won = totalVotesForYou > votesAgainstYou; // Need majority to win

    // Create detailed vote breakdown
    const voteBreakdown = {
      working_class: {
        votes: workingClassVotes,
        support: population.working_class_popularity,
      },
      middle_class: {
        votes: middleClassVotes,
        support: population.middle_class_popularity,
      },
      high_class: {
        votes: highClassVotes,
        support: population.high_class_popularity,
      },
      poverty_class: {
        votes: povertyClassVotes,
        support: population.poverty_class_popularity,
      },
      rebels: {
        votes: rebelVotes,
        support: 100 - population.rebels_popularity,
      },
      total_for: totalVotesForYou,
      total_against: votesAgainstYou,
      win_percentage: winPercentage,
    };

    if (won) {
      // Calculate leadership bonus based on victory margin
      const victoryMargin = totalVotesForYou - votesAgainstYou;
      const bonusMultiplier = 1 + victoryMargin / 1000; // Max 50% bonus for landslide victory

      // Apply prestige bonus
      const [existingPrestige] = await sql`
        SELECT * FROM prestige WHERE session_id = ${sessionId}
      `;

      if (existingPrestige) {
        await sql`
          UPDATE prestige 
          SET 
            prestige_level = prestige_level + 1,
            global_influence_points = global_influence_points + ${Math.round(victoryMargin / 10)},
            economy_multiplier = economy_multiplier * ${bonusMultiplier}
          WHERE session_id = ${sessionId}
        `;
      } else {
        await sql`
          INSERT INTO prestige (session_id, prestige_level, global_influence_points, economy_multiplier)
          VALUES (${sessionId}, 1, ${Math.round(victoryMargin / 10)}, ${bonusMultiplier})
        `;
      }

      // Record the election
      await sql`
        INSERT INTO elections (session_id, election_year, total_popularity, won, bonus_applied)
        VALUES (${sessionId}, ${session.current_year}, ${winPercentage}, true, ${JSON.stringify({ bonusMultiplier, victoryMargin })})
      `;

      return Response.json({
        won: true,
        message: `🎉 Victory! You won ${totalVotesForYou} out of ${totalPossibleVotes} votes (${winPercentage}%)!`,
        bonusMultiplier,
        victoryMargin,
        voteBreakdown,
        details: `Working Class: ${workingClassVotes}, Middle Class: ${middleClassVotes}, High Class: ${highClassVotes}, Poverty Class: ${povertyClassVotes}, Anti-Rebel: ${rebelVotes}`,
      });
    } else {
      // Game over - lost election
      await sql`
        INSERT INTO elections (session_id, election_year, total_popularity, won, bonus_applied)
        VALUES (${sessionId}, ${session.current_year}, ${winPercentage}, false, ${JSON.stringify({ reason: "insufficient_votes" })})
      `;

      return Response.json({
        won: false,
        message: `💔 Defeat! You only received ${totalVotesForYou} out of ${totalPossibleVotes} votes (${winPercentage}%). The people have spoken.`,
        voteBreakdown,
        details: `You needed 251+ votes but only got ${totalVotesForYou}. Working Class: ${workingClassVotes}, Middle Class: ${middleClassVotes}, High Class: ${highClassVotes}, Poverty Class: ${povertyClassVotes}, Anti-Rebel: ${rebelVotes}`,
      });
    }
  } catch (error) {
    console.error("Error processing election:", error);
    return Response.json(
      { error: "Failed to process election" },
      { status: 500 },
    );
  }
}
