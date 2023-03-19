<?php

namespace Models;

class File {
    private string $table = 'file';
    private array $columns = ['id', 'itemId', 'name', 'size', 'type', 'pages', 'unitSheets', 'totalSheets', 'unitPrice', 'totalPrice', 'unitWeight', 'totalWeight', 'file', 'image', 'createdAt', 'updatedAt'];

    private ?int $id;
    private int $itemId;
    private string $name;
    private int $size;
    private string $type;
    private int $pages;
    private int $unitSheets;
    private int $totalSheets;
    private float $unitPrice;
    private float $totalPrice;
    private int $unitWeight;
    private int $totalWeight;
    private string $file;
    private string $image;
    private string $createdAt;
    private string $updatedAt;

    private array $errors = [];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->itemId = $args['itemId'] ?? 0;
        $this->name = $args['name'] ?? '';
        $this->size = $args['size'] ?? 0;
        $this->type = $args['type'] ?? '';
        $this->pages = $args['pages'] ?? 0;
        $this->unitSheets = $args['unitSheets'] ?? 0;
        $this->totalSheets = $args['totalSheets'] ?? 0;
        $this->unitPrice = $args['unitPrice'] ?? 0;
        $this->totalPrice = $args['totalPrice'] ?? 0;
        $this->unitWeight = $args['unitWeight'] ?? 0;
        $this->totalWeight = $args['totalWeight'] ?? 0;
        $this->createdAt = $args['createdAt'] ?? '';
        $this->updatedAt = $args['updatedAt'] ?? '';
    }

    public function getId(): string {
        return $this->id;
    }

    public function setId(string $id): void {
        $this->id = $id;
    }
    
    
    public function getItemId(): int {
        return $this->itemId;
    }

    public function setItemId(int $itemId): void {
        $this->itemId = $itemId;
    }

    public function getName(): string {
        return $this->name;
    }

    public function setName(string $name): void {
        $this->name = $name;
    }

    public function getSize(): int {
        return $this->size;
    }

    public function setSize(int $size): void {
        $this->size = $size;
    }

    public function getType(): string {
        return $this->type;
    }

    public function setType(string $type): void {
        $this->type = $type;
    }

    public function getPages(): int {
        return $this->pages;
    }

    public function setPages(int $pages): void {
        $this->pages = $pages;
    }

    public function getUnitSheets(): int {
        return $this->unitSheets;
    }

    public function setUnitSheets(int $unitSheets): void {
        $this->unitSheets = $unitSheets;
    }

    public function getTotalSheets(): int {
        return $this->totalSheets;
    }

    public function setTotalSheets(int $totalSheets): void {
        $this->totalSheets = $totalSheets;
    }

    public function getUnitPrice(): float {
        return $this->unitPrice;
    }

    public function setUnitPrice(float $unitPrice): void {
        $this->unitPrice = $unitPrice;
    }

    public function getTotalPrice(): float {
        return $this->totalPrice;
    }

    public function setTotalPrice(float $totalPrice): void {
        $this->totalPrice = $totalPrice;
    }

    public function getUnitWeight(): int {
        return $this->unitWeight;
    }

    public function setUnitWeight(int $unitWeight): void {
        $this->unitWeight = $unitWeight;
    }

    public function getTotalWeight(): int {
        return $this->totalWeight;
    }

    public function setTotalWeight(int $totalWeight): void {
        $this->totalWeight = $totalWeight;
    }

    public function getFile(): string {
        return $this->file;
    }

    public function setFile(string $file): void {
        $this->file = $file;
    }

    public function getImage(): string {
        return $this->image;
    }

    public function setImage(string $image): void {
        $this->image = $image;
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
