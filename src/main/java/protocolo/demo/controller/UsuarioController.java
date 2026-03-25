package protocolo.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import protocolo.demo.model.entity.Usuario;
import protocolo.demo.repository.UsuarioRepository;

import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
        @Autowired
        private UsuarioRepository repository;

        // 1. LISTAR TODOS
        @GetMapping
        public List<Usuario> listarTodos() {
            return repository.findAll();
        }

        // 2. CADASTRAR NOVO
        @PostMapping
        public ResponseEntity<?> salvar(@RequestBody Usuario novoUsuario) {
            if (repository.findByLogin(novoUsuario.getLogin()).isPresent() && novoUsuario.getId() == null) {
                return ResponseEntity.badRequest().body("Erro: Este login já está sendo utilizado por outro operador.");
            }
            try {
                if (novoUsuario.getStatus() == null) novoUsuario.setStatus("ATIVO");
                novoUsuario.setPrimeiroAcesso(true);

                Usuario salvo = repository.save(novoUsuario);
                return ResponseEntity.ok(salvo);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Erro ao cadastrar: " + e.getMessage());
            }
        }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Usuario usuarioAtualizado) {
        return repository.findById(id).map(usuarioExistente -> {

            // Atualiza os dados básicos do usuário
            usuarioExistente.setPerfil(usuarioAtualizado.getPerfil());
            usuarioExistente.setConselho(usuarioAtualizado.getConselho());

            // Atualiza os dados da Pessoa amarrada a ele
            if (usuarioExistente.getPessoa() != null && usuarioAtualizado.getPessoa() != null) {
                usuarioExistente.getPessoa().setNomeCompleto(usuarioAtualizado.getPessoa().getNomeCompleto());
                usuarioExistente.getPessoa().setCpf(usuarioAtualizado.getPessoa().getCpf());
                // Adicione o telefone aqui também se você colocou na classe Pessoa!
            }

            // Salva as alterações no banco
            Usuario salvo = repository.save(usuarioExistente);
            return ResponseEntity.ok(salvo);

        }).orElse(ResponseEntity.notFound().build());
    }

        // 4. RESET DE SENHA (Vindo do Painel Admin)
        @PatchMapping("/{id}/senha")
        public ResponseEntity<?> resetarSenha(@PathVariable Long id, @RequestBody Map<String, String> payload) {
            return repository.findById(id).map(usuario -> {
                String novaSenha = payload.get("novaSenha");
                if (novaSenha == null || novaSenha.isEmpty()) {
                    return ResponseEntity.badRequest().body("Senha não informada");
                }
                usuario.setSenha(novaSenha);
                usuario.setPrimeiroAcesso(true);

                repository.save(usuario);
                return ResponseEntity.ok().build();
            }).orElse(ResponseEntity.notFound().build());
        }

        // 5. MUDAR APENAS O STATUS (Ativar/Inativar)
        @PatchMapping("/{id}/status")
        public ResponseEntity<Void> mudarStatus(@PathVariable Long id, @RequestParam String status) {
            return repository.findById(id).map(usuario -> {
                usuario.setStatus(status);
                repository.save(usuario);
                return ResponseEntity.ok().<Void>build();
            }).orElse(ResponseEntity.notFound().build());
        }

        @PatchMapping("/{id}/primeiro-acesso")
        public ResponseEntity<?> atualizarSenhaPrimeiroAcesso(@PathVariable Long id, @RequestBody Map<String, String> payload) {
            return repository.findById(id).map(usuario -> {
                String novaSenha = payload.get("novaSenha");

                if (novaSenha == null || novaSenha.length() < 6) {
                    return ResponseEntity.badRequest().body("Erro: A senha deve ter pelo menos 6 caracteres.");
                }

                usuario.setSenha(novaSenha);
                usuario.setPrimeiroAcesso(false); // DESATIVA a flag de primeiro acesso

                repository.save(usuario);
                return ResponseEntity.ok().build();
            }).orElse(ResponseEntity.notFound().build());
        }
    }

