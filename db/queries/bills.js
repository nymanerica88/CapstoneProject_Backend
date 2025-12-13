import db from "#db/client";

export async function createBill({
  owner_user_id,
  ref_num,
  type,
  total,
  is_paid = false,
}) {
  try {
    const sql = `
        INSERT INTO bills (owner_user_id, ref_num, type, total, is_paid)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *     
        `;

    const values = [owner_user_id, ref_num, type, total, is_paid];
    const {
      rows: [bill],
    } = await db.query(sql, values);
    return bill;
  } catch (error) {
    console.error(`Error creating new bill`, error);
    throw error;
  }
}
