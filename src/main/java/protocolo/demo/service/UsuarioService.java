package protocolo.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import protocolo.demo.model.entity.Usuario;
import protocolo.demo.repository.UsuarioRepository;

import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    public Usuario autenticar(String login, String senha){
    Optional<Usuario> usuarioOpt = repository.findByLogin(login);

    if (usuarioOpt.isPresent()&& usuarioOpt.get().getSenha().equals(senha)){
        return usuarioOpt.get();
    }

    return null;
    }
}
