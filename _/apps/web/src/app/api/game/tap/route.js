import sql from "@/app/api/utils/sql";

// Import available laws from the laws system
const AVAILABLE_LAWS = {
  // POSITIVE/GOOD LAWS
  MINIMUM_WAGE: {
    name: "Minimum Wage Increase",
    description: "Increase minimum wage by 20% to help working families",
    tapsRequired: 150,
    effects: {
      economy: -0.08,
      popularity: {
        working_class_popularity: 20,
        poverty_class_popularity: 15,
        high_class_popularity: -15,
        middle_class_popularity: 8,
      },
    },
  },
  HEALTHCARE_REFORM: {
    name: "Universal Healthcare",
    description: "Implement free healthcare for all citizens",
    tapsRequired: 200,
    effects: {
      economy: -0.18,
      popularity: {
        working_class_popularity: 25,
        poverty_class_popularity: 30,
        middle_class_popularity: 20,
        high_class_popularity: -20,
        rebels_popularity: -15,
      },
    },
  },
  EDUCATION_FUNDING: {
    name: "Education Funding Increase",
    description: "Double funding for schools and universities",
    tapsRequired: 180,
    effects: {
      economy: -0.1,
      popularity: {
        working_class_popularity: 15,
        middle_class_popularity: 25,
        poverty_class_popularity: 20,
        high_class_popularity: -8,
      },
    },
  },
  ANTI_CORRUPTION: {
    name: "Anti-Corruption Initiative",
    description: "Root out corruption in government and business",
    tapsRequired: 100,
    effects: {
      economy: 0.08,
      popularity: {
        working_class_popularity: 20,
        middle_class_popularity: 22,
        poverty_class_popularity: 18,
        high_class_popularity: -25,
        rebels_popularity: -20,
      },
    },
  },
  INFRASTRUCTURE: {
    name: "Infrastructure Investment",
    description: "Massive investment in roads, bridges, and public transport",
    tapsRequired: 220,
    effects: {
      economy: 0.1,
      popularity: {
        working_class_popularity: 18,
        middle_class_popularity: 15,
        poverty_class_popularity: 12,
        high_class_popularity: 8,
      },
    },
  },
  GREEN_ENERGY: {
    name: "Green Energy Initiative",
    description: "Invest in renewable energy and reduce carbon emissions",
    tapsRequired: 190,
    effects: {
      economy: -0.05,
      popularity: {
        working_class_popularity: 12,
        middle_class_popularity: 25,
        high_class_popularity: -8,
        rebels_popularity: -10,
      },
    },
  },
  AFFORDABLE_HOUSING: {
    name: "Affordable Housing Program",
    description: "Build low-cost housing for families in need",
    tapsRequired: 170,
    effects: {
      economy: -0.12,
      popularity: {
        working_class_popularity: 22,
        poverty_class_popularity: 30,
        middle_class_popularity: 8,
        high_class_popularity: -5,
      },
    },
  },

  // NEUTRAL/BALANCED LAWS
  TAX_CUTS: {
    name: "Corporate Tax Cuts",
    description: "Reduce corporate tax rates to stimulate business growth",
    tapsRequired: 120,
    effects: {
      economy: 0.15,
      popularity: {
        high_class_popularity: 25,
        working_class_popularity: -8,
        poverty_class_popularity: -12,
        middle_class_popularity: 5,
      },
    },
  },
  ENVIRONMENTAL_PROTECTION: {
    name: "Environmental Protection Act",
    description: "Strict environmental regulations to combat climate change",
    tapsRequired: 160,
    effects: {
      economy: -0.12,
      popularity: {
        working_class_popularity: 10,
        middle_class_popularity: 25,
        high_class_popularity: -18,
        rebels_popularity: -10,
      },
    },
  },
  TECH_INNOVATION: {
    name: "Technology Innovation Fund",
    description: "Government funding for tech startups and innovation",
    tapsRequired: 140,
    effects: {
      economy: 0.08,
      popularity: {
        high_class_popularity: 15,
        middle_class_popularity: 18,
        working_class_popularity: -5,
        poverty_class_popularity: -8,
      },
    },
  },

  // NEGATIVE/CONTROVERSIAL LAWS
  MILITARY_EXPANSION: {
    name: "Military Expansion Program",
    description: "Increase military spending and recruitment",
    tapsRequired: 140,
    effects: {
      economy: -0.08,
      popularity: {
        working_class_popularity: -5,
        high_class_popularity: 15,
        poverty_class_popularity: -8,
        rebels_popularity: 8,
      },
    },
  },
  SURVEILLANCE_STATE: {
    name: "Enhanced Surveillance Program",
    description: "Expand government surveillance to improve security",
    tapsRequired: 110,
    effects: {
      economy: -0.05,
      popularity: {
        working_class_popularity: -15,
        middle_class_popularity: -20,
        high_class_popularity: 5,
        rebels_popularity: 25,
      },
    },
  },
  AUSTERITY_MEASURES: {
    name: "Economic Austerity Package",
    description: "Cut government spending to reduce national debt",
    tapsRequired: 130,
    effects: {
      economy: 0.12,
      popularity: {
        working_class_popularity: -20,
        poverty_class_popularity: -25,
        middle_class_popularity: -10,
        high_class_popularity: 20,
      },
    },
  },
  LUXURY_TAX: {
    name: "Luxury Goods Tax",
    description: "Heavy taxes on luxury items and expensive properties",
    tapsRequired: 90,
    effects: {
      economy: -0.06,
      popularity: {
        working_class_popularity: 15,
        poverty_class_popularity: 20,
        middle_class_popularity: 5,
        high_class_popularity: -30,
      },
    },
  },
  IMMIGRATION_RESTRICTIONS: {
    name: "Immigration Control Act",
    description: "Strict limits on immigration and border security",
    tapsRequired: 120,
    effects: {
      economy: -0.04,
      popularity: {
        working_class_popularity: 10,
        middle_class_popularity: -8,
        high_class_popularity: -12,
        rebels_popularity: 15,
      },
    },
  },
  PRESS_RESTRICTIONS: {
    name: "Media Regulation Act",
    description: "Government oversight of news media and social platforms",
    tapsRequired: 100,
    effects: {
      economy: 0.02,
      popularity: {
        working_class_popularity: -12,
        middle_class_popularity: -18,
        high_class_popularity: 8,
        rebels_popularity: 20,
      },
    },
  },
  PRIVATIZATION: {
    name: "Public Service Privatization",
    description: "Sell government services to private companies",
    tapsRequired: 150,
    effects: {
      economy: 0.15,
      popularity: {
        working_class_popularity: -18,
        poverty_class_popularity: -22,
        middle_class_popularity: -5,
        high_class_popularity: 25,
      },
    },
  },
};

