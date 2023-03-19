<?php

namespace Models;

use Controllers\PagesController;

class Router {
    private Session $session;

    private string $url;
    private string $request_method;
    private array $data;

    private array $routes = [];
    private array $params = [];

    public function __construct(Session $session) {
        $this->session = $session;

        $this->url = $_SERVER['REQUEST_URI'];
        $this->request_method = $_SERVER['REQUEST_METHOD'];

        $this->data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    }

    public function session(): Session {
        return $this->session;
    }

    public function getUrl(): string {
        return $this->url;
    }

    public function getRequestMethod(): string {
        return $this->request_method;
    }

    public function getData(): array {
        return $this->data;
    }

    public function getValue(string $key): string {
        return $this->data[$key] ?? '';
    }

    public function getFiles(): array {
        return $_FILES;
    }

    public function getRoutes(): array {
        return $this->routes;
    }

    public function getParam(string $key): ?string {
        return $this->params[$key] ?? null;
    }

    public function getParams(): array {
        return $this->params;
    }

    public function response(array $data): void {
        echo json_encode($data);
    }

    public function get(string $route, array $controller, bool $auth = false): void {
        $this->routes['GET'][$route] = [
            'controller' => $controller,
            'auth' => $auth
        ];
    }

    public function post(string $route, array $controller, bool $auth = false): void {
        $this->routes['POST'][$route] = [
            'controller' => $controller,
            'auth' => $auth
        ];
    }

    public function put(string $route, array $controller, bool $auth = false): void {
        $this->routes['PUT'][$route] = [
            'controller' => $controller,
            'auth' => $auth
        ];
    }

    public function delete(string $route, array $controller, bool $auth = false): void {
        $this->routes['DELETE'][$route] = [
            'controller' => $controller,
            'auth' => $auth
        ];
    }

    public function check(): void {
        if (!isset($this->routes[$this->request_method])) {
            $this->error();
            return;
        }

        $routes = $this->routes[$this->request_method];
        $routes = array_keys($routes);

        foreach ($routes as $route) {
            preg_match_all("/{+(.*?)}/", $route, $matches);
            $params = $matches[1];

            if (empty($params) && $route !== $this->url) {
                continue;
            }

            if (empty($params) && $route === $this->url) {
                $this->run($this->url);
                return;
            }

            $route_clean = trim($route, '/');
            $url_clean = trim($this->url, '/');

            $route_array = explode("/", $route_clean);
            $url_array = explode("/", $url_clean);

            $params_index = [];
            foreach ($route_array as $key => $value) {
                if (preg_match("/{.*}/", $value)) {
                    $params_index[] = $key;
                }
            }

            $pattern_array = $url_array;
            foreach ($params_index as $param) {
                if (!array_key_exists($param, $url_array)) {
                    continue;
                }

                $pattern_array[$param] = "{.*}";
            }

            $pattern = '/' . str_replace("/", '\\/', implode("/", $pattern_array)) . '/';
            $match = preg_match($pattern, $route_clean);

            if (!$match) {
                continue;
            }

            foreach ($params_index as $key => $value) {
                $this->params[$params[$key]] = $url_array[$value];
            }

            $this->run($route);
            return;
        }

        $this->error();
    }

    private function run(string $route) {
        if ($this->routes[$this->request_method][$route]['auth'] && !$this->session->isAuth()) {
            $this->redirect('/login');
            return;
        }

        $function = $this->routes[$this->request_method][$route]['controller'] ?? null;

        call_user_func($function, $this);
    }

    private function error(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            $response = [
                'status' => 'error',
                'message' => 'Bad request'
            ];

            echo json_encode($response);
            return;
        }
        call_user_func([PagesController::class, 'error'], $this);
    }

    public function render($view, $data) {
        foreach ($data as $key => $value) {
            $$key = $value;
        }

        ob_start();
        include __DIR__ . "/../views/$view.php";
        $content = ob_get_contents();
        ob_end_clean();

        include __DIR__ . '/../views/layout.php';
    }

    public function redirect(string $url): void {
        header("Location: $url");
        exit;
    }
}
