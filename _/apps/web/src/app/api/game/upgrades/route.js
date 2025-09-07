import sql from "@/app/api/utils/sql";

// Available upgrades with their effects
const AVAILABLE_UPGRADES = {
  TAX_EFFICIENCY: {
    name: 'Tax Collection Efficiency',
    description: 'Improve tax collection systems to increase income per tap',
    baseMultiplier: 1.2,
    baseCost: 10000,
    costMultiplier: 2.0,
    maxLevel: 10
  },
  DIGITAL_ECONOMY: {
    name: 'Digital Economy Initiative',
    description: 'Modernize your economy with digital infrastructure',
    baseMultiplier: 1.15,
    baseCost: 25000,
    costMultiplier: 2.5,
    maxLevel: 8
  },
  ECONOMIC_STIMULUS: {
    name: 'Economic Stimulus Package',
    description: 'Boost economic activity through government spending',
    baseMultiplier: 1.3,
    baseCost: 50000,
    costMultiplier: 3.0,
    maxLevel: 5
  },
  TRADE_ROUTES: {
    name: 'International Trade Routes',
    description: 'Establish profitable trade connections worldwide',
    baseMultiplier: 1.25,
    baseCost: 75000,
    costMultiplier: 2.8,
    maxLevel: 6
  },
  FINANCIAL_SECTOR: {
    name: 'Financial Sector Development',
    description: 'Build a strong banking and financial system',
    baseMultiplier: 1.4,
    baseCost: 100000,
    costMultiplier: 3.5,
    maxLevel: 4
  }
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return Response.json({ error: 'Session ID required' }, { status: 400 });
    }
    
    // Get current upgrades for this session
    const currentUpgrades = await sql`
      SELECT * FROM upgrades WHERE session_id = ${sessionId}
    `;
    
    // Get current session money
    const [session] = await sql`
      SELECT money FROM game_sessions WHERE id = ${sessionId}
    `;
    
    // Calculate available upgrades with costs and current levels
    const availableUpgrades = Object.entries(AVAILABLE_UPGRADES).map(([key, upgrade]) => {
      const currentUpgrade = currentUpgrades.find(u => u.upgrade_type === key);
      const currentLevel = currentUpgrade?.level || 0;
      const nextLevel = currentLevel + 1;
      
      // Calculate cost for next level
      const nextCost = currentLevel >= upgrade.maxLevel 
        ? null 
        : Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
      
      // Calculate current total multiplier
      const totalMultiplier = currentLevel === 0 
        ? 1.0 
        : Math.pow(upgrade.baseMultiplier, currentLevel);
      
      return {
        id: key,
        ...upgrade,
        currentLevel,
        nextLevel,
        nextCost,
        totalMultiplier,
        maxedOut: currentLevel >= upgrade.maxLevel,
        canAfford: nextCost ? (session?.money || 0) >= nextCost : false
      };
    });
    
    return Response.json({
      availableUpgrades,
      currentMoney: session?.money || 0
    });
  } catch (error) {
    console.error('Error fetching upgrades:', error);
    return Response.json({ error: 'Failed to fetch upgrades' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { sessionId, upgradeType } = await request.json();
    
    if (!sessionId || !upgradeType) {
      return Response.json({ error: 'Session ID and upgrade type required' }, { status: 400 });
    }
    
    const upgrade = AVAILABLE_UPGRADES[upgradeType];
    if (!upgrade) {
      return Response.json({ error: 'Invalid upgrade type' }, { status: 400 });
    }
    
    // Get current session and upgrade level
    const [session] = await sql`
      SELECT * FROM game_sessions WHERE id = ${sessionId}
    `;
    
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    
    const [currentUpgrade] = await sql`
      SELECT * FROM upgrades WHERE session_id = ${sessionId} AND upgrade_type = ${upgradeType}
    `;
    
    const currentLevel = currentUpgrade?.level || 0;
    
    // Check if upgrade is maxed out
    if (currentLevel >= upgrade.maxLevel) {
      return Response.json({ error: 'Upgrade already at maximum level' }, { status: 400 });
    }
    
    // Calculate cost for next level
    const upgradeCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    
    // Check if player has enough money
    if (session.money < upgradeCost) {
      return Response.json({ 
        error: 'Insufficient funds',
        required: upgradeCost,
        current: session.money
      }, { status: 400 });
    }
    
    const newLevel = currentLevel + 1;
    const newMultiplier = Math.pow(upgrade.baseMultiplier, newLevel);
    
    // Calculate new tap value (multiply current by the additional multiplier for this level)
    const additionalMultiplier = upgrade.baseMultiplier;
    const newTapValue = Math.floor(session.tap_value * additionalMultiplier);
    
    // Use transaction to ensure consistency
    const results = await sql.transaction([
      sql`
        UPDATE game_sessions 
        SET 
          money = money - ${upgradeCost},
          tap_value = ${newTapValue}
        WHERE id = ${sessionId}
        RETURNING money, tap_value
      `,
      currentUpgrade ? sql`
        UPDATE upgrades 
        SET 
          level = ${newLevel},
          tap_multiplier = ${newMultiplier}
        WHERE session_id = ${sessionId} AND upgrade_type = ${upgradeType}
        RETURNING *
      ` : sql`
        INSERT INTO upgrades (session_id, upgrade_type, upgrade_name, level, tap_multiplier)
        VALUES (${sessionId}, ${upgradeType}, ${upgrade.name}, ${newLevel}, ${newMultiplier})
        RETURNING *
      `
    ]);
    
    const [updatedSession, updatedUpgrade] = results;
    
    return Response.json({
      success: true,
      message: `${upgrade.name} upgraded to level ${newLevel}!`,
      upgrade: {
        ...upgrade,
        currentLevel: newLevel,
        totalMultiplier: newMultiplier
      },
      costPaid: upgradeCost,
      newTapValue,
      session: {
        id: sessionId,
        money: updatedSession[0]?.money || 0,
        tap_value: updatedSession[0]?.tap_value || 0
      }
    });
  } catch (error) {
    console.error('Error purchasing upgrade:', error);
    return Response.json({ error: 'Failed to purchase upgrade' }, { status: 500 });
  }
}