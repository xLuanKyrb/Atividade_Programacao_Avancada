package protocolo.demo.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import protocolo.demo.dto.UsuarioDTO;
import protocolo.demo.model.entity.Telefone;
import protocolo.demo.model.entity.Usuario;
import protocolo.demo.model.enums.TipoTelefone;
import protocolo.demo.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @GetMapping
    public List<UsuarioDTO> listarTodos() {
        return repository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody UsuarioDTO dto) {
        if (repository.findByLogin(dto.getLogin()).isPresent()) {
            return ResponseEntity.badRequest().body("Erro: Este login já está sendo utilizado.");
        }

        try {
            Usuario novoUsuario = new Usuario();

            // Setamos os dados de Pessoa diretamente no Usuario (Herança)
            novoUsuario.setNomeCompleto(dto.getNomeCompleto());
            novoUsuario.setCpf(dto.getCpf());

            // Dados específicos de acesso
            novoUsuario.setLogin(dto.getLogin());
            novoUsuario.setSenha(dto.getSenha());
            novoUsuario.setPerfil(dto.getPerfil());
            novoUsuario.setConselho(dto.getConselho());
            novoUsuario.setStatus(dto.getStatus() == null ? "ATIVO" : dto.getStatus());
            novoUsuario.setPrimeiroAcesso(true);

            // Tratamento do telefone
            if (dto.getTelefone() != null && !dto.getTelefone().isEmpty()) {
                Telefone tel = new Telefone();
                tel.setNumero(dto.getTelefone());
                tel.setTipo(TipoTelefone.CELULAR);
                tel.setPrincipal(true);
                // Vinculamos o telefone ao Usuario (que é uma Pessoa)
                tel.setPessoa(novoUsuario);
                novoUsuario.getTelefones().add(tel);
            }

            Usuario salvo = repository.save(novoUsuario);
            return ResponseEntity.ok(converterParaDTO(salvo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao cadastrar: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody UsuarioDTO dto) {
        return repository.findById(id).map(usuarioExistente -> {

            // Atualiza dados de acesso
            usuarioExistente.setPerfil(dto.getPerfil());
            usuarioExistente.setConselho(dto.getConselho());
            if (dto.getSenha() != null && !dto.getSenha().isEmpty()) {
                usuarioExistente.setSenha(dto.getSenha());
            }

            // Atualiza dados herdados de Pessoa
            usuarioExistente.setNomeCompleto(dto.getNomeCompleto());
            usuarioExistente.setCpf(dto.getCpf());

            if (dto.getTelefone() != null && !dto.getTelefone().isEmpty()) {
                if (usuarioExistente.getTelefones().isEmpty()) {
                    Telefone tel = new Telefone();
                    tel.setNumero(dto.getTelefone());
                    tel.setTipo(TipoTelefone.CELULAR);
                    tel.setPrincipal(true);
                    tel.setPessoa(usuarioExistente);
                    usuarioExistente.getTelefones().add(tel);
                } else {
                    usuarioExistente.getTelefones().get(0).setNumero(dto.getTelefone());
                }
            }

            Usuario salvo = repository.save(usuarioExistente);
            return ResponseEntity.ok(converterParaDTO(salvo));

        }).orElse(ResponseEntity.notFound().build());
    }

    // Métodos de Reset de Senha, Status e Primeiro Acesso permanecem iguais...

    private UsuarioDTO converterParaDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setLogin(usuario.getLogin());
        dto.setPerfil(usuario.getPerfil());
        dto.setStatus(usuario.getStatus());
        dto.setConselho(usuario.getConselho());

        dto.setNomeCompleto(usuario.getNomeCompleto());
        dto.setCpf(usuario.getCpf());

        if (usuario.getTelefones() != null && !usuario.getTelefones().isEmpty()) {
            dto.setTelefone(usuario.getTelefones().get(0).getNumero());
        }

        return dto;
    }
}