package protocolo.demo.dto;

public record LoginResponseDTO(
        Long id,
        String login,
        String perfil,
        String status,
        boolean primeiroAcesso
) {}
