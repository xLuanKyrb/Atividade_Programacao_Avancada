package protocolo.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import protocolo.demo.dto.LoginDTO;
import protocolo.demo.dto.LoginResponseDTO;
import protocolo.demo.model.entity.Usuario;
import protocolo.demo.service.UsuarioService;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> fazerLogin(@RequestBody LoginDTO loginData){
        Usuario usuarioLogado = usuarioService.autenticar(loginData.getLogin(), loginData.getSenha());

        if (usuarioLogado != null){
            return ResponseEntity.ok(new LoginResponseDTO(
                    usuarioLogado.getId(),
                    usuarioLogado.getLogin(),
                    usuarioLogado.getPerfil(),
                    usuarioLogado.getStatus(),
                    usuarioLogado.isPrimeiroAcesso()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login ou senha incorreta");
        }
    }

}
