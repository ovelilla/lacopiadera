<!DOCTYPE html>
<html lang="es-ES">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lacopiadera | <?php echo $title ?? '' ?></title>
</head>

<body style="background-color: #f6f6f6;font-family: sans-serif;font-size: 14px;line-height: 1.4;margin: 0;padding: 0;">
    <span class="preheader" style="color: transparent;display: none;height: 0;max-height: 0;max-width: 0;opacity: 0;overflow: hidden;visibility: hidden;width: 0;">Email para confirmar tu pedido en lacopiadera.com</span>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate;width: 100%;background-color: #f6f6f6;">
        <tr>
            <td class="container" style="font-family: sans-serif;font-size: 14px;display: block;max-width: 580px;padding: 10px;width: 580px;margin: 0 auto !important;">
                <div class="content" style="box-sizing: border-box;display: block;margin: 0 auto;max-width: 580px;padding: 10px;">
                    <table role="presentation" class="main" style="border-collapse: separate;width: 100%;background: #fff;border-radius: 3px;">
                        <tr>
                            <td class="wrapper" style="font-family: sans-serif;font-size: 14px;box-sizing: border-box;padding: 20px;">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;width: 100%;">
                                    <tr>
                                        <td style="font-family: sans-serif;font-size: 14px;">
                                            <h1 style="color: #000;font-family: sans-serif;font-weight: 300;line-height: 1.4;margin: 0;margin-bottom: 30px;font-size: 35px;text-align: center;">Nuevo pedido</h1>
                                            <p style="font-family: sans-serif;font-size: 14px;font-weight: 400;margin: 0;margin-bottom: 15px;"><strong>¡Hola Alberto!</strong></p>
                                            <p style="font-family: sans-serif;font-size: 14px;font-weight: 400;margin: 0;margin-bottom: 15px;">Has recibido un nuevo pedido con número: <?php echo $this->data['order']['number'] ?>.</p>
                                            <p style="font-family: sans-serif;font-size: 14px;font-weight: 400;margin: 0;margin-bottom: 15px;">El import del pedido asciende a <?php echo $this->data['order']['total'] ?> €.</p>
                                            <p style="font-family: sans-serif;font-size: 14px;font-weight: 400;margin: 0;margin-bottom: 15px;">Para descargar los documentos accede al panel de administración, sección pedidos.</p>
                                            <p style="font-family: sans-serif;font-size: 14px;font-weight: 400;margin: 0;margin-bottom: 15px;">Puedes consultar la factura generada adjunta en este mensaje.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <div class="footer" style="clear: both;margin-top: 10px;text-align: center;width: 100%;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;width: 100%;">
                            <tr>
                                <td class="content-block" style="font-family: sans-serif;font-size: 12px;vertical-align: top;padding-bottom: 10px;padding-top: 10px;color: #999;text-align: center;">
                                    <span class="apple-link" style="color: #999;font-size: 12px;text-align: center;">Lacopiadera.com</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </td>
        </tr>
    </table>

</body>

</html>