package protocolo.demo.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Endereco {
    private String ruaResidencia;
    private int numeroResidencia;
    private String cepResidencia;
    private String complementoResidencia;
}
