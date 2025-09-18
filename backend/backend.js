const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerDocs = require("./config/swagger");

dotenv.config({ path: path.join(__dirname, "../.env") });
const IP = process.env.DB_HOST;

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

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
    },
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "IMAR NFC API",
    documentation: `http://${IP}:${port}/api-docs`,
    version: "1.0.0",
  });
});

// Mount routes
app.use("/api/users", userRoute);
app.use("/api/tags", tagRoute);
app.use("/api/nfc", nfcRoute);
app.use("/api/assign", assignRoute);
app.use("/api/auth", authRoute);

app.listen(port, () => {
  console.log(`NFC Server running on port ${port}`);
  console.log(`Documentation Swagger : http://${IP}:${port}/api-docs`);
  console.log(`API Base URL : http://${IP}:${port}`);
});
