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

        // Validação visual de cor da borda ao sair do campo (Blur)
        campoCpf.addEventListener('blur', function() {
            if (this.value.length === 14) {
                if (validarCPF(this.value)) {
                    this.style.borderColor = "#22c55e"; // Verde se ok
                } else {
                    this.style.borderColor = "#ef4444"; // Vermelho se erro
                    avisar("Este CPF parece incorreto", "error");
                }
            } else {
                this.style.borderColor = "#e2e8f0"; // Volta ao normal se incompleto
            }
        });
    }

    if (campoTelefone) {
        // Máscara de Telefone: (00) 00000-0000
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

        usuarios.forEach(user => {
            const nome = user.nomeCompleto || "Sem Nome";
            const perfil = user.perfil || "USER";
            const status = user.status || "ATIVO";
            const cpf = user.cpf || "000.000.000-00";
            const login = user.login || "---";

            const perfilClass = perfil.toLowerCase();

            // Define o ícone e a cor baseada no status atual
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
        avisar("Erro ao processar dados do servidor", "error");
    }
}

// 2. SALVAR (POST) OU ATUALIZAR (PUT)
async function salvarUsuario(e) {
    e.preventDefault();

    const cpfInput = document.getElementById('cpf').value;

    // Validação matemática do CPF antes de enviar ao servidor
    if (!validarCPF(cpfInput)) {
        avisar("CPF Inválido! Verifique os números.", "error");
        document.getElementById('cpf').focus();
        return;
    }

    const id = document.getElementById('idUsuario').value;
    const modulos = Array.from(document.querySelectorAll('input[name="modulo"]:checked'))
                         .map(cb => cb.value).join(',');

    const usuario = {
        nomeCompleto: document.getElementById('nomeCompleto').value,
        cpf: cpfInput,
        telefone: document.getElementById('telefone').value,
        conselho: document.getElementById('conselho').value,
        login: document.getElementById('login').value,
        senha: document.getElementById('senha').value,

        status: "ATIVO"
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
            limparFormulario();
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
    document.getElementById('nomeCompleto').value = user.nomeCompleto || '';
    document.getElementById('cpf').value = user.cpf || '';
    document.getElementById('telefone').value = user.telefone || '';
    document.getElementById('conselho').value = user.conselho || '';
    document.getElementById('login').value = user.login || '';
    document.getElementById('senha').required = false;
    document.getElementById('senha').placeholder = "Deixe em branco para manter a atual";
    document.getElementById('cpf').style.borderColor = "#e2e8f0"; // Reseta borda do CPF

    window.scrollTo({ top: 0, behavior: 'smooth' });
    avisar("Edição ativa: " + user.nomeCompleto, "success");
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

// 5. MODAL DE RESET DE SENHA
function abrirModalReset(id) {
    const modal = document.getElementById('modal-sistema');
    const inputCont = document.getElementById('modal-input-container');
    document.getElementById('modal-titulo').innerText = "Resetar Senha";
    document.getElementById('modal-mensagem').innerText = "Defina a nova senha provisória:";
    inputCont.innerHTML = `<input type="password" id="novaSenhaModal" placeholder="Nova Senha" style="width:100%; padding:10px; margin-top:10px; border-radius:6px; border:1px solid #ddd;">`;

    modal.style.display = 'flex';

    document.getElementById('modal-btn-confirmar').onclick = async () => {
        const novaSenha = document.getElementById('novaSenhaModal').value;
        if(!novaSenha) return avisar("Introduza uma senha!", "error");

        const res = await fetch(`http://localhost:8080/api/usuarios/${id}/senha`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ novaSenha: novaSenha })
        });

        if(res.ok) {
            avisar("Senha alterada com sucesso!");
            fecharModal();
        }
    };
}

function fecharModal() {
    document.getElementById('modal-sistema').style.display = 'none';
}

function avisar(msg, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
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