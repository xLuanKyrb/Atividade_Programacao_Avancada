package protocolo.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import protocolo.demo.model.entity.Atendimento;

public interface AtendimentoRepository extends JpaRepository<Atendimento, Long> {
}
