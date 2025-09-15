const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./backend/swagger.config"); // ton swaggerJsdoc

const app = express();
const PORT = 3000;

// Sert Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Swagger UI running at http://localhost:${PORT}/docs`);
});
s;
