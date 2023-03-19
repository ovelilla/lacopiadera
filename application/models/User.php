<?php

namespace Models;

class User {
    private string $table = 'user';
    private array $columns = ['id', 'email', 'password', 'token', 'confirmed', 'admin', 'createdAt', 'updatedAt'];

    private ?int $id;
    private string $email;
    private string $password;
    private string $newPassword;
    private string $currentPassword;
    private string $token;
    private int $confirmed;
    private int $admin;
    private string $createdAt;
    private string $updatedAt;

    private array $errors = [];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->email = $args['email'] ?? '';
        $this->password = $args['password'] ?? '';
        $this->newPassword = $args['newPassword'] ?? '';
        $this->currentPassword = $args['currentPassword'] ?? '';
        $this->token = $args['token'] ?? '';
        $this->confirmed = $args['confirmed'] ?? 0;
        $this->admin = $args['admin'] ?? 0;
        $this->createdAt = $args['createdAt'] ?? '';
        $this->updatedAt = $args['updatedAt'] ?? '';
    }

    public function getId(): string {
        return $this->id;
    }

    public function setId(string $id): void {
        $this->id = $id;
    }

    public function getEmail(): string {
        return $this->email;
    }

    public function setEmail(string $email): void {
        $this->email = $email;
    }

    public function getNewPassword(): string {
        return $this->newPassword;
    }

    public function setNewPassword(string $newPassword): void {
        $this->newPassword = $newPassword;
    }

    public function getCurrentPassword(): string {
        return $this->currentPassword;
    }

    public function setCurrentPassword(string $currentPassword): void {
        $this->currentPassword = $currentPassword;
    }

    public function getToken(): string {
        return $this->token;
    }

    public function setToken(string $token): void {
        $this->token = $token;
    }

    public function getConfirmed(): int {
        return $this->confirmed;
    }

    public function setConfirmed(int $confirmed): void {
        $this->confirmed = $confirmed;
    }

    public function getAdmin(): int {
        return $this->admin;
    }

    public function setAdmin(int $admin): void {
        $this->admin = $admin;
    }

    public function getCreatedAt(): string {
        return $this->createdAt;
    }

    public function setCreatedAt(string $createdAt): void {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): string {
        return $this->updatedAt;
    }

    public function setUpdatedAt(string $updatedAt): void {
        $this->updatedAt = $updatedAt;
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
        $data = [];
        foreach ($this->columns as $column) {
            if ($column === 'id') continue;
            $data[$column] = $this->$column;
        }
        return $data;
    }

    public function setData(array $data): void {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key) && !is_null($value)) {
                $this->$key = $value;
            }
        }
    }

    public function getFullData(): array {
        $data = [];
        foreach ($this->columns as $column) {
            $data[$column] = $this->$column;
        }
        return $data;
    }

    public function getTable(): string {
        return $this->table;
    }

    public function validateEmail(): void {
        if (!$this->email) {
            $this->errors['email'] = 'El email es obligatorio';
        }
        if ($this->email && !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $this->errors['email'] = 'El email no es válido';
        }
    }

    public function validateNewPassword(): void {
        if (!$this->newPassword) {
            $this->errors['newPassword'] = 'La contraseña es obligatoria';
        }
        if ($this->newPassword && strlen($this->newPassword) < 6) {
            $this->errors['newPassword'] = 'La contraseña debe contener al menos 6 caracteres';
        }
    }

    public function validateCurrentPassword(): void {
        if (!$this->currentPassword) {
            $this->errors['currentPassword'] = 'La contraseña es obligatoria';
        }
        if ($this->currentPassword && strlen($this->currentPassword) < 6) {
            $this->errors['currentPassword'] = 'La contraseña debe contener al menos 6 caracteres';
        }
    }

    public function validateRegister(): array {
        $this->validateEmail();
        $this->validateNewPassword();

        return $this->errors;
    }

    public function validateLogin(): array {
        $this->validateEmail();
        $this->validateCurrentPassword();

        return $this->errors;
    }

    public function validateRecover(): array {
        $this->validateEmail();

        return $this->errors;
    }

    public function validateRestore(): array {
        $this->validateNewPassword();

        return $this->errors;
    }

    public function validateProfile(): array {
        $this->validateEmail();

        return $this->errors;
    }

    public function checkPassword(): bool {
        return password_verify($this->currentPassword, $this->password);
    }

    public function hashPassword(): void {
        $this->password = password_hash($this->newPassword, PASSWORD_BCRYPT);
    }

    public function createToken(): void {
        $this->token = randomId(64);
    }
}
