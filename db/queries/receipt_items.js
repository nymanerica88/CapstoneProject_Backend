import db from "#db/client";

export async function createReceiptItem({
  bill_id,
  guest_id,
  item_name,
  quantity,
  price,
}) {
  try {
    const sql = `
        INSERT INTO receipt_items (bill_id, guest_id, item_name, quantity, price)
        VALUES($1, $2, $3, $4, $5)
        RETURNING *   
        `;

    const values = [bill_id, guest_id, item_name, quantity, price];
    const {
      rows: [item],
    } = await db.query(sql, values);
    return item;
  } catch (error) {
    console.error(`Error creating new item`, error);
    throw error;
  }
}

export async function getItemsForBill(bill_id) {
  try {
    const sql = `
    SELECT receipt_items.item_name, receipt_items.quantity, receipt_items.price, guests.guest_name
    FROM receipt_items
    JOIN guests ON guests.id = receipt_items.guest_id
    WHERE receipt_items.bill_id = $1
    ORDER BY receipt_items.id    
    `;

    const values = [bill_id];
    const { rows: itemsForBill } = await db.query(sql, values);
    return itemsForBill;
  } catch (error) {
    console.error(`Error fetching items for bill ${bill_id}`, error);
    throw error;
  }
}
