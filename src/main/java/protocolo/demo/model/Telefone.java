package protocolo.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "telefone")
@Data
public class Telefone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String numero;

    @Column(nullable = false)
    private String tipo;

    private String observacao;
    private boolean isWhatsApp = false;
}
