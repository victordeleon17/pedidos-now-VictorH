const express = require("express");
const cors = require("cors");
require("dotenv").config();

const healthRoutes = require("./routes/health.routes");
const paymentsRoutes = require("./routes/payments.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", paymentsRoutes);

const port = Number(process.env.PORT || 3005);
app.listen(port, () => {
  console.log(`Cobros API corriendo en http://localhost:${port}`);
});