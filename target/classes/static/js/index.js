function renderizarPaciente(paciente) {
    const tabela = document.getElementById('tabela-pacientes');
    const linha = document.createElement('tr');
    linha.innerHTML = `
        <td>${paciente.nome}</td>
        <td>${paciente.atendimento}</td>
        <td>${paciente.dataNascimento}</td>
        <td>${paciente.cpf}</td>
    `;
    tabela.appendChild(linha);
}

const formulario = document.querySelector('form');
formulario.addEventListener('submit', function(event) {
    event.preventDefault();

    const dados = {
        nome: document.getElementById('nome').value,
        atendimento: document.getElementById('atendimento').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        cpf: document.getElementById('cpf').value,

        frequenciaCardiaca: document.getElementById('frequenciaCardiaca').value,
        frequenciaRespiratoria: document.getElementById('frequenciaRespiratoria').value,
        temperatura: document.getElementById('temperatura').value,
        pressaoSistolica: document.getElementById('pressaoSistolica').value,
        pressaoDiastolica: document.getElementById('pressaoDiastolica').value,
        saturacao: document.getElementById('saturacao').value,

        horaLactatoSolicitado: document.getElementById('horaLactatoSolicitado').value,
        horaLactatoColetado: document.getElementById('horaLactatoColetado').value,
        horaAntibioticoPrescrito: document.getElementById('horaAntibioticoPrescrito').value,
        horaAntibioticoAdministrado: document.getElementById('horaAntibioticoAdministrado').value,
        statusSepse: document.getElementById('statusSepse').value
    };

        fetch('http://localhost:8080/api/protocolos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })

        .then(response => {
            if(!response.ok) throw new Error('Erro ao criar protocolo');
            return response.json(); 
        })

        .then(novoProtocolo => {
            renderizarLinhaTabela(novoProtocolo)
            formulario.reset();
            alert('Protocolo criado com sucesso!');
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao criar protocolo. Tente novamente.');
        });
    });