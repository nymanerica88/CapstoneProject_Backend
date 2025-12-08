import db from "#db/client";

export async function createBill({
  guest_id,
  ref_num,
  receipt = null,
  type,
  total,
  is_paid = false,
}) {
  try {
    const sql = `
        INSERT INTO bills (guest_id, ref_num, receipt, type, total, is_paid)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *     
        `;

    const values = [guest_id, ref_num, receipt, type, total, is_paid];
    const {
      rows: [bill],
    } = await db.query(sql, values);
    return bill;
  } catch (error) {
    console.error(`Error creating new bill`, error);
    throw error;
  }
}
