package protocolo.demo.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import protocolo.demo.model.enums.GrauParentesco;
import protocolo.demo.model.enums.TipoTelefone;

@Entity
@Table(name = "telefone")
@Data
public class Telefone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTelefone tipo;

    private String nomeContato;

    @Enumerated(EnumType.STRING)
    private GrauParentesco grauParentesco;

    private boolean principal = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pessoa_id", nullable = false)
    private Pessoa pessoa;
}