// Get available laws for random events (not currently pending or active)
async function getAvailableLawsForEvents(sessionId) {
  try {
    // Get pending laws
    const pendingLaws = await sql`
      SELECT law_name FROM pending_laws WHERE session_id = ${sessionId}
    `;

    // Get active laws
    const activeLaws = await sql`
      SELECT law_name FROM active_laws WHERE session_id = ${sessionId}
    `;

    const unavailableLaws = [
      ...pendingLaws.map((l) => l.law_name),
      ...activeLaws.map((l) => l.law_name),
    ];

    // Filter available laws
    const availableLaws = Object.entries(AVAILABLE_LAWS)
      .filter(([key, law]) => !unavailableLaws.includes(law.name))
      .map(([key, law]) => ({
        id: key,
        type: "law",
        title: law.name,
        description: law.description,
        effects: law.effects,
        tapsRequired: law.tapsRequired,
      }));

    return availableLaws;
  } catch (error) {
    console.error("Error getting available laws for events:", error);
    return [];
  }
}

// Random events that boost popularity
const RANDOM_EVENTS = {
  ECONOMIC_BOOM: {
    title: "Economic Boom",
    description: "A tech company announces massive investment in your country",
    effects: {
      popularity: {
        working_class_popularity: 15,
        middle_class_popularity: 20,
        high_class_popularity: 25,
        rebels_popularity: -10, // Happy people = less rebels
      },
    },
  },
  SUCCESSFUL_SPORTS_TEAM: {
    title: "National Sports Victory",
    description: "Your national team wins an international championship",
    effects: {
      popularity: {
        working_class_popularity: 20,
        middle_class_popularity: 15,
        poverty_class_popularity: 18,
        rebels_popularity: -15, // Unity reduces rebel activity
      },
    },
  },
  CULTURAL_FESTIVAL: {
    title: "Cultural Festival Success",
    description: "A major cultural festival attracts international attention",
    effects: {
      popularity: {
        middle_class_popularity: 18,
        high_class_popularity: 12,
        working_class_popularity: 8,
        rebels_popularity: -8,
      },
    },
  },
  NATURAL_DISASTER_RESPONSE: {
    title: "Emergency Response Success",
    description: "Government handles natural disaster exceptionally well",
    effects: {
      popularity: {
        working_class_popularity: 25,
        poverty_class_popularity: 30,
        middle_class_popularity: 20,
        rebels_popularity: -20, // Good governance reduces rebellion
      },
    },
  },
  INFRASTRUCTURE_SUCCESS: {
    title: "Infrastructure Milestone",
    description: "Major infrastructure project completed ahead of schedule",
    effects: {
      popularity: {
        working_class_popularity: 15,
        middle_class_popularity: 22,
        high_class_popularity: 10,
        rebels_popularity: -12,
      },
    },
  },
  DIPLOMATIC_SUCCESS: {
    title: "Diplomatic Victory",
    description: "Your country successfully mediates international conflict",
    effects: {
      popularity: {
        high_class_popularity: 20,
        middle_class_popularity: 15,
        working_class_popularity: 8,
        rebels_popularity: -10,
      },
    },
  },
  CORRUPTION_SCANDAL: {
    title: "Corruption Scandal",
    description: "Opposition politicians caught in major corruption scandal",
    effects: {
      popularity: {
        working_class_popularity: 12,
        middle_class_popularity: 15,
        poverty_class_popularity: 10,
        rebels_popularity: -25, // Scandals help your legitimacy
      },
    },
  },
  ECONOMIC_RECOVERY: {
    title: "Economic Recovery",
    description: "Unemployment drops to historic lows",
    effects: {
      popularity: {
        working_class_popularity: 25,
        poverty_class_popularity: 30,
        middle_class_popularity: 15,
        rebels_popularity: -18, // Jobs reduce rebellion
      },
    },
  },
};

