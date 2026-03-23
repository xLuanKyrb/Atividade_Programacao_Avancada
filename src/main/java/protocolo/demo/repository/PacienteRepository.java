package protocolo.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import protocolo.demo.model.entity.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
}
