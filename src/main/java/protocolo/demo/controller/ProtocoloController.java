package protocolo.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import protocolo.demo.model.entity.ProtocoloSepse;
import protocolo.demo.repository.ProtocoloRepository;

import java.util.List;

public class ProtocoloController {

    @Autowired
    private ProtocoloRepository repository;

    @PostMapping
    public ProtocoloSepse salvar(@RequestBody ProtocoloSepse protocolo){
        return repository.save(protocolo);
    }

    @GetMapping
    public List<ProtocoloSepse> listar(){
        return repository.findAll();
    }
}