// Rebel attack events (when rebel support is high)
const REBEL_ATTACKS = {
  CIVILIAN_UNREST: {
    title: "Civilian Unrest",
    description:
      "Protesters clash with police in the capital. Your military must restore order.",
    type: "rebel_attack",
    militaryCost: 50, // Military strength lost
    moneyCost: 10000, // Money lost to damages
  },
  SABOTAGE_ATTACK: {
    title: "Infrastructure Sabotage",
    description:
      "Rebels have damaged key infrastructure. Military forces are deployed to secure the area.",
    type: "rebel_attack",
    militaryCost: 75,
    moneyCost: 25000,
    tapReduction: 0.05, // 5% tap value reduction temporarily
  },
  ARMED_UPRISING: {
    title: "Armed Uprising",
    description:
      "Armed rebels attack government facilities. Heavy military response required.",
    type: "rebel_attack",
    militaryCost: 100,
    moneyCost: 50000,
  },
  TERRORIST_BOMBING: {
    title: "Terrorist Attack",
    description:
      "Extremists bomb civilian targets. Your military must hunt down the perpetrators.",
    type: "rebel_attack",
    militaryCost: 80,
    moneyCost: 30000,
    popularityLoss: {
      working_class_popularity: -10,
      middle_class_popularity: -15,
      high_class_popularity: -8,
    },
  },
};

// Get random events
async function getRandomEvents() {
  const events = Object.entries(RANDOM_EVENTS).map(([key, event]) => ({
    id: key,
    type: "event",
    title: event.title,
    description: event.description,
    effects: event.effects,
  }));

  return events;
}

