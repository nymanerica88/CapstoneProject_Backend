import express from "express";
import db from "#db/client";
import requireUser from "#middleware/requireUser";
import { createBill } from "#db/queries/bills";
import { createGuest } from "#db/queries/guests";
import { createReceiptItem } from "#db/queries/receipt_items";
import { createSplitExpense } from "#db/queries/split_expenses";

const billsRouter = express.Router();

billsRouter.post("/", requireUser, async (req, res, next) => {
  const { ref_num, total, split_type, guests, items, percentages } = req.body;

  try {
    await db.query("BEGIN");

    const bill = await createBill({
      owner_user_id: req.user.id,
      ref_num,
      type: split_type,
      total,
    });

    const createdGuests = [];
    for (const guestName of guests) {
      const guest = await createGuest({
        user_id: null,
        guest_name: guestName,
        is_user: false,
      });
      createdGuests.push(guest);
    }

    if (split_type === "even") {
      const amount = total / createdGuests.length;
      if (!createdGuests.length) {
        throw new Error("At lease one guest is required");
      }

      for (const guest of createdGuests) {
        await createSplitExpense({
          bill_id: bill.id,
          guest_id: guest.id,
          amount_owed: amount,
        });
      }
    }

    if (split_type === "per_item") {
      for (const item of items) {
        await createReceiptItem({
          bill_id: bill.id,
          guest_id: item.guest_id,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price,
        });
      }

      const guestTotals = {};

      for (const item of items) {
        const itemTotal = item.quantity * item.price;

        if (!guestTotals[item.guest_id]) {
          guestTotals[item.guest_id] = 0;
        }

        guestTotals[item.guest_id] += itemTotal;
      }

      for (const [guest_id, amount_owed] of Object.entries(guestTotals)) {
        await createSplitExpense({
          bill_id: bill.id,
          guest_id: Number(guest_id),
          amount_owed,
        });
      }
    }

    if (split_type === "percentage") {
      for (const entry of percentages) {
        await createSplitExpense({
          bill_id: bill.id,
          guest_id: entry.guest_id,
          amount_owed: total * entry.percent,
        });
      }
    }

    await db.query("COMMIT");
    res.status(201).send({ bill, guests: createdGuests });
  } catch (error) {
    await db.query("ROLLBACK");
    next(error);
  }
});

export default billsRouter;
