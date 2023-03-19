<?php

namespace Models;

class Address {
    private string $table = 'address';
    private array $columns = ['id', 'userId', 'name', 'lastname', 'phone', 'nif', 'address', 'postcode', 'location', 'province', 'country', 'type', 'predetermined', 'createdAt', 'updatedAt'];

    private ?int $id;
    private int $userId;
    private string $name;
    private string $lastname;
    private string $phone;
    private string $nif;
    private string $address;
    private string $postcode;
    private string $location;
    private string $province;
    private string $country;
    private string $type;
    private int $predetermined;
    private string $createdAt;
    private string $updatedAt;

    private array $errors = [];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->userId = $args['userId'] ?? 0;
        $this->name = $args['name'] ?? '';
        $this->lastname = $args['lastname'] ?? '';
        $this->phone = $args['phone'] ?? '';
        $this->nif = $args['nif'] ?? '';
        $this->address = $args['address'] ?? '';
        $this->postcode = $args['postcode'] ?? '';
        $this->location = $args['location'] ?? '';
        $this->province = $args['province'] ?? '';
        $this->country = $args['country'] ?? '';
        $this->type = $args['type'] ?? '';
        $this->predetermined = $args['predetermined'] ?? 0;
        $this->createdAt = $args['createdAt'] ?? '';
        $this->updatedAt = $args['updatedAt'] ?? '';
    }

    public function getId(): string {
        return $this->id;
    }

    public function setId(string $id): void {
        $this->id = $id;
    }

    public function getUserId(): int {
        return $this->userId;
    }

    public function setUserId(int $userId): void {
        $this->userId = $userId;
    }

    public function getName(): string {
        return $this->name;
    }

    public function setName(string $name): void {
        $this->name = $name;
    }

    public function getLastname(): string {
        return $this->lastname;
    }

    public function setLastname(string $lastname): void {
        $this->lastname = $lastname;
    }

    public function getPhone(): string {
        return $this->phone;
    }

    public function setPhone(string $phone): void {
        $this->phone = $phone;
    }

    public function getNif(): string {
        return $this->nif;
    }

    public function setNif(string $nif): void {
        $this->nif = $nif;
    }

    public function getAddress(): string {
        return $this->address;
    }

    public function setAddress(string $address): void {
        $this->address = $address;
    }

    public function getPostcode(): string {
        return $this->postcode;
    }

    public function setPostcode(string $postcode): void {
        $this->postcode = $postcode;
    }

    public function getLocation(): string {
        return $this->location;
    }

    public function setLocation(string $location): void {
        $this->location = $location;
    }

    public function getProvince(): string {
        return $this->province;
    }

    public function setProvince(string $province): void {
        $this->province = $province;
    }

    public function getCountry(): string {
        return $this->country;
    }

    public function setCountry(string $country): void {
        $this->country = $country;
    }

    public function getType(): string {
        return $this->type;
    }

    public function setType(string $type): void {
        $this->type = $type;
    }

    public function getPredetermined(): int {
        return $this->predetermined;
    }

    public function setPredetermined(int $predetermined): void {
        $this->predetermined = $predetermined;
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
        if (!$this->name) {
            $this->errors['name'] = 'El nombre es obligatorio';
        }

        if (!$this->lastname) {
            $this->errors['lastname'] = 'Los apellidos son obligatorios';
        }

        if (!$this->phone) {
            $this->errors['phone'] = 'El teléfono es obligatorio';
        }

        if (!$this->nif) {
            $this->errors['nif'] = 'El NIF es obligatorio';
        }

        if (!$this->address) {
            $this->errors['address'] = 'La dirección es obligatoria';
        }

        if (!$this->postcode) {
            $this->errors['postcode'] = 'El código postal es obligatorio';
        }

        if (!$this->location) {
            $this->errors['location'] = 'La localidad es obligatoria';
        }

        if (!$this->province) {
            $this->errors['province'] = 'La provincia es obligatoria';
        }

        if (!$this->country) {
            $this->errors['country'] = 'El país es obligatorio';
        }

        return $this->errors;
    }
}
