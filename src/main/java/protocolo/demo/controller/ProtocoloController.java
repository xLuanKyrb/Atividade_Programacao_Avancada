package protocolo.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import protocolo.demo.dto.CriarProtocoloRequest;
import protocolo.demo.dto.ProtocoloResponse;
import protocolo.demo.service.ProtocoloService;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/protocolos")
public class ProtocoloController {

    private final ProtocoloService protocoloService;

    public ProtocoloController(ProtocoloService protocoloService) {
        this.protocoloService = protocoloService;
    }

    @PostMapping
    public ResponseEntity<ProtocoloResponse> criar(@RequestBody CriarProtocoloRequest request) {
        ProtocoloResponse criado = protocoloService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @GetMapping
    public List<ProtocoloResponse> listar() {
        return protocoloService.listar();
    }
}
