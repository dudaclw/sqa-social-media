package com.demoapp.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.demoapp.demo.dto.EmailDTO;
import com.demoapp.demo.dto.ErrorResponse;
import com.demoapp.demo.dto.UserDTO;
import com.demoapp.demo.model.User;
import com.demoapp.demo.service.UserService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {

  private final UserService service;

  public AuthController(UserService service) {
    this.service = service;
  }

  @PostMapping("/signup")
  public ResponseEntity<?> signup(@RequestBody UserDTO userDTO) {
    if (!service.isEmailValid(userDTO.getEmail())) {
      return ResponseEntity
          .status(422)
          .body(new ErrorResponse("E-mail inválido", 422));
    }

    if (!service.isPasswordValid(userDTO.getPassword())) {
      return ResponseEntity
          .status(422)
          .body(new ErrorResponse("Senha inválida", 422));
    }

    if (service.findByEmail(userDTO.getEmail()) != null) {
      return ResponseEntity
          .status(409)
          .body(new ErrorResponse("E-mail já cadastrado", 409));
    }

    User createdUser = service.createUser(userDTO.getEmail(), userDTO.getPassword());
    return ResponseEntity.ok(createdUser);
  }

  @PostMapping("/signin")
  public ResponseEntity<?> signin(@RequestBody UserDTO userDTO) {
    if (!service.isEmailValid(userDTO.getEmail())) {
      return ResponseEntity
          .status(422)
          .body(new ErrorResponse("E-mail inválido", 422));
    }

    if (!service.isPasswordValid(userDTO.getPassword())) {
      return ResponseEntity
          .status(422)
          .body(new ErrorResponse("Senha inválida", 422));
    }

    User user = service.findByEmail(userDTO.getEmail());

    if (user == null || !user.getPassword().equals(userDTO.getPassword())) {
      return ResponseEntity
          .status(401)
          .body(new ErrorResponse("Credenciais inválidas", 401));
    }
    return ResponseEntity.ok(user);
  }

  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody EmailDTO emailDTO) {
    if (!service.isEmailValid(emailDTO.getEmail())) {
      return ResponseEntity
          .status(422)
          .body(new ErrorResponse("E-mail inválido", 422));
    }

    User user = service.findByEmail(emailDTO.getEmail());

    if (user == null) {
      return ResponseEntity
          .status(404)
          .body(new ErrorResponse("Usuário não encontrado", 404));
    }

    return ResponseEntity.ok(Map.of("message", "E-mail enviado com sucesso"));
  }

}
