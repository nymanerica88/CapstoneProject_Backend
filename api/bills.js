import express from "express";
import db from "#db/client";
import requireUser from "#middleware/requireUser";
import { createBill } from "#db/queries/bills";
import { createGuest } from "#db/queries/guests";
import { createReceiptItem } from "#db/receipt_items";
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
  } catch (error) {}
});

export default billsRouter;
