// Verificar autenticação
function checkAuth() {
    if (!sessionStorage.getItem('adminAuthenticated')) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    window.location.href = '/login.html';
}

const HORARIOS_DISPONIVEIS = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    // Set minimum date to today for filter
    const dateFilter = document.getElementById('date-filter');
    const today = new Date().toISOString().split('T')[0];
    dateFilter.value = today;
    dateFilter.min = today;
    
    carregarAgendamentos();
});

async function carregarAgendamentos() {
    if (!checkAuth()) return;

    try {
        const dateFilter = document.getElementById('date-filter').value;
        const timeFilter = document.getElementById('time-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        let url = '/api/agendamentos';
        const params = new URLSearchParams();
        
        if (dateFilter) params.append('data', dateFilter);
        if (timeFilter) params.append('horario', timeFilter);
        if (statusFilter) params.append('status', statusFilter);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }

        console.log('Buscando agendamentos:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro ao carregar agendamentos');
        }
        const agendamentos = await response.json();

        console.log('Agendamentos recebidos:', agendamentos);

        atualizarSumario(agendamentos);
        atualizarTimeSlots(agendamentos, dateFilter);
        exibirAgendamentos(agendamentos);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar agendamentos: ' + error.message);
    }
}

function atualizarSumario(agendamentos) {
    const total = agendamentos.length;
    const pendentes = agendamentos.filter(a => a.status === 'pendente').length;
    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    const cancelados = agendamentos.filter(a => a.status === 'cancelado').length;

    document.getElementById('total-appointments').textContent = total;
    document.getElementById('pending-appointments').textContent = pendentes;
    document.getElementById('confirmed-appointments').textContent = confirmados;
    document.getElementById('canceled-appointments').textContent = cancelados;
}

function atualizarTimeSlots(agendamentos, selectedDate) {
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';

    console.log('Data selecionada:', selectedDate);
    
    // Filtra agendamentos do dia selecionado
    const agendamentosDoDia = agendamentos.filter(agendamento => {
        const dataAgendamento = agendamento.data;
        console.log('Comparando datas:', {
            agendamento: dataAgendamento,
            selecionada: selectedDate,
            igual: dataAgendamento === selectedDate
        });
        return dataAgendamento === selectedDate;
    });
    
    console.log('Agendamentos do dia:', agendamentosDoDia);

    HORARIOS_DISPONIVEIS.forEach(horario => {
        const agendamento = agendamentosDoDia.find(a => a.horario === horario && a.status !== 'cancelado');
        const slot = document.createElement('div');
        slot.className = 'time-slot';

        console.log(`Verificando horário ${horario}:`, agendamento);

        let statusClass = 'time-slot-available';
        let statusText = 'Disponível';

        if (agendamento) {
            if (agendamento.status === 'pendente') {
                statusClass = 'time-slot-pending';
                statusText = 'Pendente';
            } else if (agendamento.status === 'confirmado') {
                statusClass = 'time-slot-occupied';
                statusText = 'Confirmado';
            }
        }

        slot.innerHTML = `
            <span class="time-slot-hour">${horario}</span>
            <span class="time-slot-status ${statusClass}">${statusText}</span>
            ${agendamento ? `
                <small>${agendamento.nome}</small>
                <small>${formatarServico(agendamento.servico)}</small>
            ` : ''}
        `;

        timeSlotsContainer.appendChild(slot);
    });
}

function exibirAgendamentos(agendamentos) {
    if (!checkAuth()) return;

    const container = document.getElementById('appointments-list');
    container.innerHTML = '';

    agendamentos.sort((a, b) => {
        const dataA = new Date(a.data + 'T' + a.horario);
        const dataB = new Date(b.data + 'T' + b.horario);
        return dataA - dataB;
    });

    agendamentos.forEach(agendamento => {
        const data = new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR');
        
        const element = document.createElement('div');
        element.className = 'appointment-item';
        element.innerHTML = `
            <div data-label="Data:">${data}</div>
            <div data-label="Horário:">${agendamento.horario}</div>
            <div data-label="Cliente:">${agendamento.nome}<br>
                <small>${agendamento.email}<br>${agendamento.telefone}</small>
            </div>
            <div data-label="Serviço:">${formatarServico(agendamento.servico)}</div>
            <div data-label="Status:">
                <span class="status-badge status-${agendamento.status}">${agendamento.status}</span>
            </div>
            <div class="action-buttons">
                ${agendamento.status === 'pendente' ? `
                    <button onclick="atualizarStatus(${agendamento.id}, 'confirmado')" class="btn-action btn-confirmar">
                        Confirmar
                    </button>
                    <button onclick="atualizarStatus(${agendamento.id}, 'cancelado')" class="btn-action btn-cancelar">
                        Cancelar
                    </button>
                ` : ''}
            </div>
        `;
        container.appendChild(element);
    });

    if (agendamentos.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhum agendamento encontrado.</p>';
    }
}

function formatarServico(servico) {
    const servicos = {
        corte: 'Corte de Cabelo',
        barba: 'Barba',
        combo: 'Corte + Barba'
    };
    return servicos[servico] || servico;
}

async function atualizarStatus(id, novoStatus) {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`/api/agendamentos/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: novoStatus })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.erro || 'Erro ao atualizar status');
        }

        await carregarAgendamentos();
        alert(`Status atualizado para ${novoStatus} com sucesso!`);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar status: ' + error.message);
    }
}

function limparFiltros() {
    if (!checkAuth()) return;
    
    const dateFilter = document.getElementById('date-filter');
    const timeFilter = document.getElementById('time-filter');
    const statusFilter = document.getElementById('status-filter');

    const today = new Date().toISOString().split('T')[0];
    dateFilter.value = today;
    timeFilter.value = '';
    statusFilter.value = '';

    carregarAgendamentos();
}
