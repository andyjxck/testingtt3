/**
 * Calculate the total tap value including all bonuses
 */
export async function calculateTapValue(sessionId, sql) {
  // Get current session base tap value
  const [session] = await sql`
    SELECT tap_value FROM game_sessions WHERE id = ${sessionId}
  `;
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  // Get military strength
  const [military] = await sql`
    SELECT total_strength FROM military WHERE session_id = ${sessionId}
  `;
  
  // Base tap value from upgrades and other sources
  const baseTapValue = session.tap_value || 1;
  
  // Military strength bonus: 0.5 per strength point
  const militaryBonus = Math.floor((military?.total_strength || 0) * 0.5);
  
  return {
    baseTapValue,
    militaryBonus,
    totalTapValue: baseTapValue + militaryBonus
  };
}

/**
 * Update session tap value to include all bonuses
 */
export async function updateSessionTapValue(sessionId, sql) {
  const { totalTapValue } = await calculateTapValue(sessionId, sql);
  
  await sql`
    UPDATE game_sessions 
    SET tap_value = ${totalTapValue}
    WHERE id = ${sessionId}
  `;
  
  return totalTapValue;
}