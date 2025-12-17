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

export async function getBillSplits(bill_id) {
  try {
    const sql = `
    SELECT guests.id, guests.guest_name, split_expenses.amount_owed
    FROM split_expenses
    JOIN guests ON guests.id = split_expenses.guest_id
    WHERE split_expenses.bill_id = $1
    `;
    const values = [bill_id];
    const { rows: bill_splits } = await db.query(sql, values);
    return bill_splits;
  } catch (error) {
    console.error(`Error retrieving bill splits`, error);
    throw error;
  }
}
