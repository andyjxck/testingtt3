import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const countries = await sql`
      SELECT * FROM countries ORDER BY name ASC
    `;
    
    return Response.json({ countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return Response.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}