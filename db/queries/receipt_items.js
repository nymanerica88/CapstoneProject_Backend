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
        INSERT INTO itemized_receipt (bill_id, guest_id, item_name, quantity, price)
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
    SELECT itemized_receipt.item_name, itemized_receipt.quantity, itemized_receipt.price, guests.guest_name
    FROM itemized_receipt
    JOIN guests ON guests.id = itemized_receipt.guest_id
    WHERE itemized_receipt.bill_id = $1
    ORDER BY itemized_receipt.id    
    `;

    const values = [bill_id];
    const { rows: itemsForBill } = await db.query(sql, values);
    return itemsForBill;
  } catch (error) {
    console.error(`Error fetching items for bill ${bill_id}`, error);
    throw error;
  }
}
