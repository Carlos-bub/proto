const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Barbearia',
      version: '1.0.0',
      description: 'API para sistema de agendamentos de barbearia',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Arquivos que contêm anotações do Swagger
};

const specs = swaggerJsdoc(options);

module.exports = specs;
