document.addEventListener('DOMContentLoaded', () => {
    carregarUsuarios();
    document.getElementById('formCadastro').addEventListener('submit', salvarUsuario);

    // Formatação automática de CPF e Telefone
    const campoCpf = document.getElementById('cpf');
    if (campoCpf) {
        campoCpf.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
        });
    }
});

// 1. LISTAR (Ajustado para a Herança do Java)
async function carregarUsuarios() {
    try {
        const response = await fetch('http://localhost:8080/api/usuarios');
        if (!response.ok) throw new Error("Erro na requisição");

        const usuarios = await response.json();
        const corpo = document.getElementById('lista-usuarios');
        corpo.innerHTML = '';

        usuarios.forEach(user => {
            // Com HERANÇA, os dados estão na raiz do objeto 'user'
            const nome = user.nomeCompleto || 'Sem Nome';
            const cpf = user.cpf || '---';
            const login = user.login || '';
            const perfil = user.perfil || '';
            const status = user.status || 'ATIVO';

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
        console.error("Erro:", error);
        avisar("Erro ao carregar lista", "error");
    }
}

// 2. SALVAR/ATUALIZAR (Envia um objeto "flat" para o Java)
async function salvarUsuario(e) {
    e.preventDefault();

    const id = document.getElementById('idUsuario').value;
    const cpfInput = document.getElementById('cpf').value;

    const usuario = {
        nomeCompleto: document.getElementById('nomeCompleto').value,
        cpf: cpfInput,
        telefone: document.getElementById('telefone').value,
        login: document.getElementById('login').value,
        senha: document.getElementById('senha').value,
        perfil: document.getElementById('perfil').value,
        conselho: document.getElementById('conselho').value,
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
            avisar(id ? "Operador atualizado!" : "Operador cadastrado!");
            limparFormulario();
            carregarUsuarios();
        } else {
            const msg = await res.text();
            avisar(msg, "error");
        }
    } catch (error) {
        avisar("Erro de conexão", "error");
    }
}

// 3. PREPARAR EDIÇÃO (Lê direto de 'user')
function prepararEdicao(user) {
    document.getElementById('idUsuario').value = user.id;
    document.getElementById('nomeCompleto').value = user.nomeCompleto || '';
    document.getElementById('cpf').value = user.cpf || '';
    document.getElementById('telefone').value = user.telefone || '';
    document.getElementById('conselho').value = user.conselho || '';
    document.getElementById('login').value = user.login || '';
    document.getElementById('perfil').value = user.perfil || 'MEDICO';

    document.getElementById('senha').required = false;
    document.getElementById('senha').placeholder = "Deixe em branco para manter";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Funções Auxiliares (Avisar, Limpar, Validar)
function avisar(msg, tipo = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function limparFormulario() {
    document.getElementById('formCadastro').reset();
    document.getElementById('idUsuario').value = '';
    document.getElementById('senha').required = true;
    document.getElementById('senha').placeholder = "";
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11) return false;
    return true; // Simplificado para teste
}