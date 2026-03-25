function renderizarPaciente(paciente) {
    const tabela = document.getElementById('tabela-pacientes');
    if (!tabela) return;

    const linha = document.createElement('tr');
    linha.innerHTML = `
        <td>${paciente.nome || ''}</td>
        <td>${paciente.atendimento || ''}</td>
        <td>${paciente.dataNascimento || ''}</td>
        <td>${paciente.cpf || ''}</td>
    `;
    tabela.appendChild(linha);
}

const formulario = document.getElementById('protocolo-form') || document.querySelector('form');

function lerCampo(chave) {
    const porId = document.getElementById(chave);
    if (porId) return porId.value;

    const porName = formulario?.elements?.namedItem(chave);
    return porName ? porName.value : '';
}

function coletarDadosFormulario() {
    return {
        nome: lerCampo('nome'),
        atendimento: lerCampo('atendimento'),
        dataNascimento: lerCampo('dataNascimento'),
        cpf: lerCampo('cpf'),
        frequenciaCardiaca: lerCampo('frequenciaCardiaca'),
        frequenciaRespiratoria: lerCampo('frequenciaRespiratoria'),
        temperatura: lerCampo('temperatura'),
        pressaoSistolica: lerCampo('pressaoSistolica'),
        pressaoDiastolica: lerCampo('pressaoDiastolica'),
        saturacao: lerCampo('saturacao'),
        horaLactatoSolicitado: lerCampo('horaLactatoSolicitado'),
        horaLactatoColetado: lerCampo('horaLactatoColetado'),
        horaAntibioticoPrescrito: lerCampo('horaAntibioticoPrescrito'),
        horaAntibioticoAdministrado: lerCampo('horaAntibioticoAdministrado'),
        statusSepse: lerCampo('statusSepse')
    };
}

function formatarData(valor) {
    const digitos = valor.replace(/\D/g, '').slice(0, 8);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}
function formatarCpf(valor) {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    return digitos
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function formatarHora(valor) {
    const digitos = valor.replace(/\D/g, '').slice(0, 4);
    if (digitos.length <= 2) return digitos;
    return `${digitos.slice(0, 2)}:${digitos.slice(2)}`;
}

function aplicarMascaras() {
    const cpf = document.getElementById('cpf');
    const horas = [
        document.getElementById('lactatoPrescrito'),
        document.getElementById('lactatoColetado'),
        document.getElementById('antibioticoPrescrito'),
        document.getElementById('antibioticoAdministrado')
    ].filter(Boolean);
    const dataNascimento = document.getElementById('dataNascimento');

    if (dataNascimento) {
        dataNascimento.addEventListener('input', () => {
            dataNascimento.value = formatarData(dataNascimento.value);
            validarCampo(dataNascimento);
            atualizarPreview();
        });
    }

    if (cpf) {
        cpf.addEventListener('input', () => {
            cpf.value = formatarCpf(cpf.value);
            validarCampo(cpf);
            atualizarPreview();
        });
    }

    horas.forEach((campo) => {
        campo.addEventListener('input', () => {
            campo.value = formatarHora(campo.value);
            validarCampo(campo);
            atualizarPreview();
        });
    });
}

function validarCampo(campo) {
    if (!campo || campo.dataset.required !== 'true') return true;

    const valido = campo.value.trim() !== '';
    campo.classList.toggle('campo-invalido', !valido);
    return valido;
}

function validarObrigatorios() {
    const obrigatorios = formulario.querySelectorAll('[data-required="true"]');
    let tudoValido = true;

    obrigatorios.forEach((campo) => {
        const ok = validarCampo(campo);
        if (!ok) tudoValido = false;
    });

    return tudoValido;
}

function atualizarPreview() {
    const dados = coletarDadosFormulario();

    Object.entries(dados).forEach(([chave, valor]) => {
        const alvo = document.getElementById(`preview-${chave}`);
        if (!alvo) return;

        const texto = valor && valor.trim() ? valor : '-';
        alvo.textContent = texto;

        const linha = document.querySelector(`[data-preview-field="${chave}"]`);
        if (linha) {
            linha.classList.toggle('oculto', texto === '-');
        }
    });
}

if (formulario) {
    aplicarMascaras();
    atualizarPreview();

    formulario.addEventListener('input', (event) => {
        if (event.target instanceof HTMLInputElement) {
            validarCampo(event.target);
        }
        atualizarPreview();
    });

    formulario.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!validarObrigatorios()) {
            alert('Preencha os campos obrigatórios destacados em vermelho.');
            return;
        }

        const dados = coletarDadosFormulario();

        const origemEhBackend =
            window.location.protocol !== 'file:' &&
            (window.location.port === '8080' || window.location.port === '');
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

        if (origemEhBackend) {
            if (!usuarioLogado || !usuarioLogado.id) {
                alert('Você precisa estar logado para enviar o protocolo.');
                window.location.href = '/html/index.html';
                return;
            }
            dados.usuarioId = usuarioLogado.id;
        }

        const registroLocal = {
            request: dados,
            response: null,
            mode: 'local',
            createdAt: new Date().toISOString()
        };

        function salvarEIrParaDashboard(registro) {
            localStorage.setItem('ultimoProtocolo', JSON.stringify(registro));
            window.location.href = '/html/dashboard.html';
        }

        if (!origemEhBackend) {
            salvarEIrParaDashboard(registroLocal);
            return;
        }

        fetch('/api/protocolos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
            .then((response) => {
                if (!response.ok) throw new Error('Erro ao criar protocolo');
                return response.json();
            })
            .then((novoProtocolo) => {
                salvarEIrParaDashboard({
                    ...registroLocal,
                    response: novoProtocolo,
                    mode: 'api'
                });
            })
            .catch((error) => {
                console.error('Erro:', error);
                alert('Não foi possível salvar no servidor. Vou mostrar o dashboard apenas com os dados locais.');
                salvarEIrParaDashboard(registroLocal);
            });
    });

}
