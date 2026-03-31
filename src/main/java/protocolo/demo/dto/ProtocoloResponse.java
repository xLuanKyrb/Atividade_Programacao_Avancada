package protocolo.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProtocoloResponse {
    private Long id;
    private Long usuarioId;
    private Long pacienteId;
    private Long atendimentoId;
    private String statusSepse;
    private LocalDateTime dataAbertura;
}
