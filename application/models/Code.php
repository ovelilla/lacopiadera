<?php

namespace Models;

class Code {
    private string $table = 'code';
    private array $columns = ['id', 'name', 'code', 'discount', 'active', 'createdAt', 'updatedAt'];

    private ?int $id;
    private string $name;
    private string $code;
    private int $discount;
    private int $active;
    private string $createdAt;
    private string $updatedAt;

    private array $errors = [];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->name = $args['name'] ?? '';
        $this->code = $args['code'] ?? '';
        $this->discount = $args['discount'] ?? 0;
        $this->active = $args['active'] ?? 1;
        $this->createdAt = $args['createdAt'] ?? '';
        $this->updatedAt = $args['updatedAt'] ?? '';
    }

    public function getId(): ?int {
        return $this->id;
    }

    public function setId(int $id): void {
        $this->id = $id;
    }

    public function getName(): string {
        return $this->name;
    }

    public function setName(string $name): void {
        $this->name = $name;
    }

    public function getCode(): string {
        return $this->code;
    }

    public function setCode(string $code): void {
        $this->code = $code;
    }

    public function getDiscount(): int {
        return $this->discount;
    }

    public function setDiscount(int $discount): void {
        $this->discount = $discount;
    }

    public function getActive(): int {
        return $this->active;
    }

    public function setActive(int $active): void {
        $this->active = $active;
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

    public function validate(): array {
        if (empty($this->name)) {
            $this->errors['name'] = 'El nombre no puede estar vacío';
        }
        if (empty($this->code)) {
            $this->errors['code'] = 'El código no puede estar vacío';
        }
        if (empty($this->discount)) {
            $this->errors['discount'] = 'El descuento no es válido';
        }
        return $this->errors;
    }
}
