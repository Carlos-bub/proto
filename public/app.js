document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appointment-form');
    
    // Set minimum date to today
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            nome: form.name.value,
            email: form.email.value,
            telefone: form.telefone.value,
            servico: form.service.value,
            data: form.date.value,
            horario: form.time.value
        };

        try {
            const response = await fetch('/api/agendamentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erro || 'Erro ao fazer agendamento');
            }

            alert('Agendamento realizado com sucesso!');
            form.reset();
        } catch (error) {
            alert(error.message);
        }
    });
});
