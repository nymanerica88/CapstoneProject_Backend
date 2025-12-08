import db from "#db/client";

export async function createItem({ bill_id, guest_id, name, quantity, price }) {
  try {
    const sql = `
        INSERT INTO items (bill_id, guest_id, name, quantity, price)
        VALUES($1, $2, $3, $4, $5)
        RETURNING *   
        `;

    const values = [bill_id, guest_id, name, quantity, price];
    const {
      rows: [item],
    } = await db.query(sql, values);
    return item;
  } catch (error) {
    console.error(`Error creating new item`, error);
    throw error;
  }
}
