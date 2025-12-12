import express from "express";
import cors from "cors";
import morgan from "morgan";
import getUserFromToken from "#middleware/getUserFromToken";
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import usersRouter from "#api/users";
import profileRouter from "#api/profile";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ }));

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(getUserFromToken);

//ROUTES
app.get("/", (req, res) => res.send("Hello, World!"));

app.use("/users", usersRouter);
app.use("/profile", profileRouter);

//ERROR-HANDLING
app.use(handlePostgresErrors);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;
