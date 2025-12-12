import express from "express";
import { createUser, getUserByUsernameAndPassword } from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";
import jwt from "jsonwebtoken";
import db from "#db/client";
const { TokenExpiredError } = jwt;

// // import { TokenExpiredError } from "jsonwebtoken";

const usersRouter = express.Router();

usersRouter
  .route("/register")
  .post(
    requireBody(["username", "password", "first_name", "last_name", "email"]),
    async (req, res) => {
      try {
        const { username, password, first_name, last_name, email } = req.body;
        const user = await createUser({
          username,
          password,
          first_name,
          last_name,
          email,
        });

        const token = await createToken({ id: user.id });
        res.status(201).send(token);
      } catch (error) {
        console.error(error);
        res.status(400).send({ error: error.message });
      }
    }
  );

usersRouter
  .route("/login")
  .post(requireBody(["username", "password"]), async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsernameAndPassword(username, password);
    if (!user) return res.status(401).send("Invalid username or password.");

    const token = await createToken({ id: user.id });
    res.send(token);
  });

usersRouter.get("/me", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send("Not logged in");
    }

    const guestSql = `
      SELECT id AS guest_id
      FROM guests
      WHERE user_id = $1
      ORDER BY id ASC
      LIMIT 1
      `;
    const values = [user.id];
    const {
      rows: [guest],
    } = await db.query(guestSql, values);

    res.json({
      user,
      guest_id: guest?.guest_id ?? null,
    });
  } catch (error) {
    console.error("Error in /users/me", error);
    res.status(500).send("Server error fetching user info");
  }
});

export default usersRouter;
