const Agendamento = require('../models/Agendamento');

class AgendamentoService {
    static async verificarDisponibilidade(data, horario) {
        const agendamentoExistente = await Agendamento.findOne({ data, horario });
        return !agendamentoExistente;
    }

    static async criarAgendamento(dadosAgendamento) {
        const disponivel = await this.verificarDisponibilidade(
            dadosAgendamento.data,
            dadosAgendamento.horario
        );

        if (!disponivel) {
            throw new Error('Horário não disponível');
        }

        return await Agendamento.create(dadosAgendamento);
    }

    static async listarAgendamentos() {
        return await Agendamento.find().sort({ data: 1, horario: 1 });
    }
}

module.exports = AgendamentoService;
