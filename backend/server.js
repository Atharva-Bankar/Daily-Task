import express from "express";
import cors from "cors";
import userRoutes from "./src/routes/user.routes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from ClientFlow backend!"
  });
});

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});