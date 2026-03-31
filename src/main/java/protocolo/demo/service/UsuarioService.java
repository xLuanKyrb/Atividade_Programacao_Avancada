package protocolo.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import protocolo.demo.model.entity.Usuario;
import protocolo.demo.repository.UsuarioRepository;

import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository; // Injetando o repositório corretamente

    public Usuario autenticar(String login, String senha) {
        System.out.println("Tentativa de login: " + login + " | Senha: " + senha);
        Optional<Usuario> usuarioOpt = usuarioRepository.findByLogin(login);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            if (usuario.getSenha().equals(senha)) {
                if ("INATIVO".equals(usuario.getStatus())){
                    System.out.println("Login incorreto!");
                    return null;
                }
                return usuario;
            } else {
                System.out.println("Login negado: Senha incorreta.");
            }
        } else {
            System.out.println("Login negado: Usuário não encontrado no banco.");
        }
        return null;
    }
}