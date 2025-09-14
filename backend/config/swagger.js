const swaggerJsdoc = require("swagger-jsdoc");
const schemas = require("../Docs/schemas");

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
        url: `localhost:${3000}`, //to determine
        description: "Dev",
      },
    ],
    components: {
      schemas: schemas,
    },
  },
  apis: ["./Routes/*.js", "./Docs/*.js"],
};

module.exports = swaggerJsdoc(swaggerOptions);
