package protocolo.demo.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Long id;
    private String nomeCompleto;
    private String cpf;
    private String telefone;
    
    private String conselho;
    private String login;
    private String senha;
    private String perfil;
    private String status;
}