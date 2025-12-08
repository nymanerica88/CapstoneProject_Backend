import db from "#db/client";

export async function addItemToBill({ bill_id, item_id }) {
  try {
    const sql = `
        INSERT INTO items_on_bills (bill_id, item_id)
        VALUES ($1, $2)
        RETURNING *
        `;
    const values = [bill_id, item_id];
    const {
      rows: [itemAdded],
    } = await db.query(sql, values);
    return itemAdded;
  } catch (error) {
    console.error(`Error adding item to bill`, error);
    throw error;
  }
}
