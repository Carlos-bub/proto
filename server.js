const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');
const agendamentoRoutes = require('./src/routes/agendamentoRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rotas
app.use('/api/agendamentos', agendamentoRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 Documentação da API: http://localhost:${PORT}/api-docs`);
    console.log(`🌐 API Endpoints: http://localhost:${PORT}/api/agendamentos`);
    console.log('=================================');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`⚠️ Porta ${PORT} já está em uso. Tente uma porta diferente.`);
    } else {
        console.error('❌ Erro ao iniciar o servidor:', err.message);
    }
    process.exit(1);
});
