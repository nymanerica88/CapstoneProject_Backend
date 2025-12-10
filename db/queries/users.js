import db from "#db/client";
import bcrypt from "bcrypt";

export async function createUser({
  first_name,
  last_name,
  email,
  username,
  password,
}) {
  try {
    const sql = `
    INSERT INTO users
      (first_name, last_name, email, username, password,)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *
    `;
    const hashedPassword = await bcrypt.hash(password, 10);
    const values = [first_name, last_name, email, username, hashedPassword];
    const {
      rows: [user],
    } = await db.query(sql, values);
    return user;
  } catch (error) {
    console.error(`Error creating user`, error);
    throw error;
  }
}

export async function getUserByUsernameAndPassword(username, password) {
  try {
    const sql = `
    SELECT *
    FROM users
    WHERE username = $1
    `;
    const {
      rows: [user],
    } = await db.query(sql, [username]);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
  } catch (error) {
    console.error(`Error getting user`, error);
    throw error;
  }
}

export async function getUserById(id) {
  try {
    const sql = `
    SELECT *
    FROM users
    WHERE id = $1
    `;
    const {
      rows: [user],
    } = await db.query(sql, [id]);
    return user;
  } catch (error) {
    console.error(`Error getting user by ID`, error);
    throw error;
  }
}
