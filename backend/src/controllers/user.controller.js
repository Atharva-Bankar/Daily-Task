import bcrypt from "bcrypt";  
import { db } from "../prisma/db.ts";

const getUsers = async (req, res) => {
  try {
    const users = await db.orm.public.User.all();

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.orm.public.User.create({
      
        name,
        email,
        username,
        password: hashedPassword,
      
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    };

    res.status(201).json(safeUser);
  } catch (error) {
    console.error("Error creating user:", error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await db.orm.public.User.where({ email }).first();
    const passwordMatches = user && await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ message: "That email or password doesn't match an account." });

    res.json({ id: user.id, name: user.name, email: user.email, username: user.username });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Unable to log in right now. Please try again." });
  }
};

export { getUsers, createUser, loginUser };
