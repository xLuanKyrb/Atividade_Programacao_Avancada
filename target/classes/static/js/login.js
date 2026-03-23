async function realizarLogin(event) {
    event.preventDefault();
    const valorLogin = document.getElementById('username').value;
    const valorSenha = document.getElementById('password').value;


    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                login: valorLogin, 
                senha: valorSenha
            })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('usuarioLogado', JSON.stringify(data));

            alert('Login bem-sucedido!');
                window.location.href = '/html/cadastro.html';
        } else {
            alert('Login falhou. Verifique suas credenciais.');
        } 
     } catch (error) {
            console.error('Erro durante o login:', error);
            alert('Ocorreu um erro. Tente novamente mais tarde.');
        }
    }