// Progress pending laws function
async function progressPendingLaws(sessionId, taps = 1) {
  try {
    console.log(
      `📚 Progress pending laws - Session: ${sessionId}, Taps: ${taps}`,
    );

    // Get current session to find player_id
    const [session] =
      await sql`SELECT player_id FROM game_sessions WHERE id = ${sessionId}`;

    // Check for faster laws upgrade
    const [fasterLawsUpgrade] = await sql`
      SELECT bonus_value FROM permanent_upgrades 
      WHERE player_id = ${session.player_id} AND upgrade_type = 'faster_laws'
    `;

    // Apply faster laws bonus (25% fewer taps = 1.33x progress rate)
    let progressMultiplier = 1.0;
    if (fasterLawsUpgrade) {
      progressMultiplier = 1 + fasterLawsUpgrade.bonus_value; // 0.25 bonus = 1.25x faster
      console.log(
        `📚 Faster Laws bonus: ${fasterLawsUpgrade.bonus_value} (${progressMultiplier}x faster)`,
      );
    }

    const effectiveTaps = Math.ceil(taps * progressMultiplier);
    console.log(
      `📚 Effective taps for law progress: ${taps} × ${progressMultiplier} = ${effectiveTaps}`,
    );

    // Get all pending laws
    const pendingLaws = await sql`
      SELECT * FROM pending_laws WHERE session_id = ${sessionId}
    `;

    console.log(`📚 Found ${pendingLaws.length} pending laws`);

    const enactedLaws = [];

    for (const law of pendingLaws) {
      const oldTapsRemaining = law.taps_remaining;
      const newTapsRemaining = Math.max(0, law.taps_remaining - effectiveTaps);

      console.log(
        `📚 Law "${law.law_name}": ${oldTapsRemaining} -> ${newTapsRemaining} taps remaining`,
      );

      if (newTapsRemaining === 0) {
        // Law is ready to be enacted
        console.log(`📚 Enacting law: ${law.law_name}`);

        const effects =
          typeof law.effects === "string"
            ? JSON.parse(law.effects)
            : law.effects;

        // Get current session for year
        const [currentSession] =
          await sql`SELECT current_year, tap_value FROM game_sessions WHERE id = ${sessionId}`;

        // Move to active laws
        await sql`
          INSERT INTO active_laws (session_id, law_name, law_description, economy_effect, popularity_effects, enacted_year)
          VALUES (${sessionId}, ${law.law_name}, ${law.law_description}, ${effects.economy || 0}, ${JSON.stringify(effects.popularity || {})}, ${currentSession.current_year})
        `;

        // Apply economic effects
        if (effects.economy) {
          const newTapValue = Math.max(
            1,
            Math.floor(currentSession.tap_value * (1 + effects.economy)),
          );
          await sql`
            UPDATE game_sessions 
            SET tap_value = ${newTapValue}
            WHERE id = ${sessionId}
          `;
          console.log(
            `📚 Applied economy effect: ${effects.economy} (${currentSession.tap_value} -> ${newTapValue})`,
          );
        }

        // Apply popularity effects
        if (effects.popularity) {
          const updates = [];
          const values = [];
          let paramCount = 1;

          Object.entries(effects.popularity).forEach(([key, change]) => {
            updates.push(
              `${key} = GREATEST(0, LEAST(100, ${key} + $${paramCount}))`,
            );
            values.push(change);
            paramCount++;
          });

          if (updates.length > 0) {
            const updateQuery = `
              UPDATE population_classes 
              SET ${updates.join(", ")}
              WHERE session_id = $${paramCount}
            `;
            values.push(sessionId);

            await sql(updateQuery, values);
            console.log(`📚 Applied popularity effects:`, effects.popularity);
          }
        }

        // Remove from pending
        await sql`
          DELETE FROM pending_laws WHERE id = ${law.id}
        `;

        enactedLaws.push(law.law_name);
      } else {
        // Update remaining taps
        await sql`
          UPDATE pending_laws 
          SET taps_remaining = ${newTapsRemaining}
          WHERE id = ${law.id}
        `;
        console.log(
          `📚 Updated law "${law.law_name}" taps remaining: ${newTapsRemaining}`,
        );
      }
    }

    console.log(`📚 Laws enacted this tap:`, enactedLaws);
    return enactedLaws;
  } catch (error) {
    console.error("Error progressing pending laws:", error);
    return [];
  }
}

