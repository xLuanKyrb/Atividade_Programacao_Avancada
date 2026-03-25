function lerUltimoProtocolo() {
    try {
        return JSON.parse(localStorage.getItem('ultimoProtocolo') || 'null');
    } catch {
        return null;
    }
}

function salvarUltimoProtocolo(valor) {
    localStorage.setItem('ultimoProtocolo', JSON.stringify(valor));
}

function limparUltimoProtocolo() {
    localStorage.removeItem('ultimoProtocolo');
}

function normalizarNumero(valor) {
    if (valor == null) return null;
    const texto = String(valor).trim();
    if (!texto) return null;
    const numero = Number(texto.replace(',', '.'));
    return Number.isFinite(numero) ? numero : null;
}

function criarElemento(tag, props = {}, texto) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([chave, valor]) => {
        if (chave === 'class') el.className = valor;
        else if (chave === 'html') el.innerHTML = valor;
        else el.setAttribute(chave, valor);
    });
    if (texto != null) el.textContent = texto;
    return el;
}

function criarCard(titulo, conteudoEl) {
    const card = criarElemento('article', { class: 'card' });
    card.appendChild(criarElemento('h2', { class: 'card-title' }, titulo));
    card.appendChild(conteudoEl);
    return card;
}

function badge(texto, tipo) {
    return criarElemento('span', { class: `badge badge-${tipo}` }, texto);
}

function classificarSinalVital(chave, valorNumerico) {
    if (valorNumerico == null) return { label: 'Não informado', tipo: 'muted' };

    switch (chave) {
        case 'frequenciaCardiaca':
            if (valorNumerico < 60) return { label: 'Atenção (baixa)', tipo: 'warn' };
            if (valorNumerico > 100) return { label: 'Atenção (alta)', tipo: 'warn' };
            return { label: 'OK', tipo: 'ok' };
        case 'frequenciaRespiratoria':
            if (valorNumerico > 20) return { label: 'Atenção (alta)', tipo: 'warn' };
            if (valorNumerico < 12) return { label: 'Atenção (baixa)', tipo: 'warn' };
            return { label: 'OK', tipo: 'ok' };
        case 'temperatura':
            if (valorNumerico >= 38) return { label: 'Atenção (febre)', tipo: 'warn' };
            if (valorNumerico < 35) return { label: 'Atenção (baixa)', tipo: 'warn' };
            return { label: 'OK', tipo: 'ok' };
        case 'pressaoSistolica':
            if (valorNumerico < 90) return { label: 'Atenção (baixa)', tipo: 'warn' };
            if (valorNumerico > 140) return { label: 'Atenção (alta)', tipo: 'warn' };
            return { label: 'OK', tipo: 'ok' };
        case 'pressaoDiastolica':
            if (valorNumerico < 60) return { label: 'Atenção (baixa)', tipo: 'warn' };
            if (valorNumerico > 90) return { label: 'Atenção (alta)', tipo: 'warn' };
            return { label: 'OK', tipo: 'ok' };
        case 'saturacao':
            if (valorNumerico < 92) return { label: 'Atenção (baixa)', tipo: 'warn' };
            return { label: 'OK', tipo: 'ok' };
        default:
            return { label: 'OK', tipo: 'ok' };
    }
}

function criarLinha(label, valor, badgeEl) {
    const row = criarElemento('div', { class: 'row' });
    row.appendChild(criarElemento('span', { class: 'row-label' }, label));
    row.appendChild(criarElemento('span', { class: 'row-value' }, valor ?? '-'));
    if (badgeEl) row.appendChild(badgeEl);
    return row;
}

function renderDashboard(root, protocolo) {
    root.innerHTML = '';

    if (!protocolo || !protocolo.request) {
        const vazio = criarElemento('div', { class: 'empty' });
        vazio.appendChild(criarElemento('h2', {}, 'Nenhum protocolo encontrado'));
        vazio.appendChild(
            criarElemento(
                'p',
                {},
                'Preencha o formulário em “Cadastro” para gerar um dashboard automaticamente.'
            )
        );
        root.appendChild(vazio);
        return;
    }

    const request = protocolo.request;
    const response = protocolo.response || null;

    const paciente = criarElemento('div', { class: 'rows' });
    paciente.appendChild(criarLinha('Nome', request.nome));
    paciente.appendChild(criarLinha('Atendimento/Prontuário', request.atendimento));
    paciente.appendChild(criarLinha('Data de nascimento', request.dataNascimento));
    paciente.appendChild(criarLinha('CPF', request.cpf));
    if (response?.pacienteId) paciente.appendChild(criarLinha('ID Paciente', String(response.pacienteId)));
    if (response?.atendimentoId) paciente.appendChild(criarLinha('ID Atendimento', String(response.atendimentoId)));
    root.appendChild(criarCard('Paciente', paciente));

    const status = criarElemento('div', { class: 'rows' });
    status.appendChild(criarLinha('Status Sepse', request.statusSepse || 'Não informado'));
    if (response?.id) status.appendChild(criarLinha('ID Protocolo', String(response.id)));
    if (protocolo.createdAt) status.appendChild(criarLinha('Gerado em', new Date(protocolo.createdAt).toLocaleString()));
    const origem = protocolo.mode === 'api' ? badge('Salvo no sistema', 'ok') : badge('Somente local', 'muted');
    status.appendChild(criarLinha('Origem', '', origem));
    root.appendChild(criarCard('Status', status));

    const sinais = criarElemento('div', { class: 'rows' });
    const sinaisConfig = [
        { key: 'frequenciaCardiaca', label: 'FC', unit: 'bpm' },
        { key: 'frequenciaRespiratoria', label: 'FR', unit: 'irpm' },
        { key: 'temperatura', label: 'Temperatura', unit: '°C' },
        { key: 'pressaoSistolica', label: 'PAS', unit: 'mmHg' },
        { key: 'pressaoDiastolica', label: 'PAD', unit: 'mmHg' },
        { key: 'saturacao', label: 'Saturação', unit: '%' }
    ];

    sinaisConfig.forEach(({ key, label, unit }) => {
        const numero = normalizarNumero(request[key]);
        const texto = numero == null ? (request[key] || null) : `${numero} ${unit}`;
        const classif = classificarSinalVital(key, numero);
        sinais.appendChild(criarLinha(label, texto, badge(classif.label, classif.tipo)));
    });
    root.appendChild(criarCard('Sinais Vitais', sinais));

    const tempos = criarElemento('div', { class: 'rows' });
    tempos.appendChild(criarLinha('Lactato solicitado', request.horaLactatoSolicitado));
    tempos.appendChild(criarLinha('Lactato coletado', request.horaLactatoColetado));
    tempos.appendChild(criarLinha('Antibiótico prescrito', request.horaAntibioticoPrescrito));
    tempos.appendChild(criarLinha('Antibiótico administrado', request.horaAntibioticoAdministrado));
    root.appendChild(criarCard('Linha do Tempo', tempos));
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('dashboard-root');
    const btnLimpar = document.getElementById('btn-limpar');
    if (!root) return;

    const protocolo = lerUltimoProtocolo();
    renderDashboard(root, protocolo);

    btnLimpar?.addEventListener('click', () => {
        limparUltimoProtocolo();
        salvarUltimoProtocolo({ request: null });
        renderDashboard(root, null);
        alert('Dados removidos.');
    });
});

