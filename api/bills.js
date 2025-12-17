import express from "express";
import db from "#db/client";
import requireUser from "#middleware/requireUser";
import {
  createBill,
  getBillById,
  getBillSplits,
  getBillItems,
} from "#db/queries/bills";
import { createGuest } from "#db/queries/guests";
import { createReceiptItem } from "#db/queries/receipt_items";
import { createSplitExpense } from "#db/queries/split_expenses";
import { markBillAsPaid } from "#db/queries/bills";

const billsRouter = express.Router();

billsRouter.post("/", requireUser, async (req, res, next) => {
  const { ref_num, total, split_type, guests, items, percentages } = req.body;

  try {
    await db.query("BEGIN");
    if (!ref_num || typeof total !== "number" || total <= 0) {
      throw new Error("Valid bill reference number and total are required");
    }

    if (!Array.isArray(guests) || !guests.length) {
      throw new Error("At least one guest is required");
    }

    if (!["even", "per_item", "percentage"].includes(split_type)) {
      throw new Error("Invalid split type");
    }

    if (split_type === "per_item") {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Items are required for per-item split");
      }
    }
    if (split_type === "percentage") {
      if (!Array.isArray(percentages) || percentages.length === 0) {
        throw new Error("Percentages are required for percentage split");
      }
      const percentTotal = percentages.reduce((sum, p) => sum + p.percent, 0);

      if (percentTotal !== 1) {
        throw new Error("Percentages must total 100%");
      }
    }
    const bill = await createBill({
      owner_user_id: req.user.id,
      ref_num,
      type: split_type,
      total,
    });

    const createdGuests = [];
    for (const guestName of guests) {
      const isUserGuest =
        guestName === `${req.user.first_name} ${req.user.last_name}`;

      const guest = await createGuest({
        user_id: isUserGuest ? req.user.id : null,
        guest_name: guestName,
        is_user: isUserGuest,
      });
      createdGuests.push(guest);
    }

    if (split_type === "even") {
      const amount = total / createdGuests.length;

      for (const guest of createdGuests) {
        await createSplitExpense({
          bill_id: bill.id,
          guest_id: guest.id,
          amount_owed: amount,
        });
      }
    } else if (split_type === "per_item") {
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
    } else if (split_type === "percentage") {
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

billsRouter.get("/:id", requireUser, async (req, res, next) => {
  try {
    const bill = await getBillById(req.params.id, req.user.id);
    if (!bill) return res.status(404).send("Bill not found");

    const splits = await getBillSplits(bill.id);
    const items = await getBillItems(bill.id);

    res.json({ bill, splits, items });
  } catch (error) {
    console.error(`Error retrieving bill details by id`, error);
    next(error);
  }
});

billsRouter.patch("/:id/pay", requireUser, async (req, res, next) => {
  try {
    const bill = await markBillAsPaid(req.params.id, req.user.id);

    if (!bill) {
      return res.status(404).send("Bill not found");
    }

    res.json(bill);
  } catch (error) {
    next(error);
  }
});

export default billsRouter;
