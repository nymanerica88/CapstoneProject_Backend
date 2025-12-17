import db from "#db/client";

import { createUser } from "#db/queries/users";
import { createGuest } from "#db/queries/guests";
import { createBill } from "#db/queries/bills";
import { createReceiptItem } from "#db/queries/receipt_items";
import { createSplitExpense } from "#db/queries/split_expenses";

const restaurantMenu = [
  // Burgers & Sandwiches
  { name: "Classic Cheeseburger", price: 12.99 },
  { name: "Bacon Cheeseburger", price: 14.5 },
  { name: "Mushroom Swiss Burger", price: 14.25 },
  { name: "Grilled Chicken Sandwich", price: 13.75 },
  { name: "Spicy Chicken Sandwich", price: 13.95 },
  { name: "BBQ Pulled Pork Sandwich", price: 13.5 },
  { name: "Turkey Club Sandwich", price: 12.75 },

  // Pizza
  { name: "Margherita Pizza", price: 15.5 },
  { name: "Pepperoni Pizza", price: 16.25 },
  { name: "BBQ Chicken Pizza", price: 17.5 },
  { name: "Vegetarian Pizza", price: 15.75 },
  { name: "Four Cheese Pizza", price: 16.0 },

  // Pasta
  { name: "Chicken Alfredo", price: 18.25 },
  { name: "Spaghetti Bolognese", price: 17.5 },
  { name: "Penne Vodka", price: 16.75 },
  { name: "Lasagna", price: 18.95 },
  { name: "Shrimp Scampi", price: 20.5 },

  // Tacos & Mexican
  { name: "Fish Tacos", price: 14.75 },
  { name: "Chicken Tacos", price: 13.95 },
  { name: "Steak Tacos", price: 15.5 },
  { name: "Veggie Tacos", price: 12.75 },
  { name: "Chicken Quesadilla", price: 13.25 },
  { name: "Steak Quesadilla", price: 14.75 },

  // Salads & Bowls
  { name: "Caesar Salad", price: 9.5 },
  { name: "Grilled Chicken Caesar Salad", price: 13.5 },
  { name: "House Garden Salad", price: 8.75 },
  { name: "Cobb Salad", price: 14.95 },
  { name: "Quinoa Power Bowl", price: 13.95 },

  // Sides
  { name: "French Fries", price: 5.25 },
  { name: "Sweet Potato Fries", price: 5.95 },
  { name: "Onion Rings", price: 6.5 },
  { name: "Side Caesar Salad", price: 6.25 },
  { name: "Garlic Bread", price: 4.95 },

  // Desserts
  { name: "Chocolate Cake", price: 7.5 },
  { name: "Cheesecake", price: 7.95 },
  { name: "Apple Pie", price: 6.75 },
  { name: "Brownie Sundae", price: 8.25 },
  { name: "Ice Cream Scoop", price: 4.5 },

  // Drinks
  { name: "Iced Tea", price: 3.25 },
  { name: "Soft Drink", price: 3.0 },
  { name: "Lemonade", price: 3.5 },
  { name: "Coffee", price: 3.25 },
  { name: "Craft Beer", price: 6.75 },
  { name: "House Red Wine", price: 8.5 },
  { name: "House White Wine", price: 8.5 },
];

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
      for (const guest of guests) {
        const itemsForGuest = restaurantMenu
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 2) + 2); // 2–3 items

        for (const menuItem of itemsForGuest) {
          await createReceiptItem({
            bill_id: bill.id,
            guest_id: guest.id,
            item_name: menuItem.name,
            quantity: Math.floor(Math.random() * 3) + 1, // 1–3 qty
            price: menuItem.price,
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
