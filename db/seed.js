import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createGuest } from "#db/queries/guests";
import { createBill } from "#db/queries/bills";
import { createItem } from "#db/queries/items";
import { addItemToBill } from "#db/queries/z_items_on_bills";
import { createSplitExpense } from "#db/queries/z_split_expenses";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // ---- Users ----
  const users = [
    {
      first_name: "Kara",
      last_name: "Sanders",
      email: "kara@example.com",
      username: "kara_s",
      password: "password1",
    },
    {
      first_name: "Kevin",
      last_name: "Simpson",
      email: "kevin@example.com",
      username: "kevin_s",
      password: "password2",
    },
    {
      first_name: "Kylie",
      last_name: "Santos",
      email: "kylie@example.com",
      username: "kylie_s",
      password: "password3",
    },
    {
      first_name: "Kurt",
      last_name: "Spencer",
      email: "kurt@example.com",
      username: "kurt_s",
      password: "password4",
    },
    {
      first_name: "Kiara",
      last_name: "Shelton",
      email: "kiara@example.com",
      username: "kiara_s",
      password: "password5",
    },
  ];

  for (const u of users) {
    const user = await createUser(u);
    console.log("User created:", user.username);

    const billTypes = ["even", "per item", "percentage"];

    for (const type of billTypes) {
      // ---- Guests ----
      const guests = [];
      for (let i = 1; i <= 4; i++) {
        const guest = await createGuest({
          user_id: user.id,
          guest_name: `${user.first_name}_Guest${i}`,
        });
        guests.push(guest);
      }

      // ---- Create Bill ----
      const total = 100 + Math.floor(Math.random() * 200); // total bill amount
      const bill = await createBill({
        guest_id: guests[0].id,
        ref_num: Math.floor(Math.random() * 100000),
        receipt: null,
        type,
        total,
        is_paid: Math.random() > 0.5,
      });

      console.log(`Bill created for user ${user.username} with type ${type}`);

      // ---- Items ----
      const guestItemTotals = {};
      for (const guest of guests) {
        guestItemTotals[guest.id] = 0;
        for (let j = 1; j <= 3; j++) {
          const price = 5 + Math.floor(Math.random() * 21); // price 5-25
          const quantity = 1 + Math.floor(Math.random() * 3); // quantity 1-3

          const item = await createItem({
            bill_id: bill.id,
            guest_id: guest.id,
            name: `Item_${guest.guest_name}_${j}`,
            quantity,
            price,
          });

          await addItemToBill({
            bill_id: bill.id,
            item_id: item.id,
          });

          guestItemTotals[guest.id] += price * quantity;
        }
      }

      // ---- Split Expenses ----
      if (type === "even") {
        const amountPerGuest = total / guests.length;
        for (const guest of guests) {
          await createSplitExpense({
            bill_id: bill.id,
            guest_id: guest.id,
            amount_owed: amountPerGuest,
          });
        }
      } else if (type === "per item") {
        for (const guest of guests) {
          await createSplitExpense({
            bill_id: bill.id,
            guest_id: guest.id,
            amount_owed: guestItemTotals[guest.id],
          });
        }
      } else if (type === "percentage") {
        // simple weights
        let weights = [];
        for (let i = 0; i < guests.length; i++) {
          weights.push(Math.random());
        }
        let totalWeight = 0;
        for (let w of weights) {
          totalWeight += w;
        }

        for (let i = 0; i < guests.length; i++) {
          const guest = guests[i];
          const amount = (weights[i] / totalWeight) * total;
          await createSplitExpense({
            bill_id: bill.id,
            guest_id: guest.id,
            amount_owed: amount,
          });
        }
      }

      console.log(
        `Bill ${bill.id} has 4 guests with 3 items each and split type ${type}`
      );
    }
  }

  console.log("🌟 Seed completed successfully!");
}

// import db from "#db/client";
// import { createUser } from "#db/queries/users";

// await db.connect();
// await seed();
// await db.end();
// console.log("🌱 Database seeded.");

// async function seed() {
//   await createUser("foo", "bar");
// }
