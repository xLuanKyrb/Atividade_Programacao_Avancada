package protocolo.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import protocolo.demo.model.entity.Usuario;

import java.util.Optional;

@Repository
public interface CadastroUsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByLogin(String login);
}