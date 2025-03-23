const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
        process.exit(1);
    }
    console.log('Conectado ao banco de dados SQLite');
});

// Criar tabela de agendamentos
db.run(`CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    servico TEXT NOT NULL,
    data DATE NOT NULL,
    horario TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    preco REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Adicionar índice para melhorar performance das consultas por data
db.run(`CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data)`);

module.exports = db;