// Donation system - random donations from citizens
const DONATION_EVENTS = [
  {
    title: "Grateful Citizen Donation",
    description: "A grateful citizen has donated to your government fund!",
    amount: () => Math.floor(Math.random() * 5000) + 1000, // 1k-6k
    chance: 0.15,
  },
  {
    title: "Business Community Support",
    description: "Local businesses have pooled together a donation!",
    amount: () => Math.floor(Math.random() * 20000) + 5000, // 5k-25k
    chance: 0.08,
  },
  {
    title: "International Aid",
    description: "A foreign government has sent financial aid!",
    amount: () => Math.floor(Math.random() * 50000) + 10000, // 10k-60k
    chance: 0.04,
  },
  {
    title: "Wealthy Benefactor",
    description: "A wealthy philanthropist has made a major donation!",
    amount: () => Math.floor(Math.random() * 200000) + 50000, // 50k-250k
    chance: 0.02,
  },
  {
    title: "Historic Windfall",
    description: "An unprecedented donation from multiple sources!",
    amount: () => Math.floor(Math.random() * 750000) + 250000, // 250k-1M
    chance: 0.005,
  },
];

// Get random donation
function getRandomDonation() {
  const totalChance = DONATION_EVENTS.reduce(
    (sum, event) => sum + event.chance,
    0,
  );
  const random = Math.random() * totalChance;

  let currentChance = 0;
  for (const event of DONATION_EVENTS) {
    currentChance += event.chance;
    if (random <= currentChance) {
      return {
        ...event,
        amount: event.amount(),
      };
    }
  }
  return null;
}

