const express = require("express");
const { db } = require("../prisma/db");

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    const result = await db.$queryRaw`SELECT NOW()`;

    res.json({
      message: "Database connected successfully!",
      time: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

module.exports = router;