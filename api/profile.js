import express from "express";
import db from "#db/client";
import requireUser from "#middleware/requireUser";

import {
  getBillsForGuestProfile,
  getTotalOwedForGuest,
} from "#db/queries/split_expenses";

const profileRouter = express.Router();

profileRouter.use(requireUser);

profileRouter.get("/", async (req, res, next) => {
  try {
    const guestSql = `
    SELECT id
    FROM guests
    WHERE user_id = $1
      AND is_user = true
    LIMIT 1
    `;

    const values = [req.user.id];
    const {
      rows: [userAsGuest],
    } = await db.query(guestSql, values);
    if (!userAsGuest) {
      return res.status(404).send("User guest profile not found");
    }

    const bills = await getBillsForGuestProfile(userAsGuest.id);
    const totalOwed = await getTotalOwedForGuest(userAsGuest.id);

    res.send({ bills, total_owed: totalOwed });
  } catch (error) {
    console.error("Error fetching profile", error);
    next(error);
  }
});

export default profileRouter;
