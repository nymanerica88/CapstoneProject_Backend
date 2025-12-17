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

export async function getBillById(bill_id, user_id) {
  try {
    const sql = `
    SELECT bills.id, bills.ref_num, bills.type, bills.total, bills.is_paid, bills.created_at
    FROM bills
    WHERE bills.id = $1
    AND bills.owner_user_id = $2
    `;

    const values = [bill_id, user_id];
    const {
      rows: [bill],
    } = await db.query(sql, values);
    return bill;
  } catch (error) {
    console.error(`Error retrieving bill by id`, error);
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

export async function getBillItems(bill_id) {
  try {
    const sql = `
  SELECT
    receipt_items.id,
    receipt_items.item_name, 
    receipt_items.quantity,
    receipt_items.price,
    guests.guest_name
  FROM receipt_items
  JOIN guests ON guests.id = receipt_items.guest_id
  WHERE receipt_items.bill_id = $1   
  `;

    const values = [bill_id];
    const { rows: bill_items } = await db.query(sql, values);
    return bill_items;
  } catch (error) {
    console.error(`Error retrieving bill items`, error);
    throw error;
  }
}

export async function markBillAsPaid(bill_id, user_id) {
  try {
    const sql = `
  UPDATE bills 
  SET is_paid = true
  WHERE id = $1 AND owner_user_id = $2
  RETURNING *
  `;

    const values = [bill_id, user_id];
    const {
      rows: [bill],
    } = await db.query(sql, values);
    return bill;
  } catch (error) {
    console.error(`Error marking bill as paid`, error);
    throw error;
  }
}

export async function deleteBill(bill_id, user_id) {
  try {
    const sql = `
    DELETE FROM bills
    WHERE id = $1 AND owner_user_id = $2
    RETURNING *
    `;

    const values = [bill_id, user_id];
    const {
      rows: [bill],
    } = await db.query(sql, values);
    return bill;
  } catch (error) {
    console.error(`Error deleting bill`, error);
    throw error;
  }
}
