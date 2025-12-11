import express from "express";
import { createUser, getUserByUsernameAndPassword } from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";
import jwt from "jsonwebtoken";
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

export default usersRouter;
