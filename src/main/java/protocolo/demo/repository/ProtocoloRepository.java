package protocolo.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import protocolo.demo.model.entity.ProtocoloSepse;

public interface ProtocoloRepository extends JpaRepository<ProtocoloSepse, Long> {
}
