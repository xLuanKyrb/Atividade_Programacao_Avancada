package protocolo.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "pessoa")
@Data
public class Pessoa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeCompleto;

    @Column(unique = true, nullable = false)
    private String cpf;

    private String rg;
    private String cns;
    private LocalDateTime dataNascimento;
    private String telefoneResidencial;
    private String telefoneCelular;


    @Embeddable
    private Endereco endereco;
}
