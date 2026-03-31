package protocolo.demo.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import protocolo.demo.dto.CriarProtocoloRequest;
import protocolo.demo.dto.ProtocoloResponse;
import protocolo.demo.model.entity.Atendimento;
import protocolo.demo.model.entity.Paciente;
import protocolo.demo.model.entity.Pessoa;
import protocolo.demo.model.entity.ProtocoloSepse;
import protocolo.demo.model.entity.Usuario;
import protocolo.demo.repository.AtendimentoRepository;
import protocolo.demo.repository.PacienteRepository;
import protocolo.demo.repository.ProtocoloRepository;
import protocolo.demo.repository.UsuarioRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class ProtocoloService {
    private static final DateTimeFormatter DATA_NASCIMENTO_FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final AtendimentoRepository atendimentoRepository;
    private final ProtocoloRepository protocoloRepository;

    public ProtocoloService(
            UsuarioRepository usuarioRepository,
            PacienteRepository pacienteRepository,
            AtendimentoRepository atendimentoRepository,
            ProtocoloRepository protocoloRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.atendimentoRepository = atendimentoRepository;
        this.protocoloRepository = protocoloRepository;
    }

    @Transactional
    public ProtocoloResponse criar(CriarProtocoloRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Body inválido");
        }
        if (request.getUsuarioId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "usuarioId é obrigatório");
        }
        if (request.getNome() == null || request.getNome().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "nome é obrigatório");
        }

        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário não encontrado"));

        Paciente paciente = new Paciente();
        paciente.setNomeCompleto(request.getNome().trim());
        paciente.setCpf(limparCpf(request.getCpf()));
        paciente.setDataNascimento(parseDataNascimento(request.getDataNascimento()));
        paciente.setNumeroProntuario(valorOuNulo(request.getAtendimento()));
        paciente = pacienteRepository.save(paciente);

        Atendimento atendimento = new Atendimento();
        atendimento.setUsuarioResponsavel(usuario);
        atendimento.setPaciente(paciente);
        atendimento.setDataEntrada(LocalDateTime.now());
        atendimento = atendimentoRepository.save(atendimento);

        ProtocoloSepse protocolo = new ProtocoloSepse();
        protocolo.setAtendimento(atendimento);
        protocolo.setDataAbertura(LocalDateTime.now());
        protocolo.setStatusSepse(valorOuNulo(request.getStatusSepse()));
        protocolo.setResponsavelAbertura(usuario.getLogin());
        protocolo.setFrequenciaCardiaca(parseDouble(request.getFrequenciaCardiaca(), "frequenciaCardiaca"));
        protocolo.setFrequenciaRespiratoria(parseDouble(request.getFrequenciaRespiratoria(), "frequenciaRespiratoria"));
        protocolo.setTemperatura(parseDouble(request.getTemperatura(), "temperatura"));
        protocolo.setPressaoSistolica(parseDouble(request.getPressaoSistolica(), "pressaoSistolica"));
        protocolo.setPressaoDiastolica(parseDouble(request.getPressaoDiastolica(), "pressaoDiastolica"));
        protocolo.setSaturacao(parseDouble(request.getSaturacao(), "saturacao"));
        protocolo.setHoraLactatoSolicitado(parseHora(request.getHoraLactatoSolicitado(), "horaLactatoSolicitado"));
        protocolo.setHoraLactatoColetado(parseHora(request.getHoraLactatoColetado(), "horaLactatoColetado"));
        protocolo.setHoraAntibioticoPrescrito(parseHora(request.getHoraAntibioticoPrescrito(), "horaAntibioticoPrescrito"));
        protocolo.setHoraAntibioticoAdministrado(parseHora(request.getHoraAntibioticoAdministrado(), "horaAntibioticoAdministrado"));

        protocolo = protocoloRepository.save(protocolo);
        return toResponse(protocolo);
    }

    @Transactional(readOnly = true)
    public List<ProtocoloResponse> listar() {
        return protocoloRepository.findAll().stream().map(this::toResponse).toList();
    }

    private ProtocoloResponse toResponse(ProtocoloSepse protocolo) {
        ProtocoloResponse response = new ProtocoloResponse();
        response.setId(protocolo.getId());
        response.setStatusSepse(protocolo.getStatusSepse());
        response.setDataAbertura(protocolo.getDataAbertura());

        Atendimento atendimento = protocolo.getAtendimento();
        if (atendimento != null) {
            response.setAtendimentoId(atendimento.getId());
            Paciente paciente = atendimento.getPaciente();
            if (paciente != null) {
                response.setPacienteId(paciente.getId());
            }
            Usuario usuario = atendimento.getUsuarioResponsavel();
            if (usuario != null) {
                response.setUsuarioId(usuario.getId());
            }
        }

        return response;
    }

    private static String valorOuNulo(String valor) {
        if (valor == null) return null;
        String trimmed = valor.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String limparCpf(String cpf) {
        String valor = valorOuNulo(cpf);
        if (valor == null) return null;
        return valor.replaceAll("\\D", "");
    }

    private static LocalDateTime parseDataNascimento(String valor) {
        String texto = valorOuNulo(valor);
        if (texto == null) return null;
        try {
            LocalDate data = LocalDate.parse(texto, DATA_NASCIMENTO_FORMATO);
            return data.atStartOfDay();
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dataNascimento inválida (use dd/MM/aaaa)");
        }
    }

    private static LocalDateTime parseHora(String valor, String campo) {
        String texto = valorOuNulo(valor);
        if (texto == null) return null;
        try {
            LocalTime hora = LocalTime.parse(texto);
            return LocalDateTime.of(LocalDate.now(), hora);
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, campo + " inválida (use HH:mm)");
        }
    }

    private static Double parseDouble(String valor, String campo) {
        String texto = valorOuNulo(valor);
        if (texto == null) return null;
        try {
            return Double.valueOf(texto.replace(",", "."));
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, campo + " inválido");
        }
    }
}
