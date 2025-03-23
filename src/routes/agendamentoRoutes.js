const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');

// Rotas de agendamento
router.get('/', agendamentoController.getAgendamentos);
router.post('/', agendamentoController.criarAgendamento);
router.put('/:id/status', agendamentoController.atualizarStatus);
router.delete('/:id', agendamentoController.cancelarAgendamento);
router.get('/disponibilidade', agendamentoController.verificarDisponibilidade);

module.exports = router;
