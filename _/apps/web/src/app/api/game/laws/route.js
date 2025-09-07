import sql from "@/app/api/utils/sql";

// Available laws that can be enacted
const AVAILABLE_LAWS = {
  // ========== ECONOMIC LAWS (POSITIVE) ==========
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
  UNIVERSAL_BASIC_INCOME: {
    name: "Universal Basic Income",
    description: "Provide monthly payments to all citizens to reduce poverty",
    tapsRequired: 300,
    effects: {
      economy: -0.25,
      popularity: {
        working_class_popularity: 30,
        poverty_class_popularity: 40,
        middle_class_popularity: 15,
        high_class_popularity: -30,
        rebels_popularity: -20,
      },
    },
  },
  SMALL_BUSINESS_SUPPORT: {
    name: "Small Business Support Package",
    description: "Tax breaks and grants for small businesses and startups",
    tapsRequired: 120,
    effects: {
      economy: 0.15,
      popularity: {
        working_class_popularity: 15,
        middle_class_popularity: 25,
        high_class_popularity: 10,
        poverty_class_popularity: 5,
      },
    },
  },
  WEALTH_TAX: {
    name: "Progressive Wealth Tax",
    description: "Higher taxes on the wealthy to fund public services",
    tapsRequired: 180,
    effects: {
      economy: -0.1,
      popularity: {
        working_class_popularity: 25,
        poverty_class_popularity: 30,
        middle_class_popularity: 10,
        high_class_popularity: -35,
      },
    },
  },
  BANKING_REGULATION: {
    name: "Banking Reform Act",
    description:
      "Strict regulations on financial institutions to prevent crashes",
    tapsRequired: 200,
    effects: {
      economy: -0.05,
      popularity: {
        working_class_popularity: 20,
        middle_class_popularity: 25,
        poverty_class_popularity: 15,
        high_class_popularity: -20,
      },
    },
  },
  CRYPTO_REGULATION: {
    name: "Cryptocurrency Regulation",
    description: "Regulate digital currencies for consumer protection",
    tapsRequired: 140,
    effects: {
      economy: 0.03,
      popularity: {
        working_class_popularity: 5,
        middle_class_popularity: 15,
        high_class_popularity: -10,
        rebels_popularity: 10,
      },
    },
  },

  // ========== SOCIAL WELFARE LAWS ==========
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
  FREE_COLLEGE: {
    name: "Free College Tuition",
    description: "Make higher education free for all qualified students",
    tapsRequired: 250,
    effects: {
      economy: -0.15,
      popularity: {
        working_class_popularity: 20,
        middle_class_popularity: 30,
        poverty_class_popularity: 35,
        high_class_popularity: -25,
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
  ELDERLY_CARE: {
    name: "Senior Care Enhancement",
    description: "Improve healthcare and support for elderly citizens",
    tapsRequired: 160,
    effects: {
      economy: -0.08,
      popularity: {
        working_class_popularity: 15,
        middle_class_popularity: 20,
        poverty_class_popularity: 25,
        high_class_popularity: -5,
      },
    },
  },
  DISABILITY_SUPPORT: {
    name: "Disability Rights Act",
    description: "Enhance support and accessibility for disabled citizens",
    tapsRequired: 130,
    effects: {
      economy: -0.06,
      popularity: {
        working_class_popularity: 10,
        middle_class_popularity: 15,
        poverty_class_popularity: 20,
        high_class_popularity: 5,
      },
    },
  },

  // ========== INFRASTRUCTURE & ENVIRONMENT ==========
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
  HIGH_SPEED_RAIL: {
    name: "High-Speed Rail Network",
    description: "Build modern rail connections between major cities",
    tapsRequired: 280,
    effects: {
      economy: 0.08,
      popularity: {
        working_class_popularity: 15,
        middle_class_popularity: 20,
        poverty_class_popularity: 8,
        high_class_popularity: 5,
      },
    },
  },
  CARBON_TAX: {
    name: "Carbon Emissions Tax",
    description: "Tax companies based on their carbon footprint",
    tapsRequired: 150,
    effects: {
      economy: -0.12,
      popularity: {
        working_class_popularity: 8,
        middle_class_popularity: 20,
        high_class_popularity: -25,
        rebels_popularity: -5,
      },
    },
  },
  PLASTIC_BAN: {
    name: "Single-Use Plastic Ban",
    description: "Ban disposable plastics to protect the environment",
    tapsRequired: 100,
    effects: {
      economy: -0.03,
      popularity: {
        working_class_popularity: 5,
        middle_class_popularity: 15,
        high_class_popularity: -5,
        rebels_popularity: -8,
      },
    },
  },
  ELECTRIC_VEHICLE_MANDATE: {
    name: "Electric Vehicle Mandate",
    description: "Require all new cars to be electric by 2035",
    tapsRequired: 200,
    effects: {
      economy: -0.08,
      popularity: {
        working_class_popularity: -5,
        middle_class_popularity: 15,
        high_class_popularity: -15,
        rebels_popularity: 5,
      },
    },
  },

  // ========== GOVERNANCE & REFORM ==========
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
  GOVERNMENT_TRANSPARENCY: {
    name: "Government Transparency Act",
    description: "Require all government decisions to be public",
    tapsRequired: 120,
    effects: {
      economy: 0.02,
      popularity: {
        working_class_popularity: 15,
        middle_class_popularity: 20,
        poverty_class_popularity: 10,
        high_class_popularity: -15,
        rebels_popularity: -25,
      },
    },
  },
  ELECTORAL_REFORM: {
    name: "Electoral Reform Package",
    description: "Reform voting systems to be more fair and accessible",
    tapsRequired: 180,
    effects: {
      economy: -0.02,
      popularity: {
        working_class_popularity: 20,
        middle_class_popularity: 25,
        poverty_class_popularity: 15,
        high_class_popularity: -10,
        rebels_popularity: -30,
      },
    },
  },
  LOBBYING_BAN: {
    name: "Corporate Lobbying Ban",
    description: "Prohibit corporate influence on government decisions",
    tapsRequired: 160,
    effects: {
      economy: -0.05,
      popularity: {
        working_class_popularity: 25,
        middle_class_popularity: 20,
        poverty_class_popularity: 20,
        high_class_popularity: -30,
      },
    },
  },

  // ========== TECHNOLOGY & INNOVATION ==========
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
  INTERNET_FREEDOM: {
    name: "Internet Freedom Act",
    description: "Protect net neutrality and online privacy rights",
    tapsRequired: 110,
    effects: {
      economy: 0.02,
      popularity: {
        working_class_popularity: 10,
        middle_class_popularity: 20,
        high_class_popularity: -5,
        rebels_popularity: -15,
      },
    },
  },
  DIGITAL_PRIVACY: {
    name: "Digital Privacy Protection",
    description: "Strict regulations on data collection by tech companies",
    tapsRequired: 130,
    effects: {
      economy: -0.03,
      popularity: {
        working_class_popularity: 15,
        middle_class_popularity: 25,
        high_class_popularity: -20,
        rebels_popularity: -10,
      },
    },
  },
  AI_REGULATION: {
    name: "Artificial Intelligence Oversight",
    description: "Regulate AI development to ensure safety and ethics",
    tapsRequired: 150,
    effects: {
      economy: -0.04,
      popularity: {
        working_class_popularity: 8,
        middle_class_popularity: 15,
        high_class_popularity: -15,
        rebels_popularity: -5,
      },
    },
  },

  // ========== CONTROVERSIAL/NEGATIVE LAWS ==========
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
  POLICE_EXPANSION: {
    name: "Police Force Expansion",
    description: "Hire more police officers and increase law enforcement",
    tapsRequired: 120,
    effects: {
      economy: -0.06,
      popularity: {
        working_class_popularity: 5,
        middle_class_popularity: 10,
        poverty_class_popularity: -15,
        high_class_popularity: 15,
        rebels_popularity: 20,
      },
    },
  },
  DRUG_WAR: {
    name: "War on Drugs Escalation",
    description: "Harsh penalties for drug possession and trafficking",
    tapsRequired: 90,
    effects: {
      economy: -0.04,
      popularity: {
        working_class_popularity: -5,
        middle_class_popularity: 5,
        poverty_class_popularity: -20,
        high_class_popularity: 10,
        rebels_popularity: 25,
      },
    },
  },

  // ========== BALANCED/NEUTRAL LAWS ==========
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
  SPACE_PROGRAM: {
    name: "National Space Program",
    description: "Invest in space exploration and satellite technology",
    tapsRequired: 200,
    effects: {
      economy: 0.05,
      popularity: {
        working_class_popularity: 5,
        middle_class_popularity: 15,
        high_class_popularity: 10,
        poverty_class_popularity: -8,
      },
    },
  },
  TRADE_AGREEMENTS: {
    name: "International Trade Deals",
    description: "Negotiate favorable trade agreements with other nations",
    tapsRequired: 180,
    effects: {
      economy: 0.12,
      popularity: {
        working_class_popularity: -5,
        middle_class_popularity: 5,
        high_class_popularity: 20,
        poverty_class_popularity: -10,
      },
    },
  },

  // ========== SPECIFIC REFORM LAWS ==========
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
  RENT_CONTROL: {
    name: "Rent Control Legislation",
    description: "Limit how much landlords can charge for housing",
    tapsRequired: 140,
    effects: {
      economy: -0.08,
      popularity: {
        working_class_popularity: 20,
        poverty_class_popularity: 25,
        middle_class_popularity: 5,
        high_class_popularity: -20,
      },
    },
  },
  WORKER_RIGHTS: {
    name: "Worker Protection Act",
    description: "Strengthen labor unions and worker bargaining power",
    tapsRequired: 160,
    effects: {
      economy: -0.1,
      popularity: {
        working_class_popularity: 30,
        middle_class_popularity: 10,
        poverty_class_popularity: 15,
        high_class_popularity: -25,
      },
    },
  },
  FOUR_DAY_WORKWEEK: {
    name: "Four-Day Work Week",
    description: "Mandate a shorter work week to improve work-life balance",
    tapsRequired: 200,
    effects: {
      economy: -0.15,
      popularity: {
        working_class_popularity: 35,
        middle_class_popularity: 25,
        poverty_class_popularity: 10,
        high_class_popularity: -30,
      },
    },
  },
  GAMER_BILL_OF_RIGHTS: {
    name: "Gamer Bill of Rights",
    description:
      "Protect gamers from predatory monetization and ensure fair play",
    tapsRequired: 80,
    effects: {
      economy: -0.02,
      popularity: {
        working_class_popularity: 5,
        middle_class_popularity: 10,
        high_class_popularity: -5,
        rebels_popularity: -5,
      },
    },
  },
  SOCIAL_MEDIA_TAX: {
    name: "Social Media Platform Tax",
    description: "Tax large social media companies for societal impact",
    tapsRequired: 110,
    effects: {
      economy: 0.03,
      popularity: {
        working_class_popularity: 10,
        middle_class_popularity: 15,
        high_class_popularity: -10,
        rebels_popularity: -8,
      },
    },
  },
  MENTAL_HEALTH_FUNDING: {
    name: "Mental Health Initiative",
    description: "Massive funding increase for mental health services",
    tapsRequired: 150,
    effects: {
      economy: -0.08,
      popularity: {
        working_class_popularity: 15,
        middle_class_popularity: 20,
        poverty_class_popularity: 25,
        high_class_popularity: 5,
      },
    },
  },
  FOOD_SECURITY: {
    name: "National Food Security Program",
    description: "Ensure everyone has access to nutritious, affordable food",
    tapsRequired: 170,
    effects: {
      economy: -0.1,
      popularity: {
        working_class_popularity: 20,
        poverty_class_popularity: 35,
        middle_class_popularity: 10,
        high_class_popularity: -8,
      },
    },
  },
  URBAN_FARMING: {
    name: "Urban Agriculture Initiative",
    description: "Promote vertical farms and local food production in cities",
    tapsRequired: 130,
    effects: {
      economy: 0.03,
      popularity: {
        working_class_popularity: 8,
        middle_class_popularity: 15,
        poverty_class_popularity: 12,
        high_class_popularity: 2,
      },
    },
  },
  CULTURAL_PRESERVATION: {
    name: "Cultural Heritage Protection",
    description: "Preserve traditional arts, languages, and cultural sites",
    tapsRequired: 100,
    effects: {
      economy: -0.03,
      popularity: {
        working_class_popularity: 8,
        middle_class_popularity: 12,
        poverty_class_popularity: 5,
        high_class_popularity: 8,
        rebels_popularity: -5,
      },
    },
  },
  STARTUP_VISAS: {
    name: "Entrepreneur Visa Program",
    description: "Fast-track visas for foreign entrepreneurs and investors",
    tapsRequired: 120,
    effects: {
      economy: 0.08,
      popularity: {
        working_class_popularity: -5,
        middle_class_popularity: 5,
        high_class_popularity: 15,
        rebels_popularity: 5,
      },
    },
  },
  NUCLEAR_PHASE_OUT: {
    name: "Nuclear Energy Phase-Out",
    description: "Gradually shut down nuclear plants in favor of renewables",
    tapsRequired: 220,
    effects: {
      economy: -0.08,
      popularity: {
        working_class_popularity: 5,
        middle_class_popularity: 15,
        high_class_popularity: -12,
        rebels_popularity: -10,
      },
    },
  },
  GAMBLING_REGULATION: {
    name: "Gambling Industry Reform",
    description: "Strict regulations on casinos and online gambling",
    tapsRequired: 110,
    effects: {
      economy: -0.04,
      popularity: {
        working_class_popularity: 10,
        middle_class_popularity: 15,
        poverty_class_popularity: 20,
        high_class_popularity: -15,
      },
    },
  },
  ANIMAL_WELFARE: {
    name: "Animal Welfare Enhancement",
    description: "Strengthen protections for domestic and farm animals",
    tapsRequired: 90,
    effects: {
      economy: -0.03,
      popularity: {
        working_class_popularity: 8,
        middle_class_popularity: 18,
        poverty_class_popularity: 5,
        high_class_popularity: -5,
      },
    },
  },
  OCEAN_CLEANUP: {
    name: "Ocean Cleanup Initiative",
    description: "Massive effort to remove plastic pollution from oceans",
    tapsRequired: 180,
    effects: {
      economy: -0.06,
      popularity: {
        working_class_popularity: 10,
        middle_class_popularity: 20,
        poverty_class_popularity: 8,
        high_class_popularity: 5,
        rebels_popularity: -5,
      },
    },
  },
  ALGORITHMIC_ACCOUNTABILITY: {
    name: "Algorithm Transparency Act",
    description: "Require tech companies to explain their AI decision-making",
    tapsRequired: 140,
    effects: {
      economy: -0.03,
      popularity: {
        working_class_popularity: 5,
        middle_class_popularity: 15,
        high_class_popularity: -15,
        rebels_popularity: -5,
      },
    },
  },
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "Session ID required" }, { status: 400 });
    }

    // Get pending laws
    const pendingLaws = await sql`
      SELECT * FROM pending_laws WHERE session_id = ${sessionId}
      ORDER BY created_at DESC
    `;

    // Get active laws
    const activeLaws = await sql`
      SELECT * FROM active_laws WHERE session_id = ${sessionId}
      ORDER BY enacted_year DESC
    `;

    // Get available laws (not currently pending or active)
    const pendingLawNames = pendingLaws.map((l) => l.law_name);
    const activeLawNames = activeLaws.map((l) => l.law_name);

    const availableLaws = Object.entries(AVAILABLE_LAWS)
      .filter(
        ([key, law]) =>
          !pendingLawNames.includes(law.name) &&
          !activeLawNames.includes(law.name),
      )
      .map(([key, law]) => ({
        id: key,
        ...law,
      }));

    return Response.json({
      pendingLaws,
      activeLaws,
      availableLaws,
    });
  } catch (error) {
    console.error("Error fetching laws data:", error);
    return Response.json(
      { error: "Failed to fetch laws data" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { sessionId, action, lawId, lawType } = await request.json();

    if (!sessionId || !action) {
      return Response.json(
        { error: "Session ID and action required" },
        { status: 400 },
      );
    }

    if (action === "propose") {
      // Propose a new law
      if (!lawType) {
        return Response.json(
          { error: "Law type required for proposing" },
          { status: 400 },
        );
      }

      const law = AVAILABLE_LAWS[lawType];
      if (!law) {
        return Response.json({ error: "Invalid law type" }, { status: 400 });
      }

      // Check if law is already pending or active
      const [existingPending] = await sql`
        SELECT id FROM pending_laws WHERE session_id = ${sessionId} AND law_name = ${law.name}
      `;

      const [existingActive] = await sql`
        SELECT id FROM active_laws WHERE session_id = ${sessionId} AND law_name = ${law.name}
      `;

      if (existingPending || existingActive) {
        return Response.json(
          { error: "Law already exists or is pending" },
          { status: 400 },
        );
      }

      // Create pending law
      const [pendingLaw] = await sql`
        INSERT INTO pending_laws (session_id, law_name, law_description, effects, taps_remaining)
        VALUES (${sessionId}, ${law.name}, ${law.description}, ${JSON.stringify(law.effects)}, ${law.tapsRequired})
        RETURNING *
      `;

      return Response.json({
        success: true,
        message: `${law.name} has been proposed! It will take ${law.tapsRequired} taps to implement.`,
        pendingLaw,
      });
    } else if (action === "cancel") {
      // Cancel a pending law
      if (!lawId) {
        return Response.json(
          { error: "Law ID required for canceling" },
          { status: 400 },
        );
      }

      const [canceledLaw] = await sql`
        DELETE FROM pending_laws 
        WHERE id = ${lawId} AND session_id = ${sessionId}
        RETURNING *
      `;

      if (!canceledLaw) {
        return Response.json(
          { error: "Pending law not found" },
          { status: 404 },
        );
      }

      return Response.json({
        success: true,
        message: `${canceledLaw.law_name} has been canceled.`,
      });
    } else if (action === "repeal") {
      // Repeal an active law
      if (!lawId) {
        return Response.json(
          { error: "Law ID required for repealing" },
          { status: 400 },
        );
      }

      const [repealedLaw] = await sql`
        DELETE FROM active_laws 
        WHERE id = ${lawId} AND session_id = ${sessionId}
        RETURNING *
      `;

      if (!repealedLaw) {
        return Response.json(
          { error: "Active law not found" },
          { status: 404 },
        );
      }

      // Reverse the economic effects
      if (repealedLaw.economy_effect) {
        const [session] =
          await sql`SELECT tap_value FROM game_sessions WHERE id = ${sessionId}`;
        const newTapValue = Math.max(
          1,
          Math.floor(session.tap_value / (1 + repealedLaw.economy_effect)),
        );

        await sql`
          UPDATE game_sessions 
          SET tap_value = ${newTapValue}
          WHERE id = ${sessionId}
        `;
      }

      return Response.json({
        success: true,
        message: `${repealedLaw.law_name} has been repealed.`,
      });
    } else {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing law action:", error);
    return Response.json(
      { error: "Failed to process law action" },
      { status: 500 },
    );
  }
}

// This will be called from the tap API to progress pending laws
export async function progressPendingLaws(sessionId, taps = 1) {
  try {
    // Get all pending laws
    const pendingLaws = await sql`
      SELECT * FROM pending_laws WHERE session_id = ${sessionId}
    `;

    const enactedLaws = [];

    for (const law of pendingLaws) {
      const newTapsRemaining = Math.max(0, law.taps_remaining - taps);

      if (newTapsRemaining === 0) {
        // Law is ready to be enacted
        const effects =
          typeof law.effects === "string"
            ? JSON.parse(law.effects)
            : law.effects;

        // Get current session for year
        const [session] =
          await sql`SELECT current_year FROM game_sessions WHERE id = ${sessionId}`;

        // Move to active laws
        await sql`
          INSERT INTO active_laws (session_id, law_name, law_description, economy_effect, popularity_effects, enacted_year)
          VALUES (${sessionId}, ${law.law_name}, ${law.law_description}, ${effects.economy || 0}, ${JSON.stringify(effects.popularity || {})}, ${session.current_year})
        `;

        // Apply economic effects
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
      }
    }

    return enactedLaws;
  } catch (error) {
    console.error("Error progressing pending laws:", error);
    return [];
  }
}
