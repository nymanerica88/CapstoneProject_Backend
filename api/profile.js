import express from "express";
import {
  getBillsForGuestProfile,
  getTotalOwedForGuest,
} from "#db/queries/z_split_expenses";

const profileRouter = express.Router();

profileRouter.get("/:guest_id", async (req, res, next) => {
  try {
    const guest_id = Number(req.params.guest_id);
    const bills = await getBillsForGuestProfile(guest_id);
    const totalOwed = await getTotalOwedForGuest(guest_id);
    if (!bills || bills.length === 0) {
      return res.status(404).send("Profile not found");
    }
    res.json({
      bills,
      total_owed: totalOwed,
    });
  } catch (error) {
    console.error(
      `Error fetching profile for guest ${req.params.guest_id}`,
      error
    );
    next(error);
  }
});

export default profileRouter;
