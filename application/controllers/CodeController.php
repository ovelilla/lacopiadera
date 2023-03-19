<?php

namespace Controllers;

use Models\Router;
use Models\DB;
use Models\Code;

use Exception;
use Error;

class CodeController {
    public static function validate(Router $router) {
        $data = $router->getData();

        $code = new Code($data);

        try {
            $codeExists = DB::table('code')
                ->select()
                ->where('code', '=', $code->getCode())
                ->andWhere('active', '=', 1)
                ->limit(1)
                ->getOne();

            if (!$codeExists) {
                $code->setError('code', 'El código no es válido');
                $errors = $code->getErrors();

                $response = [
                    'status' => 'error',
                    'errors' => $errors
                ];

                $router->response($response);
                return;
            }

            $code->setData($codeExists);

            $response = [
                'status' => 'success',
                'message' => 'Código válidado correctamente',
                'discount' => $code->getDiscount()
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function readCodes(Router $router) {
        try {
            $codes = DB::table('code')
                ->select()
                ->get();

            $response = [
                'status' => 'success',
                'message' => 'Códigos obtenidos correctamente',
                'codes' => $codes
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function createCode(Router $router) {
        $data = $router->getData();
        $code = new Code($data);

        $errors = $code->validate();

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'message' => 'Error al crear el código',
                'errors' => $errors,
            ];
            $router->response($response);
            return;
        }

        $code->setCreatedAt(date('Y-m-d H:i:s'));
        $code->setUpdatedAt(date('Y-m-d H:i:s'));

        try {
            $insertData = DB::table('code')
                ->insert($code->getData())
                ->execute();

            $code->setId($insertData['insert_id']);

            $response = [
                'status' => 'success',
                'message' => 'Tratamiento creado correctamente',
                'code' => $code->getFullData()
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function updateCode(Router $router) {
        $data = $router->getData();
        $code = new Code($data);

        $errors = $code->validate();

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'message' => 'Error al actualizar el código',
                'errors' => $errors,
            ];
            $router->response($response);
            return;
        }

        $code->setUpdatedAt(date('Y-m-d H:i:s'));

        try {
            DB::table('code')
                ->update($code->getData())
                ->where('id', '=', $code->getId())
                ->execute();

            $response = [
                'status' => 'success',
                'message' => 'Tratamiento actualizado correctamente',
                'code' => $code->getFullData()
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function deleteCode(Router $router) {
        $data = $router->getData();
        $code = new Code($data);

        try {
            DB::table('code')
                ->delete()
                ->where('id', '=', $code->getId())
                ->execute();

            $response = [
                'status' => 'success',
                'message' => 'Código eliminado correctamente',
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function deleteCodes(Router $router) {
        $data = $router->getData();

        $id = [];
        foreach ($data as $code) {
            $id[] = $code['id'];
        }

        try {
            DB::table('code')
                ->delete()
                ->whereIn('id', $id)
                ->execute();

            $response = [
                'status' => 'success',
                'message' => 'Códigos eliminados correctamente',
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function updateCodeActive(Router $router) {
        $data = $router->getData();

        $code = new Code($data);

        $code->setUpdatedAt(date('Y-m-d H:i:s'));

        try {
            DB::table('code')
                ->update($code->getData())
                ->where('id', '=', $code->getId())
                ->execute();

            $response = [
                'status' => 'success',
                'message' => 'Código actualizado correctamente',
                'code' => $code->getFullData()
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }
}
