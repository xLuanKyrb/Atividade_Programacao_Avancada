package protocolo.demo.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "paciente")
@Data
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumn(name = "pessoa_id")
public class Paciente extends Pessoa {

    private String numeroProntuario;
    private String tipoSanguineo;
    private String alergias;
}