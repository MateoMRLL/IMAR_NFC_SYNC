const swaggerJsdoc = require("swagger-jsdoc");
const schemas = require("../docs/schemas");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NFC tags API",
      version: "1.0.0",
      description: "NFC tags API for Imar Research Center",
    },
    servers: [
      {
        url: `"http://localhost:5000"`,
        description: "Backend API",
      },
    ],
    components: {
      schemas: schemas,
    },
  },
  apis: ["./routes/*.js", "./docs/*.js"],
};

module.exports = swaggerJsdoc(swaggerOptions);
