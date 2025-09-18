const swaggerJsdoc = require("swagger-jsdoc");

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") });
const IP = process.env.DB_HOST;

let schemas = {};
try {
  schemas = require("../docs/schemas");
} catch (error) {
  console.warn("Schemas file not found, using empty schemas");

  schemas = {
    User: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        email: { type: "string" },
      },
    },
    Tag: {
      type: "object",
      properties: {
        id: { type: "integer" },
        uid: { type: "string" },
        name: { type: "string" },
      },
    },
  };
}

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
        url: `http://${IP}:5000`,
        description: "Backend API",
      },
    ],
    components: {
      schemas: schemas,
    },
  },
  apis: [
    path.join(__dirname, "../routes/*.js"),
    path.join(__dirname, "../docs/*.js"),
  ],
};

module.exports = swaggerJsdoc(swaggerOptions);
