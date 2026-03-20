package protocolo.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import protocolo.demo.dto.LoginDTO;
import protocolo.demo.model.entity.Usuario;
import protocolo.demo.service.UsuarioService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> fazerLogin(@RequestBody LoginDTO loginData){
        Usuario usuarioLogado = usuarioService.autenticar(loginData.getLogin(), loginData.getSenha());

        if (usuarioLogado != null){
            return ResponseEntity.ok(usuarioLogado);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login ou senha incorreta");
        }
    }

}
