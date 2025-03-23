const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
    cliente: {
        nome: {
            type: String,
            required: [true, 'Nome do cliente é obrigatório']
        },
        email: {
            type: String,
            required: [true, 'Email do cliente é obrigatório'],
            match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um email válido']
        },
        telefone: {
            type: String,
            required: [true, 'Telefone do cliente é obrigatório']
        }
    },
    servico: {
        type: String,
        required: [true, 'Tipo de serviço é obrigatório'],
        enum: ['corte', 'barba', 'combo']
    },
    data: {
        type: Date,
        required: [true, 'Data do agendamento é obrigatória']
    },
    horario: {
        type: String,
        required: [true, 'Horário é obrigatório']
    },
    status: {
        type: String,
        enum: ['pendente', 'confirmado', 'cancelado'],
        default: 'pendente'
    },
    preco: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Método para verificar disponibilidade
agendamentoSchema.statics.verificarDisponibilidade = async function(data, horario) {
    const agendamentoExistente = await this.findOne({
        data: new Date(data),
        horario: horario,
        status: { $ne: 'cancelado' }
    });
    return !agendamentoExistente;
};

// Middleware para definir preço baseado no serviço
agendamentoSchema.pre('save', function(next) {
    const precos = {
        corte: 45.00,
        barba: 35.00,
        combo: 70.00
    };
    this.preco = precos[this.servico];
    next();
});

module.exports = mongoose.model('Agendamento', agendamentoSchema);
