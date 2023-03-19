<?php

namespace Models;

class RedsysAPI {
    private $vars_pay = [];

    public function setParameter($key, $value) {
        $this->vars_pay[$key] = $value;
    }

    public function getParameter($key) {
        return $this->vars_pay[$key];
    }

    private function encrypt_3DES($message, $key) {
        $l = ceil(strlen($message) / 8) * 8;
        return substr(openssl_encrypt($message . str_repeat("\0", $l - strlen($message)), 'des-ede3-cbc', $key, OPENSSL_RAW_DATA, "\0\0\0\0\0\0\0\0"), 0, $l);
    }

    private function base64_url_encode($input) {
        return strtr(base64_encode($input), '+/', '-_');
    }

    private function encodeBase64($data) {
        $data = base64_encode($data);
        return $data;
    }

    private function base64_url_decode($input) {
        return base64_decode(strtr($input, '-_', '+/'));
    }

    private function decodeBase64($data) {
        $data = base64_decode($data);
        return $data;
    }

    private function mac256($ent, $key) {
        $res = hash_hmac('sha256', $ent, $key, true);
        return $res;
    }

    private function getOrder() {
        $numPedido = "";
        if (empty($this->vars_pay['DS_MERCHANT_ORDER'])) {
            $numPedido = $this->vars_pay['Ds_Merchant_Order'];
        } else {
            $numPedido = $this->vars_pay['DS_MERCHANT_ORDER'];
        }
        return $numPedido;
    }

    function arrayToJson() {
        $json = json_encode($this->vars_pay);
        return $json;
    }

    public function createMerchantParameters() {
        $json = $this->arrayToJson();
        return $this->encodeBase64($json);
    }

    public function createMerchantSignature($key) {
        $key = $this->decodeBase64($key);
        $ent = $this->createMerchantParameters();
        $key = $this->encrypt_3DES($this->getOrder(), $key);
        $res = $this->mac256($ent, $key);
        return $this->encodeBase64($res);
    }

    private function getOrderNotif() {
        $numPedido = "";
        if (empty($this->vars_pay['Ds_Order'])) {
            $numPedido = $this->vars_pay['DS_ORDER'];
        } else {
            $numPedido = $this->vars_pay['Ds_Order'];
        }
        return $numPedido;
    }

    private function getOrderNotifSOAP($datos) {
        $posPedidoIni = strrpos($datos, "<Ds_Order>");
        $tamPedidoIni = strlen("<Ds_Order>");
        $posPedidoFin = strrpos($datos, "</Ds_Order>");
        return substr($datos, $posPedidoIni + $tamPedidoIni, $posPedidoFin - ($posPedidoIni + $tamPedidoIni));
    }

    private function getRequestNotifSOAP($datos) {
        $posReqIni = strrpos($datos, "<Request");
        $posReqFin = strrpos($datos, "</Request>");
        $tamReqFin = strlen("</Request>");
        return substr($datos, $posReqIni, ($posReqFin + $tamReqFin) - $posReqIni);
    }

    private function getResponseNotifSOAP($datos) {
        $posReqIni = strrpos($datos, "<Response");
        $posReqFin = strrpos($datos, "</Response>");
        $tamReqFin = strlen("</Response>");
        return substr($datos, $posReqIni, ($posReqFin + $tamReqFin) - $posReqIni);
    }

    private function stringToArray($datosDecod) {
        $this->vars_pay = json_decode($datosDecod, true);
    }

    public function decodeMerchantParameters($datos) {
        $decodec = $this->base64_url_decode($datos);
        $this->stringToArray($decodec);
        return $decodec;
    }

    public function createMerchantSignatureNotif($key, $datos) {
        $key = $this->decodeBase64($key);
        $decodec = $this->base64_url_decode($datos);
        $this->stringToArray($decodec);
        $key = $this->encrypt_3DES($this->getOrderNotif(), $key);
        $res = $this->mac256($datos, $key);
        return $this->base64_url_encode($res);
    }

    public function createMerchantSignatureNotifSOAPRequest($key, $datos) {
        $key = $this->decodeBase64($key);
        $datos = $this->getRequestNotifSOAP($datos);
        $key = $this->encrypt_3DES($this->getOrderNotifSOAP($datos), $key);
        $res = $this->mac256($datos, $key);
        return $this->encodeBase64($res);
    }

    public function createMerchantSignatureNotifSOAPResponse($key, $datos, $numPedido) {
        $key = $this->decodeBase64($key);
        $datos = $this->getResponseNotifSOAP($datos);
        $key = $this->encrypt_3DES($numPedido, $key);
        $res = $this->mac256($datos, $key);
        return $this->encodeBase64($res);
    }

