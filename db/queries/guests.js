import db from "#db/client";

export async function createGuest({ user_id, guest_name }) {
  try {
    const sql = `
        INSERT INTO guests (user_id, guest_name)
        VALUES ($1, $2)
        RETURNING *
        `;

    const values = [user_id, guest_name];
    const {
      rows: [guest],
    } = await db.query(sql, values);
    return guest;
  } catch (error) {
    console.error("Error creating new guest", error);
    throw error;
  }
}
