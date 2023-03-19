<?php

namespace Models;

class Item {
    private string $table = 'item';
    private array $columns = ['id', 'orderId', 'price', 'pages', 'sheets', 'weight', 'size', 'units', 'createdAt', 'updatedAt'];

    private ?int $id;
    private int $orderId;
    private float $price;
    private int $pages;
    private int $sheets;
    private int $weight;
    private int $size;
    private int $units;
    private string $createdAt;
    private string $updatedAt;

    private array $errors = [];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->orderId = $args['orderId'] ?? 0;
        $this->price = $args['price'] ?? 0;
        $this->pages = $args['pages'] ?? 0;
        $this->sheets = $args['sheets'] ?? 0;
        $this->weight = $args['weight'] ?? 0;
        $this->size = $args['size'] ?? 0;
        $this->units = $args['units'] ?? 0;
        $this->createdAt = $args['createdAt'] ?? '';
        $this->updatedAt = $args['updatedAt'] ?? '';
    }

    public function getId(): string {
        return $this->id;
    }

    public function setId(string $id): void {
        $this->id = $id;
    }
    
    public function getOrderId(): int {
        return $this->orderId;
    }

    public function setOrderId(int $orderId): void {
        $this->orderId = $orderId;
    }

    public function getPrice(): float {
        return $this->price;
    }

    public function setPrice(float $price): void {
        $this->price = $price;
    }

    public function getPages(): int {
        return $this->pages;
    }

    public function setPages(int $pages): void {
        $this->pages = $pages;
    }

    public function getSheets(): int {
        return $this->sheets;
    }

    public function setSheets(int $sheets): void {
        $this->sheets = $sheets;
    }

    public function getWeight(): int {
        return $this->weight;
    }

    public function setWeight(int $weight): void {
        $this->weight = $weight;
    }

    public function getSize(): int {
        return $this->size;
    }

    public function setSize(int $size): void {
        $this->size = $size;
    }

    public function getUnits(): int {
        return $this->units;
    }

    public function setUnits(int $units): void {
        $this->units = $units;
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
}
