package protocolo.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import protocolo.demo.model.entity.Usuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByLogin(String login);
}
