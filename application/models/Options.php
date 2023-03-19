<?php

namespace Models;

class Options {
    private string $table = 'options';
    private array $columns = ['id', 'itemId', 'color', 'copies', 'doubleSided', 'orientation', 'customPages', 'from', 'to', 'size', 'pagesPerSheet', 'binding', 'createdAt', 'updatedAt'];

    private ?int $id;
    private int $itemId;
    private string $color;
    private int $copies;
    private int $doubleSided;
    private string $orientation;
    private string $customPages;
    private int $from;
    private int $to;
    private string $size;
    private int $pagesPerSheet;
    private string $binding;
    private string $createdAt;
    private string $updatedAt;

    private array $errors = [];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->itemId = $args['itemId'] ?? 0;
        $this->color = $args['color'] ?? '';
        $this->copies = $args['copies'] ?? 0;
        $this->doubleSided = $args['doubleSided'] ?? 0;
        $this->orientation = $args['orientation'] ?? '';
        $this->customPages = $args['customPages'] ?? '';
        $this->from = $args['from'] ?? 0;
        $this->to = $args['to'] ?? 0;
        $this->size = $args['size'] ?? '';
        $this->pagesPerSheet = $args['pagesPerSheet'] ?? 0;
        $this->binding = $args['binding'] ?? '';
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

    public function getColor(): string {
        return $this->color;
    }

    public function setColor(string $color): void {
        $this->color = $color;
    }

    public function getCopies(): int {
        return $this->copies;
    }

    public function setCopies(int $copies): void {
        $this->copies = $copies;
    }

    public function getDoubleSided(): int {
        return $this->doubleSided;
    }

    public function setDoubleSided(int $doubleSided): void {
        $this->doubleSided = $doubleSided;
    }

    public function getOrientation(): string {
        return $this->orientation;
    }

    public function setOrientation(string $orientation): void {
        $this->orientation = $orientation;
    }

    public function getCustomPages(): string {
        return $this->customPages;
    }

    public function setCustomPages(string $customPages): void {
        $this->customPages = $customPages;
    }

    public function getFrom(): int {
        return $this->from;
    }

    public function setFrom(int $from): void {
        $this->from = $from;
    }

    public function getTo(): int {
        return $this->to;
    }

    public function setTo(int $to): void {
        $this->to = $to;
    }

    public function getSize(): string {
        return $this->size;
    }

    public function setSize(string $size): void {
        $this->size = $size;
    }

    public function getPagesPerSheet(): int {
        return $this->pagesPerSheet;
    }

    public function setPagesPerSheet(int $pagesPerSheet): void {
        $this->pagesPerSheet = $pagesPerSheet;
    }

    public function getBinding(): string {
        return $this->binding;
    }

    public function setBinding(string $binding): void {
        $this->binding = $binding;
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