export async function POST(request) {
  try {
    const { sessionId, taps = 1 } = await request.json();

    if (!sessionId) {
      return Response.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Get current session data with country bonuses
    const [session] = await sql`
      SELECT gs.*, c.economy_bonus, c.military_bonus, c.stability_bonus
      FROM game_sessions gs
      LEFT JOIN countries c ON gs.country_id = c.id
      WHERE gs.id = ${sessionId}
    `;

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    // Get prestige multipliers
    const [prestige] = await sql`
      SELECT * FROM prestige WHERE session_id = ${sessionId}
    `;

    // Get alliance bonuses
    const alliances = await sql`
      SELECT income_bonus FROM alliances 
      WHERE session_id = ${sessionId} AND is_active = true
    `;

    // Get all active laws for economy calculation
    const activeLaws = await sql`
      SELECT economy_effect FROM active_laws WHERE session_id = ${sessionId}
    `;

    // Get military strength for tap bonus
    const [militaryData] = await sql`
      SELECT total_strength FROM military WHERE session_id = ${sessionId}
    `;

    // Get permanent upgrades for this player
    const permanentUpgrades = await sql`
      SELECT upgrade_type, bonus_value FROM permanent_upgrades 
      WHERE player_id = ${session.player_id}
    `;

    // CALCULATE ACTUAL TAP VALUE WITH ALL BONUSES
    let finalTapValue = session.tap_value || 1;

    console.log(`💰 Starting Tap Value Calculation:`);
    console.log(`Base tap value: ${finalTapValue}`);

    // 1. Apply COUNTRY bonus
    if (session.economy_bonus && session.economy_bonus !== 1.0) {
      finalTapValue = Math.floor(finalTapValue * session.economy_bonus);
      console.log(
        `After country bonus (${session.economy_bonus}x): ${finalTapValue}`,
      );
    }

    // 2. Apply PRESTIGE multiplier
    if (prestige?.economy_multiplier && prestige.economy_multiplier !== 1.0) {
      finalTapValue = Math.floor(finalTapValue * prestige.economy_multiplier);
      console.log(
        `After prestige bonus (${prestige.economy_multiplier}x): ${finalTapValue}`,
      );
    }

    // 3. Apply LAWS effects (cumulative percentage effects)
    for (const law of activeLaws) {
      if (law.economy_effect && law.economy_effect !== 0) {
        const multiplier = 1 + law.economy_effect;
        finalTapValue = Math.max(1, Math.floor(finalTapValue * multiplier));
        console.log(
          `After law effect (${law.economy_effect}, ${multiplier}x): ${finalTapValue}`,
        );
      }
    }

    // 4. Apply DIPLOMACY alliance bonuses (cumulative percentage effects)
    for (const alliance of alliances) {
      if (alliance.income_bonus && alliance.income_bonus !== 0) {
        const multiplier = 1 + alliance.income_bonus;
        finalTapValue = Math.floor(finalTapValue * multiplier);
        console.log(
          `After alliance bonus (${alliance.income_bonus}, ${multiplier}x): ${finalTapValue}`,
        );
      }
    }

    // 5. Apply PERMANENT UPGRADES (Prestige Shop Bonuses)
    console.log(`🌟 Applying ${permanentUpgrades.length} permanent upgrades:`);
    for (const upgrade of permanentUpgrades) {
      console.log(
        `🌟 Checking upgrade: ${upgrade.upgrade_type} (${upgrade.bonus_value})`,
      );

      // Income multiplier upgrades
      if (
        upgrade.upgrade_type.startsWith("income_multiplier") &&
        upgrade.bonus_value !== 0
      ) {
        const multiplier = 1 + upgrade.bonus_value;
        const oldValue = finalTapValue;
        finalTapValue = Math.floor(finalTapValue * multiplier);
        console.log(
          `🌟 INCOME BOOST: ${upgrade.upgrade_type} - ${oldValue} × ${multiplier} = ${finalTapValue}`,
        );
      }
    }

    // 6. Apply MILITARY strength bonus (flat addition)
    const militaryBonus = Math.floor((militaryData?.total_strength || 0) * 0.5);
    if (militaryBonus > 0) {
      finalTapValue += militaryBonus;
      console.log(`After military bonus (+${militaryBonus}): ${finalTapValue}`);
    }

    console.log(`🎯 FINAL TAP VALUE: ${finalTapValue}`);

    const moneyEarned = Math.floor(taps * finalTapValue);

    // Calculate new year (every 500 taps = 1 year)
    const newTotalTaps = session.total_taps + taps;
    const newYear = Math.floor(newTotalTaps / 500) + 1;
    const yearChanged = newYear > session.current_year;

    // Update session with new money, taps, and year FIRST
    await sql`
      UPDATE game_sessions 
      SET 
        money = money + ${moneyEarned},
        total_taps = ${newTotalTaps},
        current_year = ${newYear},
        updated_at = now()
      WHERE id = ${sessionId}
    `;

    // Progress pending laws IMMEDIATELY after updating session
    const enactedLaws = await progressPendingLaws(sessionId, taps);

    // Get FRESH pending laws status after progression
    const pendingLaws = await sql`
      SELECT * FROM pending_laws WHERE session_id = ${sessionId}
    `;

    // Check for random events and rebel attacks
    let eventTriggered = null;
    let donationReceived = null;
    const tapsSinceLastEvent = newTotalTaps % 75; // Changed from 30 to 75 for less frequency

    // Check for donation (separate from other events)
    if (Math.random() < 0.08) {
      // 8% chance per tap for any donation
      donationReceived = getRandomDonation();
      if (donationReceived) {
        // Add donation to money
        await sql`
          UPDATE game_sessions 
          SET money = money + ${donationReceived.amount}
          WHERE id = ${sessionId}
        `;
      }
    }

    if (tapsSinceLastEvent < taps && Math.random() < 0.4) {
      // Get current population data to check rebel status
      const [currentPopulation] = await sql`
        SELECT * FROM population_classes WHERE session_id = ${sessionId}
      `;

      // Calculate average population happiness (excluding rebels)
      const avgHappiness =
        ((currentPopulation.working_class_popularity || 50) +
          (currentPopulation.middle_class_popularity || 50) +
          (currentPopulation.high_class_popularity || 50) +
          (currentPopulation.poverty_class_popularity || 50)) /
        4;

      // Adjust rebel popularity based on general happiness (inverted logic)
      const targetRebelPopularity = Math.max(
        10,
        Math.min(90, 100 - avgHappiness),
      );
      const currentRebelPopularity = currentPopulation.rebels_popularity || 80;

      // Gradually adjust rebel popularity towards target
      const rebelAdjustment = Math.round(
        (targetRebelPopularity - currentRebelPopularity) * 0.1,
      );
      if (Math.abs(rebelAdjustment) > 0) {
        await sql`
          UPDATE population_classes 
          SET rebels_popularity = GREATEST(10, LEAST(90, rebels_popularity + ${rebelAdjustment}))
          WHERE session_id = ${sessionId}
        `;
      }

      // Check for rebel attacks (when rebel popularity > 60% and have military)
      if (
        currentRebelPopularity > 60 &&
        (militaryData?.total_strength || 0) > 0 &&
        Math.random() < 0.3
      ) {
        // Rebel attack!
        const availableAttacks = Object.entries(REBEL_ATTACKS);
        const [attackKey, attack] =
          availableAttacks[Math.floor(Math.random() * availableAttacks.length)];

        // Apply military losses
        const militaryLoss = Math.min(
          attack.militaryCost,
          militaryData?.total_strength || 0,
        );
        if (militaryLoss > 0) {
          await sql`
            UPDATE military 
            SET total_strength = GREATEST(0, total_strength - ${militaryLoss})
            WHERE session_id = ${sessionId}
          `;
        }

        // Apply money losses
        if (attack.moneyCost && session.money >= attack.moneyCost) {
          await sql`
            UPDATE game_sessions 
            SET money = GREATEST(0, money - ${attack.moneyCost})
            WHERE id = ${sessionId}
          `;
        }

        // Apply popularity losses if specified
        if (attack.popularityLoss) {
          const updates = [];
          const values = [];
          let paramCount = 1;

          Object.entries(attack.popularityLoss).forEach(([key, change]) => {
            updates.push(
              `${key} = GREATEST(0, LEAST(100, ${key} + $${paramCount}))`,
            );
            values.push(change);
            paramCount++;
          });

          if (updates.length > 0) {
            const updateQuery = `
              UPDATE population_classes 
              SET ${updates.join(", ")}
              WHERE session_id = $${paramCount}
            `;
            values.push(sessionId);
            await sql(updateQuery, values);
          }
        }

        // Reduce rebel activity after successful military response
        await sql`
          UPDATE population_classes 
          SET rebels_popularity = GREATEST(10, rebels_popularity - 15)
          WHERE session_id = ${sessionId}
        `;

        eventTriggered = {
          ...attack,
          id: attackKey,
          militaryLoss,
          moneyCost: attack.moneyCost,
        };
      } else {
        // Regular events
        // 60% chance for popularity event, 40% chance for law proposal
        if (Math.random() < 0.6) {
          const randomEvents = await getRandomEvents();
          const selectedEvent =
            randomEvents[Math.floor(Math.random() * randomEvents.length)];

          if (selectedEvent && selectedEvent.effects.popularity) {
            // Apply popularity effects immediately
            const updates = [];
            const values = [];
            let paramCount = 1;

            Object.entries(selectedEvent.effects.popularity).forEach(
              ([key, change]) => {
                updates.push(
                  `${key} = GREATEST(0, LEAST(100, ${key} + $${paramCount}))`,
                );
                values.push(change);
                paramCount++;
              },
            );

            if (updates.length > 0) {
              const updateQuery = `
                UPDATE population_classes 
                SET ${updates.join(", ")}
                WHERE session_id = $${paramCount}
              `;
              values.push(sessionId);
              await sql(updateQuery, values);
            }

            eventTriggered = selectedEvent;
          }
        } else {
          const availableLaws = await getAvailableLawsForEvents(sessionId);
          if (availableLaws.length > 0) {
            eventTriggered =
              availableLaws[Math.floor(Math.random() * availableLaws.length)];
          }
        }
      }
    }

    // Get updated session data after all changes including pending laws
    const [finalSession] = await sql`
      SELECT gs.*, c.economy_bonus, c.military_bonus, c.stability_bonus, c.name as country_name, c.flag_emoji
      FROM game_sessions gs
      LEFT JOIN countries c ON gs.country_id = c.id
      WHERE gs.id = ${sessionId}
    `;

    const [population] = await sql`
      SELECT * FROM population_classes WHERE session_id = ${sessionId}
    `;

    const [military] = await sql`
      SELECT * FROM military WHERE session_id = ${sessionId}
    `;

    const territories = await sql`
      SELECT * FROM territories WHERE session_id = ${sessionId}
    `;

    return Response.json({
      success: true,
      session: {
        ...finalSession,
        tap_value: finalTapValue, // Return the CALCULATED tap value with all bonuses applied
        population,
        military,
        territories,
        pendingLaws, // Include pending laws in response
      },
      moneyEarned,
      yearChanged,
      newYear,
      eventTriggered,
      enactedLaws,
      donationReceived,
    });
  } catch (error) {
    console.error("Error processing tap:", error);
    return Response.json({ error: "Failed to process tap" }, { status: 500 });
  }
}
