<?php

namespace Models;

class Order {
    private string $table = 'order';
    private array $columns = ['id', 'userId', 'number', 'shippingAddressId', 'billingAddressId', 'shippingMethod', 'shippingPrice', 'code', 'discount', 'units', 'subtotal', 'total', 'paid', 'createdAt', 'updatedAt'];

    private ?int $id;
    private int $userId;
    private string $number;
    private int $shippingAddressId;
    private int $billingAddressId;
    private string $shippingMethod;
    private float $shippingPrice;
    private string $code;
    private int $discount;
    private int $units;
    private float $subtotal;
    private float $total;
    private int $paid;
    private string $createdAt;
    private string $updatedAt;

    private array $errors = [];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->userId = $args['userId'] ?? 0;
        $this->number = $args['number'] ?? 0;
        $this->shippingAddressId = $args['shippingAddressId'] ?? 0;
        $this->billingAddressId = $args['billingAddressId'] ?? 0;
        $this->shippingMethod = $args['shippingMethod'] ?? '';
        $this->shippingPrice = $args['shippingPrice'] ?? 0;
        $this->code = $args['code'] ?? '';
        $this->discount = $args['discount'] ?? 0;
        $this->units = $args['units'] ?? 0;
        $this->subtotal = $args['subtotal'] ?? 0;
        $this->total = $args['total'] ?? 0;
        $this->paid = $args['paid'] ?? 0;
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

    public function getNumber(): string {
        return $this->number;
    }

    public function setNumber(string $number): void {
        $this->number = $number;
    }

    public function getShippingAddressId(): int {
        return $this->shippingAddressId;
    }

    public function setShippingAddressId(int $shippingAddressId): void {
        $this->shippingAddressId = $shippingAddressId;
    }

    public function getBillingAddressId(): int {
        return $this->billingAddressId;
    }

    public function setBillingAddressId(int $billingAddressId): void {
        $this->billingAddressId = $billingAddressId;
    }

    public function getShippingMethod(): string {
        return $this->shippingMethod;
    }

    public function setShippingMethod(string $shippingMethod): void {
        $this->shippingMethod = $shippingMethod;
    }

    public function getShippingPrice(): float {
        return $this->shippingPrice;
    }

    public function setShippingPrice(float $shippingPrice): void {
        $this->shippingPrice = $shippingPrice;
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

    public function getUnits(): int {
        return $this->units;
    }

    public function setUnits(int $units): void {
        $this->units = $units;
    }

    public function getSubtotal(): float {
        return $this->subtotal;
    }

    public function setSubtotal(float $subtotal): void {
        $this->subtotal = $subtotal;
    }

    public function getTotal(): float {
        return $this->total;
    }

    public function setTotal(float $total): void {
        $this->total = $total;
    }

    public function getPaid(): int {
        return $this->paid;
    }

    public function setPaid(int $paid): void {
        $this->paid = $paid;
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
