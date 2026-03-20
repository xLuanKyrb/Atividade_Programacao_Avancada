package protocolo.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "usuario")
@Data
@EqualsAndHashCode(callSuper = true)
public class Usuario extends Pessoa{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String login;

    @Column(nullable = false)
    private String senha;

    private boolean primeiroAcesso = true;
    private String perfil;
    private String status = "ATIVO";
;

}
    
