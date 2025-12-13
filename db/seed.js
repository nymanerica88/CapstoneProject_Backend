import db from "#db/client";

import { createUser } from "#db/queries/users";
import { createGuest } from "#db/queries/guests";
import { createBill } from "#db/queries/bills";
import { createReceiptItem } from "#db/queries/receipt_items";
import { createSplitExpense } from "#db/queries/split_expenses";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // ---------- USERS ----------
  const users = [
    {
      first_name: "Kara",
      last_name: "Sanders",
      email: "kara@example.com",
      username: "kara.sanders",
      password: "password1",
    },
    {
      first_name: "Kevin",
      last_name: "Simpson",
      email: "kevin@example.com",
      username: "kevin.simpson",
      password: "password2",
    },
    {
      first_name: "Kyle",
      last_name: "Santos",
      email: "kyle@example.com",
      username: "kyle.santos",
      password: "password3",
    },
  ];

  // ---------- UNIQUE FRIEND NAME SETS ----------
  const friendNameSets = [
    [
      { first: "Taylor", last: "Davis" },
      { first: "Trevor", last: "Douglas" },
      { first: "Tina", last: "Daniels" },
    ],
    [
      { first: "Tyler", last: "Duncan" },
      { first: "Tara", last: "Donovan" },
      { first: "Theo", last: "Dixon" },
    ],
    [
      { first: "Trent", last: "Dorsey" },
      { first: "Talia", last: "Drake" },
      { first: "Tony", last: "Delgado" },
    ],
  ];

  for (let u = 0; u < users.length; u++) {
    const userData = users[u];

    // ---------- CREATE USER ----------
    const user = await createUser(userData);
    console.log(`User created: ${user.username}`);

    // ---------- FETCH USER AS GUEST ----------
    const {
      rows: [userGuest],
    } = await db.query(
      `
      SELECT *
      FROM guests
      WHERE user_id = $1
        AND is_user = true
      `,
      [user.id]
    );

    if (!userGuest) {
      throw new Error(`No guest record found for user ${user.username}`);
    }

    // ---------- CREATE FRIEND GUESTS ----------
    const guests = [userGuest];
    const friendNames = friendNameSets[u];

    for (const friend of friendNames) {
      const guest = await createGuest({
        user_id: null,
        guest_name: `${friend.first} ${friend.last}`,
        is_user: false,
      });
      guests.push(guest);
    }

    // ---------- CREATE BILLS ----------
    const billTypes = ["even", "per_item", "percentage"];

    for (let i = 0; i < billTypes.length; i++) {
      const type = billTypes[i];
      const total = 120 + i * 40;

      const bill = await createBill({
        owner_user_id: user.id,
        ref_num: Math.floor(Math.random() * 100000),
        type,
        total,
      });

      console.log(
        `Bill ${bill.ref_num} created for ${user.username} (${type})`
      );

      // ---------- RECEIPT ITEMS ----------
      // Each guest buys 3 items
      for (const guest of guests) {
        for (let j = 1; j <= 3; j++) {
          await createReceiptItem({
            bill_id: bill.id,
            guest_id: guest.id,
            item_name: `Item ${guest.guest_name} ${j}`,
            quantity: j,
            price: 8 + j * 2,
          });
        }
      }

      // ---------- SPLIT EXPENSES ----------

      // EVEN SPLIT
      if (type === "even") {
        const amountPerGuest = Number((total / guests.length).toFixed(2));

        for (const guest of guests) {
          await createSplitExpense({
            bill_id: bill.id,
            guest_id: guest.id,
            amount_owed: amountPerGuest,
          });
        }
      }

      // PER-ITEM SPLIT
      if (type === "per_item") {
        const { rows: guestTotals } = await db.query(
          `
          SELECT
            guest_id,
            SUM(quantity * price) AS amount_owed
          FROM receipt_items
          WHERE bill_id = $1
          GROUP BY guest_id
          `,
          [bill.id]
        );

        for (const row of guestTotals) {
          await createSplitExpense({
            bill_id: bill.id,
            guest_id: row.guest_id,
            amount_owed: Number(row.amount_owed),
          });
        }
      }

      // PERCENTAGE SPLIT
      if (type === "percentage") {
        const weights = guests.map(() => Math.random());
        const totalWeight = weights.reduce((a, b) => a + b, 0);

        for (let g = 0; g < guests.length; g++) {
          const percentage = weights[g] / totalWeight;
          const amount = Number((percentage * total).toFixed(2));

          await createSplitExpense({
            bill_id: bill.id,
            guest_id: guests[g].id,
            amount_owed: amount,
          });
        }
      }
    }
  }

  console.log("🌟 Seed completed successfully!");
}
