import db from "#db/client";

export async function createGuest({
  user_id = null,
  guest_name,
  is_user = false,
}) {
  try {
    const sql = `
        INSERT INTO guests (user_id, guest_name, is_user)
        VALUES ($1, $2, $3)
        RETURNING *
        `;

    const values = [user_id, guest_name, is_user];
    const {
      rows: [guest],
    } = await db.query(sql, values);
    return guest;
  } catch (error) {
    console.error("Error creating new guest", error);
    throw error;
  }
}
