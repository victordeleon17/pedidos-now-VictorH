const express = require("express");
const cors = require("cors");
require("dotenv").config();

const healthRoutes = require("./routes/health.routes");
const paymentsRoutes = require("./routes/payments.routes");
const walletRoutes = require("./routes/wallet.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins.includes("*") ? "*" : corsOrigins
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));

if (process.env.LOG_REQUESTS === "true") {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      console.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
    });
    next();
  });
}

app.use("/api", healthRoutes);
app.use("/api", paymentsRoutes);
app.use("/api", walletRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3005);

app.listen(PORT, () => {
  console.info(`Cobros API running on http://localhost:${PORT}`);
});
