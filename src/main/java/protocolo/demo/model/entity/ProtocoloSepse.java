package protocolo.demo.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class ProtocoloSepse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "atendimento_id")
    private Atendimento atendimento;

    private LocalDateTime dataAbertura;
    private String statusSepse;
    private String responsavelAbertura;

    private Double frequenciaCardiaca;
    private Double frequenciaRespiratoria;
    private Double temperatura;
    private Double pressaoSistolica;
    private Double pressaoDialostica;
    private Double saturacao;
    private LocalDateTime horaLactatoSolicitado;
    private LocalDateTime horaLactadoColetado;
    private LocalDateTime horaAntibioticoPrescrito;
    private LocalDateTime horaAntibioticoAdministrado;
}
