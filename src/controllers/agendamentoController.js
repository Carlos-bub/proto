const db = require('../config/database');

// Get todos os agendamentos com filtros
exports.getAgendamentos = (req, res) => {
    const { data, status, horario } = req.query;
    let query = 'SELECT *, strftime("%Y-%m-%d", data) as data_formatada FROM agendamentos WHERE 1=1';
    const params = [];

    if (data) {
        query += ' AND date(data) = date(?)';
        params.push(data);
    }

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }

    if (horario) {
        query += ' AND horario = ?';
        params.push(horario);
    }

    query += ' ORDER BY data, horario';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar agendamentos:', err);
            return res.status(500).json({ erro: 'Erro ao buscar agendamentos', detalhes: err.message });
        }
        
        // Formata as datas antes de enviar
        const agendamentosFormatados = rows.map(row => ({
            ...row,
            data: row.data_formatada
        }));
        
        console.log('Agendamentos encontrados:', agendamentosFormatados);
        res.json(agendamentosFormatados);
    });
};

// Criar novo agendamento
exports.criarAgendamento = (req, res) => {
    const { nome, email, telefone, servico, data, horario } = req.body;

    // Validar dados
    if (!nome || !email || !telefone || !servico || !data || !horario) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    // Verificar disponibilidade
    const checkQuery = `SELECT id FROM agendamentos WHERE date(data) = date(?) AND horario = ? AND status != 'cancelado'`;
    db.get(checkQuery, [data, horario], (err, row) => {
        if (err) {
            console.error('Erro ao verificar disponibilidade:', err);
            return res.status(500).json({ erro: 'Erro ao verificar disponibilidade', detalhes: err.message });
        }

        if (row) {
            return res.status(400).json({ erro: 'Horário não disponível' });
        }

        // Calcular preço baseado no serviço
        const precos = {
            corte: 45.00,
            barba: 35.00,
            combo: 70.00
        };

        const preco = precos[servico];

        // Inserir agendamento
        const insertQuery = `
            INSERT INTO agendamentos (nome, email, telefone, servico, data, horario, preco, status)
            VALUES (?, ?, ?, ?, date(?), ?, ?, 'pendente')
        `;

        db.run(insertQuery, [nome, email, telefone, servico, data, horario, preco], function(err) {
            if (err) {
                console.error('Erro ao criar agendamento:', err);
                return res.status(500).json({ erro: 'Erro ao criar agendamento', detalhes: err.message });
            }

            // Buscar o agendamento criado
            db.get(`SELECT *, strftime("%Y-%m-%d", data) as data_formatada FROM agendamentos WHERE id = ?`, [this.lastID], (err, row) => {
                if (err) {
                    console.error('Erro ao recuperar agendamento criado:', err);
                    return res.status(500).json({ erro: 'Erro ao recuperar agendamento criado', detalhes: err.message });
                }
                
                const agendamentoFormatado = {
                    ...row,
                    data: row.data_formatada
                };
                
                console.log('Agendamento criado:', agendamentoFormatado);
                res.status(201).json({
                    mensagem: 'Agendamento criado com sucesso',
                    agendamento: agendamentoFormatado
                });
            });
        });
    });
};

// Atualizar status do agendamento
exports.atualizarStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pendente', 'confirmado', 'cancelado'].includes(status)) {
        return res.status(400).json({ erro: 'Status inválido' });
    }

    const query = `UPDATE agendamentos SET status = ? WHERE id = ?`;
    db.run(query, [status, id], function(err) {
        if (err) {
            console.error('Erro ao atualizar status:', err);
            return res.status(500).json({ erro: 'Erro ao atualizar status', detalhes: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ erro: 'Agendamento não encontrado' });
        }

        db.get(`SELECT *, strftime("%Y-%m-%d", data) as data_formatada FROM agendamentos WHERE id = ?`, [id], (err, row) => {
            if (err) {
                console.error('Erro ao recuperar agendamento atualizado:', err);
                return res.status(500).json({ erro: 'Erro ao recuperar agendamento atualizado', detalhes: err.message });
            }
            
            const agendamentoFormatado = {
                ...row,
                data: row.data_formatada
            };
            
            console.log('Status atualizado:', agendamentoFormatado);
            res.json({
                mensagem: 'Status atualizado com sucesso',
                agendamento: agendamentoFormatado
            });
        });
    });
};

// Cancelar agendamento
exports.cancelarAgendamento = (req, res) => {
    const { id } = req.params;
    
    const query = `UPDATE agendamentos SET status = 'cancelado' WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Erro ao cancelar agendamento:', err);
            return res.status(500).json({ erro: 'Erro ao cancelar agendamento', detalhes: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ erro: 'Agendamento não encontrado' });
        }

        db.get(`SELECT *, strftime("%Y-%m-%d", data) as data_formatada FROM agendamentos WHERE id = ?`, [id], (err, row) => {
            if (err) {
                console.error('Erro ao recuperar agendamento cancelado:', err);
                return res.status(500).json({ erro: 'Erro ao recuperar agendamento cancelado', detalhes: err.message });
            }
            
            const agendamentoFormatado = {
                ...row,
                data: row.data_formatada
            };
            
            console.log('Agendamento cancelado:', agendamentoFormatado);
            res.json({
                mensagem: 'Agendamento cancelado com sucesso',
                agendamento: agendamentoFormatado
            });
        });
    });
};

// Verificar disponibilidade de horário
exports.verificarDisponibilidade = (req, res) => {
    const { data, horario } = req.query;
    
    if (!data || !horario) {
        return res.status(400).json({ erro: 'Data e horário são obrigatórios' });
    }

    const query = `SELECT id FROM agendamentos WHERE date(data) = date(?) AND horario = ? AND status != 'cancelado'`;
    db.get(query, [data, horario], (err, row) => {
        if (err) {
            console.error('Erro ao verificar disponibilidade:', err);
            return res.status(500).json({ erro: 'Erro ao verificar disponibilidade', detalhes: err.message });
        }
        console.log('Verificação de disponibilidade:', { data, horario, disponivel: !row });
        res.json({ disponivel: !row });
    });
};
