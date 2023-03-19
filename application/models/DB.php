<?php

namespace Models;

use mysqli;
use Exception;
use Error;

class DB {
    private static string $db_host;
    private static string $db_user;
    private static string $db_pass;
    private static string $db_name;

    private static object $connection;
    private static bool $transaction = false;

    private static string $table = '';

    private static string $query = '';
    private static string $types = '';
    private static array $values = [];

    public static function connect(): void {
        self::$db_host = $_ENV['DB_HOST'];
        self::$db_user = $_ENV['DB_USER'];
        self::$db_pass = $_ENV['DB_PASS'];
        self::$db_name = $_ENV['DB_NAME'];

        try {
            self::$connection = new mysqli(self::$db_host, self::$db_user, self::$db_pass, self::$db_name);
            self::$connection->set_charset('utf8mb4');
        } catch (Exception | Error $e) {
            throw new Exception($e->getMessage());
        }
    }

    public static function disconnect(): void {
        self::$connection->close();
    }

    public static function isConnected(): bool {
        return self::$connection->ping();
    }

    public static function hasConnectionError(): bool {
        return self::$connection->connect_errno;
    }

    public static function lastInsertId(): int {
        return self::$connection->insert_id;
    }

    public static function table(string $table): DB {
        self::$table = $table;

        return new self();
    }

    public static function select(): DB {
        $args = func_get_args();

        if (empty($args)) {
            $columns = '*';
        } else {
            $columns = self::escape($args);
        }

        self::$query .= "SELECT $columns FROM " . self::escape([self::$table]);

        return new self();
    }

    public static function selectExists(callable $callback): DB {
        self::$query .= "SELECT EXISTS(";
        $callback();
        self::$query .= ")";

        return new self();
    }

    public static function join(string $table, string $column1, string $column2): DB {
        $column1 = self::escape([$column1]);
        $column2 = self::escape([$column2]);

        self::$query .= " INNER JOIN `$table` ON $column1 = $column2";

        return new self();
    }

    public static function where(string $column, string $operator, string $value): DB {
        $column = self::escape([$column]);

        self::$types .= "s";
        self::$values[] = $value;

        self::$query .= " WHERE $column $operator ?";

        return new self();
    }

    public function andWhere(string $column, string $operator, string $value): DB {
        $column = self::escape([$column]);

        self::$types .= "s";
        self::$values[] = $value;

        self::$query .= " AND $column $operator ?";

        return new self();
    }

    public function orWhere(string $column, string $operator, string $value): DB {
        $column = self::escape([$column]);

        self::$types .= "s";
        self::$values[] = $value;

        self::$query .= " OR $column $operator ?";

        return new self();
    }

    public function whereIn(string $column, array $values): DB {
        if (empty($values)) {
            return new self();
        }

        $column = self::escape([$column]);
        $parameters = str_repeat('?,', count($values) - 1) . '?';

        self::$types .= str_repeat('s', count($values));
        self::$values = array_merge(self::$values, $values);

        self::$query .= " WHERE $column IN ($parameters)";

        return new self();
    }

    public static function orderBy(string $column, string $direction): DB {
        $column = self::escape([$column]);

        self::$query .= " ORDER BY $column $direction";

        return new self();
    }

    public static function groupBy(string $column): DB {
        $column = self::escape([$column]);

        self::$query .= " GROUP BY $column";

        return new self();
    }

    public static function limit(int $limit): DB {
        self::$query .= " LIMIT $limit";

        return new self();
    }

    public static function offset(int $offset): DB {
        self::$query .= " OFFSET $offset";

        return new self();
    }

    public static function paginate(int $page, int $perPage): DB {
        self::limit($perPage);
        self::offset(($page - 1) * $perPage);

        return new self();
    }

    public static function count(): DB {
        self::$query = "SELECT COUNT(*) FROM " . self::escape([self::$table]);
        return new self();
    }

    public static function beginTransaction(): void {
        self::connect();
        self::$transaction = true;
        self::$connection->begin_transaction();
    }

    public static function commit(): void {
        self::$transaction = false;
        self::$connection->commit();
        self::disconnect();
    }

    public static function rollback(): void {
        self::$transaction = false;
        self::$connection->rollback();
        self::disconnect();
    }

    public static function get(): array {
        if (!self::$transaction) {
            self::connect();
        }

        $stmt = self::$connection->prepare(self::$query);
        if (self::$values) {
            $stmt->bind_param(self::$types, ...self::$values);
        }
        $stmt->execute();

        $result = $stmt->get_result();
        $rows = $result->num_rows;
        $result = self::fetch($result, $rows);

        $stmt->close();

        if (!self::$transaction) {
            self::disconnect();
        }

        self::$query = '';
        self::$types = '';
        self::$values = [];

        return $result;
    }

    public static function getOne(): array {
        $result = self::get();
        return $result[0] ?? [];
    }

    public static function insert(array $data): DB {
        $columns = array_keys($data);
        $columns = self::escape($columns);

        self::$values = array_values($data);
        $parameters = str_repeat('?,', count(self::$values) - 1) . '?';
        self::$types = str_repeat('s', count(self::$values));

        self::$query = "INSERT INTO " . self::escape([self::$table]) . " ($columns) VALUES ($parameters)";

        return new self();
    }

    public static function update(array $data): DB {
        $columns = array_keys($data);

        self::$values = array_values($data);
        self::$types = str_repeat('s', count(self::$values));
        self::$query = "UPDATE " . self::escape([self::$table]) . " SET ";

        foreach ($columns as $i => $column) {
            self::$query .= $i ? ', ' : '';
            self::$query .= self::escape([$column]) . " = ?";
        }

        return new self();
    }

    public static function delete(): DB {
        self::$query = "DELETE FROM " . self::escape([self::$table]);

        return new self();
    }

    public static function execute(): array {
        if (!self::$transaction) {
            self::connect();
        }

        $stmt = self::$connection->prepare(self::$query);
        $stmt->bind_param(self::$types, ...self::$values);
        $stmt->execute();

        $insert_id = $stmt->insert_id;
        $affected_rows = $stmt->affected_rows;

        $stmt->close();

        if (!self::$transaction) {
            self::disconnect();
        }

        self::$query = '';
        self::$types = '';
        self::$values = [];

        return [
            'insert_id' => $insert_id,
            'affected_rows' => $affected_rows
        ];
    }

    private static function fetch(object $result, int $rows): array {
        while ($row = $result->fetch_assoc()) {
            $array[] = $row;
        }
        return $array ?? [];
    }

    private static function escape(array $columns): string {
        return implode(', ', array_map(function ($column) {
            return implode(' AS ', array_map(function ($column) {
                $exists = str_contains($column, 'CONCAT');

                if ($exists) {
                    $column = str_replace(['CONCAT(', ')'], '', $column);
                }

                $column = implode(', ', array_map(function ($column) {
                    return implode('.', array_map(function ($column) {
                        if ($column === '*' || $column === "' '" || is_numeric($column)) {
                            return $column;
                        } else {
                            return "`" . str_replace("`", "``", $column) . "`";
                        }
                    }, explode('.', $column)));
                }, explode(', ', $column)));

                return $exists ? 'CONCAT(' . $column . ')' : $column;
            }, explode(' AS ', $column)));
        }, $columns));
    }

    public static function getQuery(): string {
        return self::$query;
    }
}