    public function checkDsResponse($decodec) {
        $data = json_decode($decodec);
        $dsResponse = $data->Ds_Response;

        switch ($dsResponse) {
            case '8102':
                return 'Operación  que ha sido redirigida al emisor a autenticar EMV3DS V1.0.2 (para H2H)';
            case '8210':
                return 'Operación  que ha sido redirigida al emisor a autenticar EMV3DS V2.1.0 (para H2H)';
            case '8220':
                return 'Operación  que ha sido redirigida al emisor a autenticar EMV3DS V2.2.0 (para H2H)';
            case '9001':
                return 'Error Interno';
            case '9002':
                return 'Error genérico';
            case '9003':
                return 'Error genérico';
            case '9004':
                return 'Error genérico';
            case '9005':
                return 'Error genérico';
            case '9006':
                return 'Error genérico';
            case '9007':
                return 'El mensaje de petición no es correcto, debe revisar el formato';
            case '9008':
                return 'falta Ds_Merchant_MerchantCode';
            case '9009':
                return 'Error de formato en Ds_Merchant_MerchantCode';
            case '9010':
                return 'Error falta Ds_Merchant_Terminal';
            case '9011':
                return 'Error de formato en Ds_Merchant_Terminal';
            case '9012':
                return 'Error genérico';
            case '9013':
                return 'Error genérico';
            case '9014':
                return 'Error de formato en Ds_Merchant_Order';
            case '9015':
                return 'Error falta Ds_Merchant_Currency';
            case '9016':
                return 'Error de formato en Ds_Merchant_Currency';
            case '9018':
                return 'Falta Ds_Merchant_Amount';
            case '9019':
                return 'Error de formato en Ds_Merchant_Amount';
            case '9020':
                return 'Falta Ds_Merchant_MerchantSignature';
            case '9021':
                return 'La Ds_Merchant_MerchantSignature viene vacía';
            case '9022':
                return 'Error de formato en Ds_Merchant_TransactionType';
            case '9023':
                return 'Ds_Merchant_TransactionType desconocido';
            case '9024':
                return 'El Ds_Merchant_ConsumerLanguage tiene mas de 3 posiciones';
            case '9025':
                return 'Error de formato en Ds_Merchant_ConsumerLanguage';
            case '9026':
                return 'Problema con la configuración';
            case '9027':
                return 'Revisar la moneda que está enviando';
            case '9028':
                return 'Error Comercio / terminal está dado de baja';
            case '9029':
                return 'Que revise como está montando el mensaje';
            case '9030':
                return 'Nos llega un tipo de operación errónea';
            case '9031':
                return 'Nos está llegando un método de pago erróneo';
            case '9032':
                return 'Revisar como está montando el mensaje para la devolución.';
            case '9033':
                return 'El tipo de operación es erróneo';
            case '9034':
                return 'error interno';
            case '9035':
                return 'Error interno al recuperar datos de sesión';
            case 'SIS0':
                return ' al tomar los datos para Pago Móvil desde el XML';
            case '9037':
                return 'El número de teléfono no es válido';
            case '9038':
                return 'Error genérico';
            case '9039':
                return 'Error genérico';
            case '9040':
                return 'El comercio tiene un error en la configuración, tienen que hablar con su entidad.';
            case '9041':
                return 'Error en el cálculo de la firma';
            case '9042':
                return 'Error en el cálculo de la firma';
            case '9043':
                return 'Error genérico';
            case '9044':
                return 'Error genérico';
            case 'SIS0':
                return ' genérico';
            case '9046':
                return 'Problema con la configuración del bin de la tarjeta';
            case '9047':
                return 'Error genérico';
            case '9048':
                return 'Error genérico';
            case '9049':
                return 'Error genérico';
            case '9050':
                return 'Error genérico';
            case '9051':
                return 'Error número de pedido repetido';
            case '9052':
                return 'Error genérico';
            case '9053':
                return 'Error genérico';
            case '9054':
                return 'No existe operación sobre la que realizar la devolución';
            case '9055':
                return 'existe más de un pago con el mismo número de pedido';
            case '9056':
                return 'Revisar el estado de la autorización';
            case '9057':
                return 'Que revise el importe que quiere devolver( supera el permitido)';
            case '9058':
                return 'Que revise los datos con los que está validando la confirmación';
            case '9059':
                return 'Revisar que existe esa operación';
            case '9060':
                return 'Revisar que exista la confirmación';
            case '9061':
                return 'Revisar el estado de la preautorización';
            case '9062':
                return 'Que el comercio revise el importe a confirmar.';
            case '9063':
                return 'Que el comercio revise el númer de tarjeta que nos están enviando.';
            case '9064':
                return 'Número de posiciones de la tarjeta incorrecto';
            case '9065':
                return 'El número de tarjeta no es numérico';
            case '9066':
                return 'Error mes de caducidad';
            case '9067':
                return 'El mes de la caducidad no es numérico';
            case '9068':
                return 'El mes de la caducidad no es válido';
            case '9069':
                return 'Año de caducidad no valido';
            case '9070':
                return 'El Año de la caducidad no es numérico';
            case '9071':
                return 'Tarjeta caducada';
            case '9072':
                return 'Operación no anulable';
            case '9073':
                return 'Error en la anulación';
            case '9074':
                return 'Falta Ds_Merchant_Order ( Pedido )';
            case '9075':
                return 'El comercio tiene que revisar cómo está enviando el número de pedido';
            case '9077':
                return 'El comercio tiene que revisar el número de pedido';
            case '9078':
                return 'Por la configuración de los métodos de pago de su comercio no se permiten los pagos con esa tarjeta.';
            case '9079':
                return 'Error genérico';
            case '9080':
                return 'Error genérico';
            case '9081':
                return 'Se ha perdico los datos de la sesión';
            case '9082':
                return 'Error genérico';
            case '9083':
                return 'Error genérico';
            case '9084':
                return 'El valor de Ds_Merchant_Conciliation es nulo.';
            case '9085':
                return 'El valor de Ds_Merchant_Conciliation no es numérico.';
            case '9086':
                return 'El valor de Ds_Merchant_Conciliation no ocupa 6 posiciones.';
            case '9087':
                return 'El valor de Ds_Merchant_Session es nulo.';
            case '9088':
                return 'El comercio tiene que revisar el valor que envía en ese campo.';
            case '9089':
                return 'El valor de caducidad no ocupa 4 posiciones.';
            case '9090':
                return 'Error genérico. Consulte con Soporte.';
            case '9091':
                return 'Error genérico. Consulte con Soporte.';
            case '9092':
                return 'Se ha introducido una caducidad incorrecta.';
            case '9093':
                return 'Denegación emisor';
            case '9094':
                return 'Denegación emisor';
            case '9095':
                return 'Denegación emisor';
            case '9096':
                return 'El formato utilizado para los datos 3DSecure es incorrecto';
            case '9097':
                return 'Valor del campo Ds_Merchant_CComercio no válido';
            case '9098':
                return 'Valor del campo Ds_Merchant_CVentana no válido';
            case '9099':
                return 'Error al interpretar respuesta de autenticación';
            case '9103':
                return 'Error al montar la petición de Autenticación';
            case '9104':
                return 'Comercio con “titular seguro” y titular sin clave de compra segura';
            case '9112':
                return 'Que revise que está enviando en el campo Ds_Merchant_Transacction_Type.';
            case '9113':
                return 'Error interno';
            case '9114':
                return 'Se está realizando la llamada por GET, la tiene que realizar por POST';
            case '9115':
                return 'Que revise los datos de la operación que nos está enviando';
            case '9116':
                return 'La operación sobre la que se desea pagar una cuota no es una operación válida';
            case '9117':
                return 'La operación sobre la que se desea pagar una cuota no está autorizada';
            case '9118':
                return 'Se ha excedido el importe total de las cuotas';
            case '9119':
                return 'Valor del campo Ds_Merchant_DateFrecuency no válido ( Pagos recurrentes)';
            case '9120':
                return 'Valor del campo Ds_Merchant_ChargeExpiryDate no válido';
            case '9121':
                return 'Valor del campo Ds_Merchant_SumTotal no válido';
            case '9122':
                return 'Formato incorrecto del campo Ds_Merchant_DateFrecuency o Ds_Merchant_SumTotal';
            case '9123':
                return 'Se ha excedido la fecha tope para realiza la Transacción';
            case '9124':
                return 'No ha transcurrido la frecuencia mínima en un pago recurrente sucesivo';
            case '9125':
                return 'Error genérico';
            case '9126':
                return 'Operación Duplicada';
            case '9127':
                return 'Error Interno';
            case '9128':
                return 'Error interno';
            case '9129':
                return 'Error, se ha detectado un intento masivo de peticiones desde la ip';
            case '9130':
                return 'Error Interno';
            case '9131':
                return 'Error Interno';
            case '9132':
                return 'La fecha de Confirmación de Autorización no puede superar en mas de 7 dias a la de Preautorización.';
            case '9133':
                return 'La fecha de Confirmación de Autenticación no puede superar en mas de 45 días a la de Autenticacion Previa que el comercio revise la fecha de la Preautenticación';
            case '9134':
                return 'El valor del Ds_MerchantCiers enviado no es válido';
            case '9135':
                return 'Error generando un nuevo valor para el IDETRA';
            case '9136':
                return 'Error al montar el mensaje de notificación';
            case '9137':
                return 'Error al intentar validar la tarjeta como 3DSecure NACIONAL';
            case '9138':
                return 'Error debido a que existe una Regla del ficheros de reglas que evita que se produzca la Autorizacion';
            case '9139':
                return 'pago recurrente inicial está duplicado';
            case '9140':
                return 'Error Interno';
            case '9141':
                return 'Error formato no correcto para 3DSecure';
            case '9142':
                return 'Tiempo excecido para el pago';
            case '9151':
                return 'Error Interno';
            case '9169':
                return 'El valor del campo Ds_Merchant_MatchingData ( Datos de Case) no es valido , que lo revise';
            case '9170':
                return 'Que revise el adquirente que manda en el campo';
            case '9171':
                return 'Que revise el CSB que nos está enviando';
            case '9172':
                return 'El valor del campo PUCE Ds_Merchant_MerchantCode no es válido';
            case '9173':
                return 'Que el comercio revise el campo de la URL OK';
            case '9174':
                return 'Error Interno';
            case '9175':
                return 'Error Interno';
            case '9181':
                return 'Error Interno';
            case '9182':
                return 'Error Interno';
            case '9183':
                return 'Error interno';
            case '9184':
                return 'Error interno';
            case '9186':
                return 'Faltan datos para operación';
            case '9187':
                return 'Error formato( Interno )';
            case '9197':
                return 'Error al obtener los datos de cesta de la compra';
            case '9214':
                return 'Su comercion no permite devoluciones por el tipo de firma ( Completo)';
            case '9216':
                return 'El CVV2 tiene mas de 3 posiciones';
            case '9217':
                return 'Error de formato en el CVV2';
            case '9218':
                return 'El comercio no permite operaciones seguras por las entradas "operaciones" o "WebService"';
            case '9219':
                return 'Se tiene que dirigir a su entidad.';
            case '9220':
                return 'Se tiene que dirigir a su entidad.';
            case '9221':
                return 'El cliente no está introduciendo el CVV2';
            case '9222':
                return 'Existe una anulación asociada a la preautorización';
            case '9223':
                return 'La preautorización que se desea anular no está autorizada';
            case '9224':
                return 'Su comercio no permite anulaciones por no tener la firma ampliada';
            case '9225':
                return 'No existe operación sobre la que realizar la anulación';
            case '9226':
                return 'Error en en los datos de la anulación manual';
            case '9227':
                return 'Que el comercio revise el campo Ds_Merchant_TransactionDate';
            case '9228':
                return 'El tipo de tarjeta no puede realizar pago aplazado';
            case '9229':
                return 'Error con el codigo de aplazamiento';
            case '9230':
                return 'Su comercio no permite pago fraccionado( Consulte a su entidad)';
            case '9231':
                return 'No hay forma de pago aplicable ( Consulte con su entidad)';
            case '9232':
                return 'Forma de pago no disponible';
            case '9233':
                return 'Forma de pago desconocida';
            case '9234':
                return 'Nombre del titular de la cuenta no disponible';
            case '9235':
                return 'Campo Sis_Numero_Entidad no disponible';
            case '9236':
                return 'El campo Sis_Numero_Entidad no tiene la longitud requerida';
            case '9237':
                return 'El campo Sis_Numero_Entidad no es numérico';
            case '9238':
                return 'Campo Sis_Numero_Oficina no disponible';
            case '9239':
                return 'El campo Sis_Numero_Oficina no tiene la longitud requerida';
            case '9240':
                return 'El campo Sis_Numero_Oficina no es numérico';
            case '9241':
                return 'Campo Sis_Numero_DC no disponible';
            case '9242':
                return 'El campo Sis_Numero_DC no tiene la longitud requerida';
            case '9243':
                return 'El campo Sis_Numero_DC no es numérico';
            case '9244':
                return 'Campo Sis_Numero_Cuenta no disponible';
            case '9245':
                return 'El campo Sis_Numero_Cuenta no tiene la longitud requerida';
            case '9246':
                return 'El campo Sis_Numero_Cuenta no es numérico';
            case '9247':
                return 'Dígito de Control de Cuenta Cliente no válido';
            case '9248':
                return 'El comercio no permite pago por domiciliación';
            case '9249':
                return 'Error genérico';
            case '9250':
                return 'Error genérico';
            case '9251':
                return 'No permite transferencias( Consultar con entidad )';
            case '9252':
                return 'Por su configuración no puede enviar la tarjeta. ( Para modificarlo consualtar con la entidad)';
            case '9253':
                return 'No se ha tecleado correctamente la tarjeta.';
            case '9254':
                return 'Se tiene que dirigir a su entidad.';
            case '9255':
                return 'Se tiene que dirigir a su entidad.';
            case '9256':
                return 'El comercio no permite operativa de preautorizacion.';
            case '9257':
                return 'La tarjeta no permite operativa de preautorizacion';
            case '9258':
                return 'Tienen que revisar los datos de la validación';
            case '9259':
                return 'No existe la operacion original para notificar o consultar';
            case '9260':
                return 'Entrada incorrecta al SIS';
            case '9261':
                return 'Se tiene que dirigir a su entidad.';
            case '9262':
                return 'Moneda no permitida para operación de transferencia o domiciliacion';
            case '9263':
                return 'Error calculando datos para procesar operación';
            case '9264':
                return 'Error procesando datos de respuesta recibidos';
            case '9265':
                return 'Error de firma en los datos recibidos';
            case '9266':
                return 'No se pueden recuperar los datos de la operación recibida';
            case '9267':
                return 'La operación no se puede procesar por no existir Codigo Cuenta Cliente';
            case '9268':
                return '	La devolución no se puede procesar por WebService';
            case '9269':
                return 'No se pueden realizar devoluciones de operaciones de domiciliacion no descargadas';
            case '9270':
                return 'El comercio no puede realizar preautorizaciones en diferido';
            case '9274':
                return 'Tipo de operación desconocida o no permitida por esta entrada al SIS';
            case '9275':
                return 'Premio sin IdPremio';
            case '9276':
                return 'nidades del Premio no numericas.';
            case '9277':
                return 'Error genérico. Consulte con Redsys';
            case '9278':
                return 'Error en el proceso de consulta de premios';
            case '9279':
                return 'El comercio no tiene activada la operativa de fidelización';
            case '9280':
                return 'Se tiene que dirigir a su entidad.';
            case '9281':
                return 'Se tiene que dirigir a su entidad.';
            case '9282':
                return 'Se tiene que dirigir a su entidad.';
            case '9283':
                return 'Se tiene que dirigir a su entidad.';
            case '9284':
                return 'No existe operacion sobre la que realizar el Pago Adicional';
            case '9285':
                return 'Tiene más de una operacion sobre la que realizar el Pago Adicional';
            case '9286':
                return 'La operación sobre la que se quiere hacer la operación adicional no esta Aceptada';
            case '9287':
                return 'la Operacion ha sobrepasado el importe para el Pago Adicional.';
            case '9288':
                return 'No se puede realizar otro pago Adicional. se ha superado el numero de pagos';
            case '9289':
                return 'El importe del pago Adicional supera el maximo días permitido.';
            case '9290':
                return 'Se tiene que dirigir a su entidad.';
            case '9291':
                return 'Se tiene que dirigir a su entidad.';
            case '9292':
                return 'Se tiene que dirigir a su entidad.';
            case '9293':
                return 'Se tiene que dirigir a su entidad.';
            case '9294':
                return 'La tarjeta no es privada.';
            case '9295':
                return 'duplicidad de operación. Se puede intentar de nuevo ( 1 minuto )';
            case '9296':
                return 'No se encuentra la operación Tarjeta en Archivo inicial';
            case '9297':
                return 'Número de operaciones sucesivas de Tarjeta en Archivo superado';
            case '9298':
                return 'No puede realizar este tipo de operativa. (Contacte con su entidad)';
            case '9299':
                return 'Error en pago con PayPal';
            case '9300':
                return 'Error en pago con PayPal';
            case '9301':
                return 'Error en pago con PayPal';
            case '9302':
                return 'Moneda no válida para pago con PayPal';
            case '9304':
                return 'No se permite pago fraccionado si la tarjeta no es de FINCONSUM';
            case '9305':
                return 'Revisar la moneda de la operación';
            case '9306':
                return 'Valor de Ds_Merchant_PrepaidCard no válido';
            case '9307':
                return 'Que consulte con su entidad. Operativa de tarjeta regalo no permitida';
            case '9308':
                return 'Tiempo límite para recarga de tarjeta regalo superado';
            case '9309':
                return 'Faltan datos adicionales para realizar la recarga de tarjeta prepago';
            case '9310':
                return 'Valor de Ds_Merchant_Prepaid_Expiry no válido';
            case '9311':
                return 'Error genérico';
            case '9319':
                return 'El comercio no pertenece al grupo especificado en Ds_Merchant_Group';
            case '9320':
                return 'Error generando la referencia';
            case '9321':
                return 'El identificador no está asociado al comercio';
            case '9322':
                return 'Que revise el formato del grupo';
            case '9323':
                return 'Para el tipo de operación F( pago en dos fases) es necesario enviar uno de estos campos. Ds_Merchant_Customer_Mobile o Ds_Merchant_Customer_Mail';
            case '9324':
                return 'Imposible enviar el link al cliente( Que revise la dirección mail)';
            case '9326':
                return 'Se han enviado datos de tarjeta en fase primera de un pago con dos fases';
            case '9327':
                return 'No se ha enviado ni móvil ni email en fase primera de un pago con dos fases';
            case '9328':
                return 'Token de pago en dos fases inválido';
            case '9329':
                return 'No se puede recuperar el Token de pago en dos fases.';
            case '9330':
                return 'Fechas incorrectas de pago dos fases';
            case '9331':
                return 'La operación no tiene un estado válido o no existe.';
            case '9332':
                return 'El importe de la operación original y de la devolución debe ser idéntico';
            case '9333':
                return 'Error en una petición a MasterPass Wallet';
            case '9334':
                return 'Bloqueo por control de Seguridad';
            case '9335':
                return 'El valor del campo Ds_Merchant_Recharge_Commission no es válido';
            case '9336':
                return 'Error genérico. Consulte con Redsys';
            case '9337':
                return 'Error genérico. Consulte con Redsys';
            case '9338':
                return 'No se encuentra la operación iUPAY';
            case '9339':
                return 'El comercio no dispone de pago iUPAY';
            case '9340':
                return 'Respuesta recibida desde iUPAY no válida';
            case '9341':
                return 'Error genérico. Consulte con Redsys';
            case '9342':
                return 'El comercio no permite realizar operaciones de pago de tributos';
            case '9343':
                return 'Falta o es incorrecto el parámetro Ds_Merchant_Tax_Reference';
            case '9344':
                return 'No se han aceptado las condiciones de las cuotas';
            case '9345':
                return 'Se ha elegido un número de plazos incorrecto';
            case '9346':
                return 'Error en el formato del campo DS_MERCHANT_PAY_TYPE';
            case '9347':
                return 'El comercio no está configurado para realizar la consulta de BIN.';
            case '9348':
                return 'El BIN indicado en la consulta no se reconoce';
            case '9349':
                return 'Los datos de importe y DCC enviados no coinciden con los registrados en SIS';
            case '9350':
                return 'No hay datos DCC registrados en SIS para este número de pedido';
            case '9351':
                return 'Autenticación prepago incorrecta';
            case '9352':
                return 'El tipo de firma del comercio no permite esta operativa';
            case '9353':
                return 'El comercio no tiene definida una clave 3DES válida';
            case '9354':
                return 'Error descifrando petición';
            case '9355':
                return 'El comercio-terminal enviado en los datos cifrados no coincide con el enviado en la petición';
            case '9356':
                return 'Existen datos de entrada para control de fraude y el comercio no tiene activo control de fraude';
            case '9357':
                return 'El comercio tiene activo control de fraude y no existe campo ds_merchant_merchantscf';
            case '9358':
                return 'La entidad no dispone de pago iUPAY';
            case '9370':
                return 'Error en formato Scf_Merchant_Nif. Longitud máxima 16';
            case '9371':
                return 'Error en formato Scf_Merchant_Name. Longitud máxima 30';
            case '9372':
                return 'Error en formato Scf_Merchant_First_Name. Longitud máxima 30';
            case '9373':
                return 'Error en formato Scf_Merchant_Last_Name. Longitud máxima 30';
            case '9374':
                return 'Error en formato Scf_Merchant_User. Longitud máxima 45';
            case '9375':
                return 'Error en formato Scf_Affinity_Card. Valores posibles S o N. Longitud máxima 1';
            case '9376':
                return 'Error en formato Scf_Payment_Financed. Valores posibles S o N. Longitud máxima 1';
            case '9377':
                return 'Error en formato Scf_Ticket_Departure_Point. Longitud máxima 30';
            case '9378':
                return 'Error en formato Scf_Ticket_Destination. Longitud máxima 30';
            case '9379':
                return 'Error en formato Scf_Ticket_Departure_Date. Debe tener formato yyyyMMddHHmmss.';
            case '9380':
                return 'rror en formato Scf_Ticket_Num_Passengers. Longitud máxima 1.';
            case '9381':
                return 'rror en formato Scf_Passenger_Dni. Longitud máxima 16.';
            case '9382':
                return 'rror en formato Scf_Passenger_Name. Longitud máxima 30.';
            case '9283':
                return 'Se tiene que dirigir a su entidad.';
            case '9335':
                return 'El valor del campo Ds_Merchant_Recharge_Commission no es válido';
            case '9336':
                return 'Error genérico';
            case '9337':
                return 'Error interno (iUPAY)';
            case '9338':
                return 'No se encuentra la operación iUPAY';
            case '9339':
                return 'El comercio no dispone de pago iUPAY ( Consulte a su entidad)';
            case '9340':
                return 'Respuesta recibida desde iUPAY no válida';
            case '9341':
                return 'Error interno (iUPAY)';
            case '9342':
                return 'El comercio no permite realizar operaciones de pago de tributos';
            case '9343':
                return 'Falta o es incorrecto el parámetro Ds_Merchant_Tax_Reference';
            case '9344':
                return 'El usuario ha elegido aplazar el pago, pero no ha aceptado las condiciones de las cuotas';
            case '9345':
                return 'Revisar el número de plazos que está enviando.';
            case '9346':
                return 'Revisar formato en parámetro DS_MERCHANT_PAY_TYPE';
            case '9347':
                return 'El comercio no está configurado para realizar la consulta de BIN.';
            case '9348':
                return 'El BIN indicado en la consulta no se reconoce';
            case '9349':
                return 'Los datos de importe y DCC enviados no coinciden con los registrados en SIS';
            case '9350':
                return 'No hay datos DCC registrados en SIS para este número de pedido';
            case '9351':
                return 'Autenticación prepago incorrecta';
            case '9352':
                return 'El tipo de firma no permite esta operativa';
            case '9353':
                return 'Clave no válida';
            case '9354':
                return 'Error descifrando petición al SIS';
            case '9355':
                return 'El comercio-terminal enviado en los datos cifrados no coincide con el enviado en la petición';
            case '9356':
                return 'El comercio no tiene activo control de fraude ( Consulte con su entidad';
            case '9357':
                return 'El comercio tiene activo control de fraude y no existe campo ds_merchant_merchantscf';
            case '9358':
                return 'No dispone de pago iUPAY';
            case '9359':
                return 'El comercio solamente permite pago de tributos y no se está informando el campo Ds_Merchant_TaxReference';
            case '9370':
                return 'Error en formato Scf_Merchant_Nif. Longitud máxima 16';
            case '9371':
                return 'Error en formato Scf_Merchant_Name. Longitud máxima 30';
            case '9372':
                return 'Error en formato Scf_Merchant_First_Name. Longitud máxima 30';
            case '9373':
                return 'Error en formato Scf_Merchant_Last_Name. Longitud máxima 30';
            case '9374':
                return 'Error en formato Scf_Merchant_User. Longitud máxima 45';
            case '9375':
                return 'Error en formato Scf_Affinity_Card. Valores posibles S o N. Longitud máxima 1';
            case '9376':
                return 'Error en formato Scf_Payment_Financed. Valores posibles S o N. Longitud máxima 1';
            case '9377':
                return 'Error en formato Scf_Ticket_Departure_Point. Longitud máxima 30';
            case '9378':
                return 'Error en formato Scf_Ticket_Destination. Longitud máxima 30';
            case '9379':
                return 'Error en formato Scf_Ticket_Departure_Date. Debe tener formato yyyyMMddHHmmss.';
            case '9380':
                return 'Error en formato Scf_Ticket_Num_Passengers. Longitud máxima 1.';
            case '9381':
                return 'Error en formato Scf_Passenger_Dni. Longitud máxima 16.';
            case '9382':
                return 'Error en formato Scf_Passenger_Name. Longitud máxima 30.';
            case '9383':
                return 'Error en formato Scf_Passenger_First_Name. Longitud máxima 30.';
            case '9384':
                return 'Error en formato Scf_Passenger_Last_Name. Longitud máxima 30.';
            case '9385':
                return 'Error en formato Scf_Passenger_Check_Luggage. Valores posibles S o N. Longitud máxima 1.';
            case '9386':
                return 'Error en formato Scf_Passenger_Special_luggage. Valores posibles S o N. Longitud máxima 1.';
            case '9387':
                return 'Error en formato Scf_Passenger_Insurance_Trip. Valores posibles S o N. Longitud máxima 1.';
            case '9388':
                return 'Error en formato Scf_Passenger_Type_Trip. Valores posibles N o I. Longitud máxima 1.';
            case '9389':
                return 'Error en formato Scf_Passenger_Pet. Valores posibles S o N. Longitud máxima 1.';
            case '9390':
                return 'Error en formato Scf_Order_Channel. Valores posibles M(móvil), P(PC) o T(Tablet)';
            case '9391':
                return 'Error en formato Scf_Order_Total_Products. Debe tener formato numérico y longitud máxima de 3.';
            case '9392':
                return 'Error en formato Scf_Order_Different_Products. Debe tener formato numérico y longitud máxima de 3.';
            case '9393':
                return 'Error en formato Scf_Order_Amount. Debe tener formato numérico y longitud máxima de 19.';
            case '9394':
                return 'Error en formato Scf_Order_Max_Amount. Debe tener formato numérico y longitud máxima de 19.';
            case '9395':
                return 'Error en formato Scf_Order_Coupon. Valores posibles S o N';
            case '9396':
                return 'Error en formato Scf_Order_Show_Type. Debe longitud máxima de 30.';
            case '9397':
                return 'Error en formato Scf_Wallet_Identifier';
            case '9398':
                return 'Error en formato Scf_Wallet_Client_Identifier';
            case '9399':
                return 'Error en formato Scf_Merchant_Ip_Address';
            case '9400':
                return 'Error en formato Scf_Merchant_Proxy';
            case '9401':
                return 'Error en formato Ds_Merchant_Mail_Phone_Number. Debe ser numérico y de longitud máxima 19';
            case '9402':
                return 'Error en llamada a SafetyPay para solicitar token url';
            case '9403':
                return 'Error en proceso de solicitud de token url a SafetyPay';
            case '9404':
                return 'Error en una petición a SafetyPay';
            case '9405':
                return 'Solicitud de token url denegada SAFETYPAY';
            case '9406':
                return 'Se tiene que poner en contacto con su entidad para que revisen la configuración del sector de actividad de su comercio';
            case '9407':
                return 'El importe de la operación supera el máximo permitido para realizar un pago de premio de apuesta(Gambling)';
            case '9408':
                return 'La tarjeta debe de haber operado durante el último año para poder realizar un pago de premio de apuesta (Gambling)';
            case '9409':
                return 'La tarjeta debe ser una Visa o MasterCard nacional para realizar un pago de premio de apuesta (Gambling)';
            case '9410':
                return 'Denegada por el emisor';
            case '9411':
                return 'Error en la configuración del comercio (Remitir a su entidad)';
            case '9412':
                return 'La firma no es correcta';
            case '9413':
                return 'Denegada, consulte con su entidad.';
            case '9414':
                return 'El plan de ventas no es correcto';
            case '9415':
                return 'El tipo de producto no es correcto';
            case '9416':
                return 'Importe no permitido en devolucion';
            case '9417':
                return 'Fecha de devolucion no permitida';
            case '9418':
                return 'No existe plan de ventas vigente';
            case '9419':
                return 'Tipo de cuenta no permitida';
            case '9420':
                return 'El comercio no dispone de formas de pago para esta operación';
            case '9421':
                return 'Tarjeta no permitida. No es producto Agro';
            case '9422':
                return 'Faltan datos para operacion Agro';
            case '9423':
                return 'CNPJ del comecio incorrecto';
            case '9424':
                return 'No se ha encontrado el establecimiento';
            case '9425':
                return 'No se ha encontrado la tarjeta';
            case '9426':
                return 'Enrutamiento no valido para el comercio';
            case '9427':
                return 'La conexion con CECA no ha sido posible';
            case '9428':
                return 'Operacion debito no segura';
            case '9429':
                return 'Error en la versión enviada por el comercio (Ds_SignatureVersion)';
            case '9430':
                return 'Error al decodificar el parámetro Ds_MerchantParameters';
            case '9431':
                return 'Error del objeto JSON que se envía codificado en el parámetro Ds_MerchantParameters';
            case '9432':
                return 'Error FUC del comercio erróneo';
            case '9433':
                return 'Error Terminal del comercio erróneo';
            case '9434':
                return 'Error ausencia de número de pedido en la op. del comercio';
            case '9435':
                return 'Error en el cálculo de la firma';
            case '9436':
                return 'Error en la construcción del elemento padre';
            case '9437':
                return 'Error en la construcción del elemento';
            case '9438':
                return 'Error en la construcción del elemento';
            case '9439':
                return 'Error en la construcción del elemento';
            case '9440':
                return 'Error genérico';
            case '9441':
                return 'Error no tenemos bancos para Mybank';
            case '9442':
                return 'Error genérico';
            case '9443':
                return 'No se permite pago con esta tarjeta';
            case '9444':
                return 'Se está intentando acceder usando firmas antiguas y el comercio está configurado como HMAC SHA256';
            case '9445':
                return 'Error genérico';
            case '9446':
                return 'Es obligatorio indicar la forma de pago';
            case '9447':
                return 'Error, se está utilizando una referencia que se generó con un adquirente distinto al adquirente que la utiliza.';
            case '9448':
                return 'El comercio no tiene el método de pago "Pago DINERS"';
            case '9449':
                return 'Tipo de pago de la operación no permitido para este tipo de tarjeta';
            case '9450':
                return 'Tipo de pago de la operación no permitido para este tipo de tarjeta';
            case '9451':
                return 'Tipo de pago de la operación no permitido para este tipo de tarjeta';
            case '9453':
                return 'No se permiten pagos con ese tipo de tarjeta';
            case '9454':
                return 'No se permiten pagos con ese tipo de tarjeta';
            case '9455':
                return 'No se permiten pagos con ese tipo de tarjeta';
            case '9456':
                return 'No tiene método de pago configurado (Consulte a su entidad)';
            case '9457':
                return 'Error, se aplica el método de pago "MasterCard SecureCode" con Respuesta [VEReq, VERes] = N con tarjeta MasterCard Comercial y el comercio no tiene el método de pago "MasterCard Comercial"';
            case '9458':
                return 'Error, se aplica el método de pago "MasterCard SecureCode" con Respuesta [VEReq, VERes] = U con tarjeta MasterCard Comercial y el comercio no tiene el método de pago "MasterCard Comercial"';
            case '9459':
                return 'No tiene método de pago configurado (Consulte a su entidad)';
            case '9460':
                return 'No tiene método de pago configurado (Consulte a su entidad)';
            case '9461':
                return 'No tiene método de pago configurado (Consulte a su entidad)';
            case '9462':
                return 'Metodo de pago no disponible para conexión HOST to HOST';
            case '9463':
                return 'Metodo de pago no permitido';
            case '9464':
                return 'El comercio no tiene el método de pago "MasterCard Comercial"';
            case '9465':
                return 'No tiene método de pago configurado (Consulte a su entidad)';
            case '9466':
                return 'La referencia que se está utilizando no existe.';
            case '9467':
                return 'La referencia que se está utilizando está dada de baja';
            case '9468':
                return 'Se está utilizando una referencia que se generó con un adquirente distinto al adquirente que la utiliza.';
            case '9469':
                return 'Error, no se ha superado el proceso de fraude MR';
            case '9470':
                return 'Error la solicitud del primer factor ha fallado.';
            case '9471':
                return 'Error en la URL de redirección de solicitud del primer factor.';
            case '9472':
                return 'Error al montar la petición de Autenticación de PPII.';
            case '9473':
                return 'Error la respuesta de la petición de Autenticación de PPII es nula.';
            case '9474':
                return 'Error el statusCode de la respuesta de la petición de Autenticación de PPII es nulo';
            case '9475':
                return 'Error el idOperación de la respuesta de la petición de Autenticación de PPII es nulo';
            case '9476':
                return 'Error tratando la respuesta de la Autenticación de PPII';
            case '9477':
                return 'Error se ha superado el tiempo definido entre el paso 1 y 2 de PPI';
            case '9478':
                return 'Error tratando la respuesta de la Autorización de PPII';
            case '9479':
                return 'Error la respuesta de la petición de Autorización de PPII es nula';
            case '9480':
                return 'Error el statusCode de la respuesta de la petición de Autorización de PPII es nulo.';
            case '9481':
                return 'Error, el comercio no es Payment Facilitator';
            case '9482':
                return 'Error el idOperación de la respuesta de una Autorización OK es nulo o no coincide con el idOp. de la Auth.';
            case '9483':
                return 'Error la respuesta de la petición de devolución de PPII es nula.';
            case '9484':
                return 'Error el statusCode o el idPetición de la respuesta de la petición de Devolución de PPII es nulo.';
            case '9485':
                return 'Error producido por la denegación de la devolución.';
            case '9486':
                return 'Error la respuesta de la petición de consulta de PPII es nula.';
            case '9487':
                return 'El comercio terminal no tiene habilitado el método de pago Paygold.';
            case '9488':
                return 'El comercio no tiene el método de pago "Pago MOTO/Manual" y la operación viene marcada como pago MOTO.';
            case '9489':
                return 'Error de datos. Operacion MPI Externo no permitida';
            case '9490':
                return 'Error de datos. Se reciben parametros MPI Redsys en operacion MPI Externo';
            case '9491':
                return 'Error de datos. SecLevel no permitido en operacion MPI Externo';
            case '9492':
                return 'Error de datos. Se reciben parametros MPI Externo en operacion MPI Redsys';
            case '9493':
                return 'Error de datos. Se reciben parametros de MPI en operacion no segura';
            case '9494':
                return 'FIRMA OBSOLETA';
            case '9495':
                return 'Configuración incorrecta ApplePay o AndroidPay';
            case '9496':
                return 'No tiene dado de alta el método de pago AndroidPay';
            case '9497':
                return 'No tiene dado de alta el método de pago ApplePay';
            case '9498':
                return 'moneda / importe de la operación de ApplePay no coinciden';
            case '9499':
                return 'Error obteniendo claves del comercio en Android/Apple Pay';
            case '9500':
                return 'Error en el DCC Dinámico, se ha modificado la tarjeta.';
            case '9501':
                return 'Error en La validación de datos enviados para genera el Id operación';
            case '9502':
                return 'Error al validar Id Oper';
            case '9503':
                return 'Error al validar el pedido';
            case '9504':
                return 'Error al validar tipo de transacción';
            case '9505':
                return 'Error al validar moneda';
            case '9506':
                return 'Error al validar el importe';
            case '9507':
                return 'Id Oper no tiene vigencia';
            case '9508':
                return 'Error al validar Id Oper';
            case '9510':
                return 'No se permite el envío de datos de tarjeta si se envía ID de operación';
            case '9511':
                return 'Error en la respuesta de consulta de BINES';
            case '9515':
                return 'El comercio tiene activado pago Amex en Perfil.';
            case '9516':
                return 'Error al montar el mensaje de China Union Pay';
            case '9517':
                return 'Error al establecer la clave para China Union Pay';
            case '9518':
                return 'Error al grabar los datos para pago China Union Pay';
            case '9519':
                return 'Mensaje de autenticación erróneo';
            case '9520':
                return 'El mensaje SecurePlus de sesión está vacío';
            case '9521':
                return 'El xml de respuesta viene vacío';
            case '9522':
                return 'No se han recibido parametros en datosentrada';
            case '9523':
                return 'La firma calculada no coincide con la recibida en la respuesta';
            case '9524':
                return 'el resultado de la autenticación 3DSecure MasterCard es PARes="A" o VERes="N" y no recibimos CAVV del emisor';
            case '9525':
                return 'No se puede utilizar la tarjeta privada en este comercio';
            case '9526':
                return 'La tarjeta no es china';
            case '9527':
                return 'Falta el parametro obligatorio DS_MERCHANT_BUYERID';
            case '9528':
                return 'Formato erróneo del parametro DS_MERCHANT_BUYERID en operación Sodexo Brasil';
            case '9529':
                return 'No se permite operación recurrente en pagos con tarjeta Voucher';
            case '9530':
                return 'La fecha de Anulación no puede superar en mas de 7 dias a la de Preautorización.';
            case '9531':
                return 'La fecha de Anulación no puede superar en mas de 72 horas a la de Preautorización diferida';
            case '9532':
                return 'La moneda de la petición no coincide con la devuelta';
            case '9533':
                return 'El importe de la petición no coincide con el devuelto';
            case '9534':
                return 'No se recibe recaudación emisora o referencia del recibo';
            case '9535':
                return 'Pago de tributo fuera de plazo';
            case '9536':
                return 'Tributo ya pagado';
            case '9537':
                return 'Pago de tributo denegado';
            case '9538':
                return 'Rechazo en el pago de tributo';
            case '9539':
                return 'Error en el envío de SMS';
            case '9540':
                return 'El móvil enviado es demasiado largo (más de 12 posiciones)';
            case '9541':
                return 'La referencia enviada es demasiada larga (más de 40 posiciones)';
            case '9542':
                return 'Error genérico. Consulte con Redsys';
            case '9543':
                return 'Error, la tarjeta de la operación es DINERS y el comercio no tiene el método de pago "Pago DINERS" o "Pago Discover No Seguro"';
            case '9544':
                return 'Error, la tarjeta de la operación es DINERS y el comercio no tiene el método de pago "Pago Discover No Seguro"';
            case '9545':
                return 'Error DISCOVER';
            case '9546':
                return 'Error DISCOVER';
            case '9547':
                return 'Error DISCOVER';
            case '9548':
                return 'Error DISCOVER';
            case '9549':
                return 'Error DISCOVER';
            case '9550':
                return 'ERROR en el gestor de envío de los SMS. Consulte con Redsys';
            case '9551':
                return 'ERROR en el proceso de autenticación.';
            case '9552':
                return 'ERROR el resultado de la autenticacion PARes = U';
            case '9553':
                return 'ERROR se ha intentado hacer un pago con el método de pago UPI y la tarjeta no es china';
            case '9554':
                return 'ERROR el resultado de la autenticacion para UPI es PARes = U y el comercio no tiene métodos de pago no seguros UPI EXPRESSPAY';
            case '9555':
                return 'ERROR la IP de conexión del módulo de administración no esta entre las permitidas.';
            case '9556':
                return 'Se envía pago Tradicional y el comercio no tiene pago Tradicional mundial ni Tradicional UE.';
            case '9557':
                return 'Se envía pago Tarjeta en Archivo y el comercio no tiene pago Tradicional mundial ni Tradicional UE.';
            case '9558':
                return 'ERROR, el formato de la fecha dsMerchantP2FExpiryDate es incorrecto';
            case '9559':
                return 'ERROR el id Operacion de la respuesta en la autenticación PPII es nulo o no se ha obtenido de la autenticación final';
            case '9560':
                return 'ERROR al enviar la notificacion de autenticacion al comercio';
            case '9561':
                return 'ERROR el idOperación de la respuesta de una confirmacion separada OK es nulo o no coincide con el idOp. de la Confirmacion.';
            case '9562':
                return 'ERROR la respuesta de la petición de confirmacion separada de PPII es nula.';
            case '9563':
                return 'ERROR tratando la respuesta de la confirmacion separada de PPII.';
            case '9564':
                return 'ERROR chequeando los importes de DCC antes del envío de la operación a Stratus.';
            case '9565':
                return 'Formato del importe del campo Ds_Merchant_Amount excede del límite permitido.';
            case '9566':
                return 'Error de acceso al nuevo Servidor Criptográfico.';
            case '9567':
                return 'ERROR se ha intentado hacer un pago con una tarjeta china UPI y el comercio no tiene método de pago UPI';
            case '9568':
                return 'Operacion de consulta de tarjeta rechazada, tipo de transacción erróneo';
            case '9569':
                return 'Operacion de consulta de tarjeta rechazada, no se ha informado la tarjeta';
            case '9570':
                return 'Operacion de consulta de tarjeta rechazada, se ha enviado tarjeta y referencia';
            case '9571':
                return 'Operacion de autenticacion rechazada, protocolVersion no indicado';
            case '9572':
                return 'Operacion de autenticacion rechazada, protocolVersion no reconocido';
            case '9573':
                return 'Operacion de autenticacion rechazada, browserAcceptHeader no indicado';
            case '9574':
                return 'Operacion de autenticacion rechazada, browserUserAgent no indicado';
            case '9575':
                return 'Operacion de autenticacion rechazada, browserJavaEnabled no indicado';
            case '9576':
                return 'Operacion de autenticacion rechazada, browserLanguage no indicado';
            case '9577':
                return 'Operacion de autenticacion rechazada, browserColorDepth no indicado';
            case '9578':
                return 'Operacion de autenticacion rechazada, browserScreenHeight no indicado';
            case '9579':
                return 'Operacion de autenticacion rechazada, browserScreenWidth no indicado';
            case '9580':
                return 'Operacion de autenticacion rechazada, browserTZ no indicado';
            case '9581':
                return 'Operacion de autenticacion rechazada, datos DS_MERCHANT_EMV3DS no está indicado o es demasiado grande y no se puede convertir en JSON';
            case '9582':
                return 'Operacion de autenticacion rechazada, threeDSServerTransID no indicado';
            case '9583':
                return 'Operacion de autenticacion rechazada, threeDSCompInd no indicado';
            case '9584':
                return 'Operacion de autenticacion rechazada, notificationURL no indicado';
            case '9585':
                return 'Operacion de autenticacion EMV3DS rechazada, no existen datos en la BBDD';
            case '9586':
                return 'Operacion de autenticacion rechazada, PARes no indicado';
            case '9587':
                return 'Operacion de autenticacion rechazada, MD no indicado';
            case '9588':
                return 'Operacion de autenticacion rechazada, la versión no coincide entre los mensajes AuthenticationData y ChallengeResponse';
            case '9589':
                return 'Operacion de autenticacion rechazada, respuesta sin CRes';
            case '9590':
                return 'Operacion de autenticacion rechazada, error al desmontar la respuesta CRes';
            case '9591':
                return 'Operacion de autenticacion rechazada, error la respuesta CRes viene sin threeDSServerTransID';
            case '9592':
                return 'Operacion de autenticacion rechazada, error el transStatus del CRes no coincide con el transStatus de la consulta final de la operación';
            case '9593':
                return 'Operacion de autenticacion rechazada, error el transStatus de la consulta final de la operación no está definido';
            case '9594':
                return 'Operacion de autenticacion rechazada, CRes no indicado';
            case '9595':
                return 'El comercio indicado no tiene métodos de pago seguros permitidos en 3DSecure V2';
            case '9596':
                return 'Operacion de consulta de tarjeta rechazada,moneda errónea';
            case '9597':
                return 'Operacion de consulta de tarjeta rechazada,importe erróneo';
            case '9598':
                return 'Autenticación 3DSecure v2 errónea, y no se permite hacer fallback a 3DSecure v1';
            case '9599':
                return 'Error en el proceso de autenticación 3DSecure v2';
            case '9600':
                return 'Error en el proceso de autenticación 3DSecure v2 - Respuesta Areq N';
            case '9601':
                return 'Error en el proceso de autenticación 3DSecure v2 - Respuesta Areq R';
            case '9602':
                return 'Error en el proceso de autenticación 3DSecure v2 - Respuesta Areq U y el comercio no tiene método de pago U';
            case '9603':
                return 'Error en el parámetro DS_MERCHANT_DCC de DCC enviado en operacion H2H (REST y SOAP)';
            case '9604':
                return 'Error en los datos de DCC enviados en el parámetro DS_MERCHANT_DCC en operacion H2H (REST y SOAP)';
            case '9605':
                return 'Error en el parámetro DS_MERCHANT_MPIEXTERNAL enviado en operacion H2H (REST y SOAP)';
            case '9606':
                return 'Error en los datos de MPI enviados en el parámetro DS_MERCHANT_MPIEXTERNAL en operacion H2H (REST y SOAP)';
            case '9607':
                return 'Error del parámetro TXID de MPI enviado en el parámetro DS_MERCHANT_MPIEXTERNAL en operacion H2H (REST y SOAP) es erróneo';
            case '9608':
                return 'Error del parámetro CAVV de MPI enviado en el parámetro DS_MERCHANT_MPIEXTERNAL en operacion H2H (REST y SOAP) es erróneo';
            case '9609':
                return 'Error del parámetro ECI de MPI enviado en el parámetro DS_MERCHANT_MPIEXTERNAL en operacion H2H (REST y SOAP) es erróneo';
            case '9610':
                return 'Error del parámetro threeDSServerTransID de MPI enviado en el parámetro DS_MERCHANT_MPIEXTERNAL en operacion H2H (REST y SOAP) es erróneo';
            case '9611':
                return 'Error del parámetro dsTransID de MPI enviado en el parámetro DS_MERCHANT_MPIEXTERNAL en operacion H2H (REST y SOAP) es erróneo';
            case '9612':
                return 'Error del parámetro authenticacionValue de MPI enviado en el parámetro DS_MERCHANT_MPIEXTERNAL en operacion H2H (REST y SOAP) es erróneo';
            case '9613':
                return 'Error del parámetro protocolVersion de MPI enviado en el parámetro DS_MERCHANT_MPIEXTERNAL en operacion H2H (REST y SOAP) es erróneo';
            case '9614':
                return 'Error del parámetro Eci de MPI enviado en el parámetro DS_MERCHANT_MPIEXTERNAL en operacion H2H (REST y SOAP) es erróneo';
            case '9615':
                return 'Error en MPI Externo, marca de tarjeta no permitida en SIS para MPI Externo';
            case '9616':
                return 'Error del parámetro DS_MERCHANT_EXCEP_SCA tiene un valor erróneo';
            case '9617':
                return 'Error del parámetro DS_MERCHANT_EXCEP_SCA es de tipo MIT y no vienen datos de COF o de pago por referencia';
            case '9618':
                return 'Error la exención enviada no está permitida y el comercio no está preparado para autenticar';
            case '9619':
                return 'Se recibe orderReferenceId de Amazon y no está el método de pago configurado';
            case '9620':
                return 'Error la operación de DCC tiene asociado un markUp más alto del permitido, se borran los datos de DCC';
            case '9621':
                return 'El amazonOrderReferenceId no es válido';
            case '9622':
                return 'Error la operación original se hizo sin marca de Nuevo modelo DCC y el comercio está configurado como Nuevo Modelo DCC';
            case '9623':
                return 'Error la operación original se hizo con marca de Nuevo modelo DCC y el comercio no está configurado como Nuevo Modelo DCC';
            case '9624':
                return 'Error la operación original se hizo con marca de Nuevo modelo DCC pero su valor difiere del modelo configurado en el comercio';
            case '9625':
                return 'Error en la anulación del pago, porque ya existe una devolución asociada a ese pago';
            case '9626':
                return 'Error en la devolución del pago, ya existe una anulación de la operación que se desea devolver';
            case '9627':
                return 'El número de referencia o solicitud enviada por CRTM no válida.';
            case '9628':
                return 'Error la operación de viene con datos de 3DSecure y viene por la entrada SERMEPA';
            case '9629':
                return 'Error no existe la operación de confirmación separada sobre la que realizar la anulación';
            case '9630':
                return 'Error en la anulación de confirmación separada, ya existe una devolución asociada a la confirmación separada';
            case '9631':
                return 'Error en la anulación de confirmación separada, ya existe una anulación asociada a la confirmación separada';
            case '9632':
                return 'Error la confirmacion separada sobre la que se desea anular no está autorizada';
            case '9633':
                return 'La fecha de Anulación no puede superar en los días configurados a la confirmacion separada.';
            case '9634':
                return 'Error no existe la operación de pago sobre la que realizar la anulación';
            case '9635':
                return 'Error en la anulación del pago, ya existe una anulación asociada al pago';
            case '9636':
                return 'Error el pago que se desea anular no está autorizado';
            case '9637':
                return 'La fecha de Anulación no puede superar en los días configurados al pago.';
            case '9638':
                return 'Error existe más de una devolución que se quiere anular y no se ha especificado cual.';
            case '9639':
                return 'Error no existe la operación de devolución sobre la que realizar la anulación';
            case '9640':
                return 'Error la confirmacion separada sobre la que se desea anular no está autorizada o ya está anulada';
            case '9641':
                return 'La fecha de Anulación no puede superar en los días configurados a la devolución.';
            case '9642':
                return 'La fecha de la preautorización que se desea reemplazar no puede superar los 30 días de antigüedad';
            case '9643':
                return 'Error al obtener la personalización del comercio';
            case '9644':
                return 'Error en el proceso de autenticación 3DSecure v2 - Se envían datos de la entrada IniciaPetición a la entrada TrataPetición';
            case '9645':
                return '';
            case '9646':
                return '';
            case '9647':
                return '';
            case '9648':
                return '';
            case '9649':
                return '';
            case '9650':
                return 'Error, la MAC no es correcta en la mensajeria de pago de tributos';
            case '9651':
                return 'Error la exención exige SCA y el comercio no está preparado para autenticar';
            case '9652':
                return 'Error la exención y la configuración del comercio exigen no SCA y el comercio no está configurado para autorizar con dicha marca de tarjeta';
            case '9653':
                return 'Operacion de autenticacion rechazada, browserJavascriptEnabled no indicado';
            case '9654':
                return 'Error, se indican datos de 3RI en Inicia Petición y la versión que se envía en el trataPetición no es 2.2';
            case '9655':
                return 'Error, se indican un valor de Ds_Merchant_3RI_Ind no permitido';
            case '9656':
                return 'Error, se indican un valor Ds_Merchant_3RI_Ind diferentes en el Inicia Petición y en el trataPetición';
            case '9657':
                return 'Error, se indican datos de 3RI pero están incompletos';
            case '9658':
                return 'Error, el parámetro threeRITrasactionID es erróneo o no se encuentran datos de operación original';
            case '9659':
                return 'Error, los datos de FUC y Terminal obtenidos del threeRITrasactionID no corresponden al comercio que envía la operación';
            case '9660':
                return '3RI';
            case '9661':
                return '3RI';
            case '9662':
                return 'Error, el comercio no está entre los permitidos para realizar confirmaciones parciales.';
            case '9663':
                return 'No existe datos de Inicia Petición que concuerden con los enviados por el comercio en el mensaje Trata Petición';
            case '9664':
                return 'No se envía el elemento Id Transaccion 3DS Server en el mensaje Trata Petición y dicho elemento existe en el mensaje Inicia Petición';
            case '9665':
                return 'La moneda indicada por el comercio en el mensaje Trata Petición no corresponde con la enviada en el mensaje Inicia Petición';
            case '9666':
                return 'El importe indicado por el comercio en el mensaje Trata Petición no corresponde con el enviado en el mensaje Inicia Petición';
            case '9667':
                return 'El tipo de operación indicado por el comercio en el mensaje Trata Petición no corresponde con el enviado en el mensaje Inicia Petición';
            case '9668':
                return 'La referencia indicada por el comercio en el mensaje Trata Petición no corresponde con la enviada en el mensaje Inicia Petición';
            case '9669':
                return 'El Id Oper Insite indicado por el comercio en el mensaje Trata Petición no corresponde con el enviado en el mensaje Inicia Petición';
            case '9670':
                return 'La tarjeta indicada por el comercio en el mensaje Trata Petición no corresponde con la enviada en el mensaje Inicia Petición';
            case '9671':
                return 'Denegación por TRA Lynx';
            case '9672':
                return 'Bizum. Fallo en la autenticación. Bloqueo tras tres intentos.';
            case '9673':
                return 'Bizum. Operación cancelada. El usuario no desea seguir.';
            case '9674':
                return 'Bizum. Abono rechazado por beneficiario.';
            case '9675':
                return 'Bizum. Cargo rechazado por ordenante.';
            case '9676':
                return 'Bizum. El procesador rechaza la operación.';
            case '9677':
                return 'Bizum. Saldo disponible insuficiente.';
            case '9678':
                return 'La versión de 3DSecure indicada en el Trata Petición es errónea o es superior a la devuelva en el inicia petición';
            case '9680':
                return 'Error en la autenticación EMV3DS y la marca no permite hacer fallback a 3dSecure 1.0';
            case '9681':
                return 'Error al insertar los datos de autenticación en una operación con MPI Externo';
            case '9682':
                return 'Error la operación es de tipo Consulta de TRA y el parámetro Ds_Merchant_TRA_Data es erróneo';
            case '9683':
                return 'Error la operación es de tipo Consulta de TRA Fase 1 y falta el parámetro Ds_Merchant_TRA_Type';
            case '9684':
                return 'Error la operación es de tipo Consulta de TRA Fase 1 y el parámetro Ds_Merchant_TRA_Type tiene un valor no permitido';
            case '9685':
                return 'Error la operación es de tipo Consulta de TRA Fase 1 y el perfil del comercio no le permite exención TRA';
            case '9686':
                return 'Error la operación es de tipo Consulta de TRA Fase 1 y la confifguración del comercio no le permite usar el TRA de Redsys';
            case '9687':
                return 'Error la operación es de tipo Consulta de TRA Fase 2 y falta el parámetro Ds_Merchant_TRA_Result o tiene un valor no permitido';
            case '9688':
                return 'Error la operación es de tipo Consulta de TRA Fase 2 y falta el parámetro Ds_Merchant_TRA_Method o tiene un valor erróneo';
            case '9689':
                return 'Error la operación es de tipo Consulta de TRA Fase 2, no existe una operación concreta de Fase 1';
            case '9690':
                return 'Error la operación es de tipo Consulta de TRA Fase 2 y obtenemos un error en la respuesta de Lynx';
            case '9691':
                return 'Se envían datos SamsungPay y el comercio no tiene dado de alta el método de pago SamsungPay';
            case '9692':
                return 'Se envía petición con firma de PSP y el comercio no tiene asociado un PSP.';
            case '9693':
                return 'No se han obtenido correctamente los datos enviados por SamsungPay.';
            case '9694':
                return 'No ha podido realizarse el pago con SamsungPay';
            case '9700':
                return 'PayPal a devuelto un KO';
            case '9801':
                return 'Denegada por iUPAY';
            case '9899':
                return 'No están correctamente firmados los datos que nos envían en el Ds_Merchant_Data.';
            case '9900':
                return 'SafetyPay ha devuelto un KO';
            case '9909':
                return 'Error interno';
            case '9912':
                return 'Emisor no disponible';
            case '9913':
                return 'Excepción en el envío SOAP de la notificacion';
            case '9914':
                return 'Respuesta KO en el envío SOAP de la notificacion';
            case '9915':
                return 'Cancelado por el titular';
            case '9928':
                return 'El titular ha cancelado la preautorización';
            case '9929':
                return 'El titular ha cancelado la operación';
            case '9930':
                return 'La transferencia está pendiente';
            case '9931':
                return 'Consulte con su entidad';
            case '9932':
                return 'Denegada por Fraude (LINX)';
            case '9933':
                return 'Denegada por Fraude (LINX)';
            case '9934':
                return 'Denegada ( Consulte con su entidad)';
            case '9935':
                return 'Denegada ( Consulte con su entidad)';
            case '9966':
                return 'BIZUM ha devuelto un KO en la autorización';
            case '9992':
                return 'Solicitud de PAE';
            case '9994':
                return 'No ha seleccionado ninguna tarjeta de la cartera.';
            case '9995':
                return 'Recarga de prepago denegada';
            case '9996':
                return 'No permite la recarga de tarjeta prepago';
            case '9997':
                return 'Con una misma tarjeta hay varios pagos en "vuelo" en el momento que se finaliza uno el resto se deniegan con este código. Esta restricción se realiza por seguridad.';
            case '9998':
                return 'Operación en proceso de solicitud de datos de tarjeta';
            case '9999':
                return 'Operación que ha sido redirigida al emisor a autenticar';
            case '101':
                return 'Tarjeta caducada';
            case '106':
                return 'Tarjeta bloqueada, exceso de pin erróneo';
            case '129':
                return 'Código de seguridad CVV incorrecto.';
            case '180':
                return 'Denegación emisor';
            case '184':
                return 'El cliente de la operación no se ha autenticado';
            case '190':
                return 'Denegación emisor';
            case '904':
                return 'Problema con la configuración de su comercio. Dirigirse a la entidad.';
            case '915':
                return 'El titular ha cancelado la operación de pago.';
            case '0101':
                return 'Tarjeta caducada';
            case '0102':
                return 'Tarjeta en excepción transitoria o bajo sospecha de fraude';
            case '0106':
                return 'Intentos de PIN excedidos';
            case '0125':
                return 'Tarjeta no efectiva';
            case '0129':
                return 'Código de seguridad (CVV2/CVC2) incorrecto';
            case '172':
                return 'Denegada, no repetir.';
            case '173':
                return 'Denegada, no repetir sin actualizar datos de tarjeta.';
            case '174':
                return 'Denegada, no repetir antes de 72 horas.';
            case '0180':
                return 'Tarjeta ajena al servicio';
            case '0184':
                return 'Error en la autenticación del titular';
            case '0190':
                return 'Denegación del emisor sin especificar motivo';
            case '0191':
                return 'Fecha de caducidad errónea';
            case '0195':
                return 'Requiere autenticación SCA';
            case '0202':
                return 'Tarjeta en excepción transitoria o bajo sospecha de fraude con retirada de tarjeta';
            case '0904':
                return 'Comercio no registrado en FUC';
            case '0909':
                return 'Error de sistema';
            case '0913':
                return 'Pedido repetido';
            case '0944':
                return 'Sesión Incorrecta';
            case '0950':
                return 'Operación de devolución no permitida';
            case '9912':
                return 'Emisor no disponible';
            case '0912':
                return 'Emisor no disponible';
            case '9064':
                return 'Número de posiciones de la tarjeta incorrecto';
            case '9078':
                return 'Tipo de operación no permitida para esa tarjeta';
            case '9093':
                return 'Tarjeta no existente';
            case '9094':
                return 'Rechazo servidores internacionales';
            case '9104':
                return 'Comercio con "titular seguro" y titular sin clave de compra segura';
            case '9218':
                return 'El comercio no permite op. seguras por entrada /operaciones';
            case '9253':
                return 'Tarjeta no cumple el check-digit';
            case '9256':
                return 'El comercio no puede realizar preautorizaciones';
            case '9257':
                return 'Esta tarjeta no permite operativa de preautorizaciones';
            case '9261':
                return 'Operación detenida por superar el control de restricciones en la entrada al SIS';
            case '9915':
                return 'A petición del usuario se ha cancelado el pago';
            case '9997':
                return 'Se está procesando otra transacción en SIS con la misma tarjeta';
            case '9998':
                return 'Operación en proceso de solicitud de datos de tarjeta';
            case '9999':
                return 'Operación que ha sido redirigida al emisor a autenticar';
            case '101':
                return 'Tarjeta caducada';
            case '106':
                return 'Tarjeta bloqueada, exceso de pin erróneo';
            default:
                return '';
        }
    }
}
