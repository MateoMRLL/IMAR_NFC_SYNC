const express = require("express");
const cors = require("cors");

// Import routes
const userRoute = require("./routes/userRoutes");
const tagRoute = require("./routes/tagRoutes");
const nfcRoute = require("./routes/nfcRoutes");
const authRoute = require("./routes/authRoutes");

const assignRoute = require("./routes/assignRoutes");

const app = express();
const port = 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// Mount routes
app.use("/api/users", userRoute);
app.use("/api/tags", tagRoute);
app.use("/api/nfc", nfcRoute);
app.use("/api/assign", assignRoute);
app.use("/api/auth", authRoute);

app.listen(port, () => {
  console.log(`NFC Server running on port ${port}`);
});
