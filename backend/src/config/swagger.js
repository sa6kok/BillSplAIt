const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BillSplAIt API',
      version: '1.0.0',
      description: 'REST API for the BillSplAIt bill-splitting application.',
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
        },
        Group: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdBy: { type: 'integer' },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            groupId: { type: 'integer' },
            description: { type: 'string' },
            amount: { type: 'number', format: 'float' },
            currency: { type: 'string' },
            paidBy: { type: 'integer' },
            date: { type: 'string', format: 'date' },
          },
        },
        Balance: {
          type: 'object',
          properties: {
            fromUserId: { type: 'integer' },
            toUserId: { type: 'integer' },
            amount: { type: 'number', format: 'float' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
