<?php

namespace Models;

class Contact {

    private string $name;
    private string $email;
    private string $phone;
    private string $message;
    private bool $accept;

    private array $errors = [];

    public function __construct($args = []) {
        $this->name = $args['name'] ?? '';
        $this->email = $args['email'] ?? '';
        $this->phone = $args['phone'] ?? '';
        $this->message = $args['message'] ?? '';
        $this->accept = $args['accept'] ?? false;
    }

    public function getName(): string {
        return $this->name;
    }

    public function setName(string $name): void {
        $this->name = $name;
    }

    public function getEmail(): string {
        return $this->email;
    }

    public function setEmail(string $email): void {
        $this->email = $email;
    }

    public function getPhone(): string {
        return $this->phone;
    }

    public function setPhone(string $phone): void {
        $this->phone = $phone;
    }

    public function getMessage(): string {
        return $this->message;
    }

    public function setMessage(string $message): void {
        $this->message = $message;
    }

    public function getAccept(): bool {
        return $this->accept;
    }

    public function setAccept(bool $accept): void {
        $this->accept = $accept;
    }

    public function getError($key): string {
        return $this->errors[$key] ?? '';
    }

    public function setError($key, $value): void {
        $this->errors[$key] = $value;
    }

    public function getErrors(): array {
        return $this->errors;
    }

    public function setErrors(array $errors): void {
        $this->errors = $errors;
    }

    public function getData(): array {
        return get_object_vars($this);
    }

    public function validate(): array {
        if (!$this->name) {
            $this->errors['name'] = 'El nombre es obligatorio';
        }

        if (!$this->email) {
            $this->errors['email'] = 'El email es obligatorio';
        }

        if ($this->email && !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $this->errors['email'] = 'El email no es válido';
        }

        if (!$this->phone) {
            $this->errors['phone'] = 'El teléfono es obligatorio';
        }

        if (!$this->message) {
            $this->errors['message'] = 'El mensaje es obligatorio';
        }

        if (!$this->accept) {
            $this->errors['accept'] = 'Debes aceptar la política de privacidad';
        }

        return $this->errors;
    }
}
