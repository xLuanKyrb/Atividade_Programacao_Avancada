package protocolo.demo.dto;

import lombok.Data;

@Data
public class CriarProtocoloRequest {
    private Long usuarioId;

    private String nome;
    private String atendimento;
    private String dataNascimento;
    private String cpf;

    private String frequenciaCardiaca;
    private String frequenciaRespiratoria;
    private String temperatura;
    private String pressaoSistolica;
    private String pressaoDiastolica;
    private String saturacao;

    private String horaLactatoSolicitado;
    private String horaLactatoColetado;
    private String horaAntibioticoPrescrito;
    private String horaAntibioticoAdministrado;

    private String statusSepse;
}
