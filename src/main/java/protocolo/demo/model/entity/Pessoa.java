package protocolo.demo.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import protocolo.demo.model.embeddable.Endereco;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pessoa")
@Data
public class Pessoa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeCompleto;
    private String cpf;
    private String rg;
    private String cns;
    private LocalDateTime dataNascimento;

    @OneToMany(mappedBy = "pessoa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Telefone> telefones = new ArrayList<>();

    @Embedded
    private Endereco endereco;
}
