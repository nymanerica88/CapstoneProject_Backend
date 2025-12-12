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

export async function getBillsForGuestProfile(guest_id) {
  try {
    const sql = `
    SELECT 
      bills.ref_num, 
      split_expenses.amount_owed 
    FROM split_expenses
    JOIN bills ON split_expenses.bill_id = bills.id
    WHERE split_expenses.guest_id = $1
    ORDER BY bills.id
    `;
    const values = [guest_id];
    const { rows: guestBills } = await db.query(sql, values);
    return guestBills;
  } catch (error) {
    console.error(`Error fetching bills for guest ${guest_id}`, error);
    throw error;
  }
}

// export async function getBillsForGuest(guest_id) {
//   try {
//     const sql = `
//     SELECT bills.id AS bill_id, bills.ref_num, bills.total, bills.type, bills.is_paid, split_expenses.amount_owed
//     FROM split_expenses
//     JOIN bills ON split_expenses.bill_id = bills.id
//     WHERE split_expenses.guest_id = $1
//     ORDER BY bills.id
//     `;
//     const values = [guest_id];
//     const { rows: guestBills } = await db.query(sql, values);
//     return guestBills;
//   } catch (error) {
//     console.error(`Error fetching bills for guest ${guest_id}`, error);
//     throw error;
//   }
// }

export async function getTotalOwedForGuest(guest_id) {
  try {
    const sql = `
    SELECT COALESCE(SUM(amount_owed),0) AS total_owed
    FROM split_expenses
    WHERE guest_id = $1
    `;
    const values = [guest_id];
    const {
      rows: [guestTotal],
    } = await db.query(sql, values);
    return guestTotal.total_owed;
  } catch (error) {
    console.error(`Error fetching total for guest ${guest_id}`, error);
    throw error;
  }
}
