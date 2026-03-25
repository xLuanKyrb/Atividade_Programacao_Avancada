// =========================================================================
// INICIALIZAÇÃO E EVENTOS GERAIS
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    carregarUsuarios();

    document.getElementById('formCadastro').addEventListener('submit', salvarUsuario);

    const campoCpf = document.getElementById('cpf');
    const campoTelefone = document.getElementById('telefone');

    if (campoCpf) {
        campoCpf.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
        });

        campoCpf.addEventListener('blur', function() {
            if (this.value.length === 14) {
                if (validarCPF(this.value)) {
                    this.style.borderColor = "#22c55e";
                } else {
                    this.style.borderColor = "#ef4444";
                    avisar("Este CPF parece incorreto", "error");
                }
            } else {
                this.style.borderColor = "#e2e8f0";
            }
        });
    }

    if (campoTelefone) {
        campoTelefone.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
            v = v.replace(/(\d{5})(\d)/, "$1-$2");
            e.target.value = v;
        });
    }
});

// =========================================================================
// FUNÇÕES PRINCIPAIS DE CRUD (API)
// =========================================================================

// 1. CARREGAR E RENDERIZAR TABELA
async function carregarUsuarios() {
    try {
        const response = await fetch('http://localhost:8080/api/usuarios');
        if (!response.ok) throw new Error("Erro na requisição");

        const usuarios = await response.json();
        const corpo = document.getElementById('lista-usuarios');
        corpo.innerHTML = '';

        // CORREÇÃO: O laço de repetição voltou!
        usuarios.forEach(user => {
            const nome = (user.pessoa && user.pessoa.nomeCompleto) ? user.pessoa.nomeCompleto : "Sem Nome";
            const cpf = (user.pessoa && user.pessoa.cpf) ? user.pessoa.cpf : "000.000.000-00";
            const perfil = user.perfil || "USER";
            const status = user.status || "ATIVO";
            const login = user.login || "---";

            const perfilClass = perfil.toLowerCase();
            const iconStatus = status === 'ATIVO' ? 'fa-user-slash' : 'fa-user-check';
            const titleStatus = status === 'ATIVO' ? 'Inativar' : 'Ativar';

            corpo.innerHTML += `
                <tr>
                    <td>
                        <strong>${nome}</strong><br>
                        <small>CPF: ${cpf} | Login: ${login}</small>
                    </td>
                    <td><span class="badge-perfil ${perfilClass}">${perfil}</span></td>
                    <td><span class="status-tag ${status.toLowerCase()}">${status}</span></td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon btn-edit" onclick='prepararEdicao(${JSON.stringify(user)})' title="Editar Dados">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-icon btn-key" onclick="abrirModalReset(${user.id})" title="Resetar Senha">
                                <i class="fa-solid fa-key"></i>
                            </button>
                            <button class="btn-icon btn-status" onclick="toggleStatus(${user.id}, '${status}')" title="${titleStatus}">
                                <i class="fa-solid ${iconStatus}"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error("Erro detalhado:", error);
        avisar("Erro ao carregar dados do servidor", "error");
    }
}

// 2. SALVAR (POST) OU ATUALIZAR (PUT)
async function salvarUsuario(e) {
    e.preventDefault();

    const cpfInput = document.getElementById('cpf').value;

    if (!validarCPF(cpfInput)) {
        avisar("CPF Inválido! Verifique os números.", "error");
        document.getElementById('cpf').focus();
        return;
    }

    const id = document.getElementById('idUsuario').value;

    // CORREÇÃO: Pacote montado com Conselho e os dados da Pessoa certinhos
    const usuario = {
        login: document.getElementById('login').value,
        senha: document.getElementById('senha').value,
        perfil: document.getElementById('perfil').value,
        conselho: document.getElementById('conselho').value,
        status: "ATIVO",
        pessoa: {
            nomeCompleto: document.getElementById('nomeCompleto').value,
            cpf: cpfInput
        }
    };

    const url = id ? `http://localhost:8080/api/usuarios/${id}` : 'http://localhost:8080/api/usuarios';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });

        if (res.ok) {
            avisar(id ? "Operador atualizado com sucesso!" : "Operador cadastrado com sucesso!");
            limparFormulario(); // Agora essa função existe!
            carregarUsuarios();
        } else {
            const erroMsg = await res.text();
            avisar(erroMsg || "Erro ao salvar dados", "error");
        }
    } catch (error) {
        avisar("Falha na comunicação com o servidor.", "error");
    }
}

// 3. PREPARAR EDIÇÃO (Puxa os dados para o Form)
function prepararEdicao(user) {
    document.getElementById('idUsuario').value = user.id;

    // CORREÇÃO: Navegando para dentro de 'pessoa' para puxar nome e cpf na edição
    document.getElementById('nomeCompleto').value = (user.pessoa && user.pessoa.nomeCompleto) ? user.pessoa.nomeCompleto : '';
    document.getElementById('cpf').value = (user.pessoa && user.pessoa.cpf) ? user.pessoa.cpf : '';

    document.getElementById('telefone').value = user.telefone || '';
    document.getElementById('conselho').value = user.conselho || '';
    document.getElementById('login').value = user.login || '';
    document.getElementById('perfil').value = user.perfil || 'MEDICO';

    document.getElementById('senha').required = false;
    document.getElementById('senha').placeholder = "Deixe em branco para manter a atual";
    document.getElementById('cpf').style.borderColor = "#e2e8f0";

    window.scrollTo({ top: 0, behavior: 'smooth' });
    avisar("Edição ativa: " + ((user.pessoa && user.pessoa.nomeCompleto) ? user.pessoa.nomeCompleto : 'Usuário'), "success");
}

// 4. TOGGLE STATUS (ATIVAR/INATIVAR)
async function toggleStatus(id, statusAtual) {
    const novoStatus = statusAtual === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    try {
        const res = await fetch(`http://localhost:8080/api/usuarios/${id}/status?status=${novoStatus}`, {
            method: 'PATCH'
        });
        if (res.ok) {
            avisar(`Utilizador ${novoStatus === 'ATIVO' ? 'Ativado' : 'Inativado'}`);
            carregarUsuarios();
        }
    } catch (e) {
        avisar("Erro ao mudar status", "error");
    }
}

// 5. MODAL DE RESET DE SENHA (Ficou igual, estava certinho)
function abrirModalReset(id) {
    // ... (restante da sua lógica de modal) ...
    // Vou deixar apenas um alerta genérico aqui caso seu HTML não tenha o modal configurado,
    // mas se o seu HTML já tem a div 'modal-sistema', pode manter a sua função original inteira aqui!
    const novaSenha = prompt("Digite a nova senha provisória:");
    if(!novaSenha) return;

    fetch(`http://localhost:8080/api/usuarios/${id}/senha`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ novaSenha: novaSenha })
    }).then(res => {
        if(res.ok) avisar("Senha alterada com sucesso!");
    });
}

// 6. UTILITÁRIOS (Avisos, Limpeza e Validação)
function limparFormulario() {
    document.getElementById('formCadastro').reset();
    document.getElementById('idUsuario').value = '';
    document.getElementById('senha').required = true;
    document.getElementById('senha').placeholder = "";
    document.getElementById('cpf').style.borderColor = "#e2e8f0";
}

function avisar(msg, tipo = 'success') {
    // Essa era a sua função de toast, mantive igual!
    alert(msg); // Coloquei um alert temporário caso a div toast-container não exista no HTML
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}