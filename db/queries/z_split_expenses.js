import db from "#db/client";

export async function createSplitExpense({ bill_id, guest_id, amount_owed }) {
  try {
    const sql = `
        INSERT INTO split_expenses (bill_id, guest_id, amount_owed)
        VALUES ($1, $2, $3)
        RETURNING *        
        `;
    const values = [bill_id, guest_id, amount_owed];
    const {
      rows: [expense],
    } = await db.query(sql, values);
    return expense;
  } catch (error) {
    console.error(`Error creating split expense`, error);
    throw error;
  }
}
