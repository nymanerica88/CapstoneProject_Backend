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
  // ---- USERS ----
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

    // ---- BILL TYPES ----
    const billTypes = ["even", "per item", "percentage"];

    for (const type of billTypes) {
      // ---- GUESTS ----
      const guests = [];

      // Make user a guest
      const userGuest = await createGuest({
        user_id: user.id,
        guest_name: `${user.first_name}_Self`,
      });
      guests.push(userGuest);

      // Add 3 more guests
      for (let i = 1; i <= 3; i++) {
        const guest = await createGuest({
          user_id: user.id,
          guest_name: `${user.first_name}_Guest${i}`,
        });
        guests.push(guest);
      }

      // ---- CREATE BILL (owned by user) ----
      const total = parseFloat((100 + Math.random() * 200).toFixed(2));
      const bill = await createBill({
        guest_id: userGuest.id, // user as bill owner (guest_id field)
        ref_num: Math.floor(Math.random() * 100000),
        receipt: null,
        type,
        total,
        is_paid: Math.random() > 0.5,
      });

      console.log(`Bill created for user ${user.username} with type ${type}`);

      // ---- ITEMS ----
      const guestItemTotals = {};
      for (const guest of guests) {
        guestItemTotals[guest.id] = 0;
        for (let j = 1; j <= 3; j++) {
          const price = parseFloat((5 + Math.random() * 20).toFixed(2));
          const quantity = 1 + Math.floor(Math.random() * 3);

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

      // ---- SPLIT EXPENSES ----
      if (type === "even") {
        const amountPerGuest = parseFloat((total / guests.length).toFixed(2));
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
            amount_owed: parseFloat(guestItemTotals[guest.id].toFixed(2)),
          });
        }
      } else if (type === "percentage") {
        const weights = guests.map(() => Math.random());
        const totalWeight = weights.reduce((acc, w) => acc + w, 0);

        for (let i = 0; i < guests.length; i++) {
          const guest = guests[i];
          const amount = parseFloat(
            ((weights[i] / totalWeight) * total).toFixed(2)
          );
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
