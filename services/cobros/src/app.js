const express = require("express");
const cors = require("cors");
require("dotenv").config();

const healthRoutes = require("./routes/health.routes");
const paymentsRoutes = require("./routes/payments.routes");
const walletRoutes = require("./routes/wallet.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", paymentsRoutes);
app.use("/api", walletRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3005);

app.listen(PORT, () => {
  console.log(`Cobros API running on http://localhost:${PORT}`);
});