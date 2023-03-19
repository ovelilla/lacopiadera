<!DOCTYPE html>
<html lang="es-ES">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura</title>

    <style>
        * {
            margin: 0;
            padding: 0
        }

        @page {
            margin: 60px !important;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
        }

        .row {
            clear: both
        }

        .row:after {
            content: ".";
            display: block;
            clear: both;
            visibility: hidden;
            height: 0;
            line-height: 0
        }

        [class*="col-"] {
            float: left;
            margin-left: 2%
        }

        [class*="col-"]:first-child {
            margin-left: 0
        }

        .col-1 {
            width: 6.5%
        }

        .col-2 {
            width: 15%
        }

        .col-3 {
            width: 23.5%
        }

        .col-4 {
            width: 32%
        }

        .col-5 {
            width: 40.5%
        }

        .col-6 {
            width: 49%
        }

        .col-7 {
            width: 57.5%
        }

        .col-8 {
            width: 66%
        }

        .col-9 {
            width: 74.5%
        }

        .col-10 {
            width: 83%
        }

        .col-11 {
            width: 91.5%
        }

        .col-12 {
            width: 100%
        }

        .w-100 {
            width: 100%
        }

        .min-w-100 {
            min-width: 100px
        }

        .float-right {
            float: right
        }

        .mt-10 {
            margin-top: 10px
        }

        .mt-20 {
            margin-top: 20px
        }

        .mt-30 {
            margin-top: 30px
        }

        .mt-40 {
            margin-top: 40px
        }

        .mt-50 {
            margin-top: 50px
        }

        .mt-60 {
            margin-top: 60px
        }

        .mt-100 {
            margin-top: 100px
        }

        .text-sm {
            font-size: 14px
        }

        .text-md {
            font-size: 16px
        }

        .text-lg {
            font-size: 18px
        }

        .text-right {
            text-align: right
        }

        .text-left {
            text-align: left
        }

        .text-center {
            text-align: center
        }

        .text-justify {
            text-align: justify
        }

        .text-last-left {
            text-align-last: left
        }

        .font-bold {
            font-weight: 700
        }

        .letter-spacing-1 {
            letter-spacing: -1px
        }

        .leading-snug {
            line-height: 1.375
        }

        .leading-normal {
            line-height: 1.5
        }

        .leading-relaxed {
            line-height: 1.625
        }

        .leading-loose {
            line-height: 2
        }

        .uppercase {
            text-transform: uppercase
        }

        h1 {
            font-size: 28px;
            font-weight: 700;
        }

        h2 {
            font-size: 24px;
            font-weight: 700;
            text-transform: uppercase
        }

        h3 {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase
        }

        table {
            border-collapse: collapse
        }

        table.items thead {
            background-color: #f0f0f0;
            border-right: 1px solid #f0f0f0;
            border-left: 1px solid #f0f0f0
        }

        table.items thead tr th {
            padding: 12px 6px;
            white-space: nowrap;
        }

        table.items tbody {
            border-right: 1px solid #f0f0f0;
            border-left: 1px solid #f0f0f0
        }

        table.items tbody tr td {
            padding: 8px 6px;
            border-bottom: 1px solid #f0f0f0;
        }

        table.items tfoot tr td {
            padding: 8px 6px;
            border-right: 1px solid #f0f0f0;
            border-bottom: 1px solid #f0f0f0;
            white-space: nowrap;
        }

        table.items tfoot tr td:first-child {
            border-bottom: none;
        }

        table.items tfoot tr td:nth-child(3) {
            background-color: #f0f0f0;
        }

        table.items tfoot tr td:nth-child(5) {
            background-color: #f0f0f0;
        }
    </style>
</head>

<body>

    <div class="wrapper">
        <div class="row">
            <h1 class="col-6">Lacopiadera.com</h1>
            <h2 class="col-6 text-right">Factura</h2>
        </div>

        <div class="row mt-30">
            <div class="col-12 issuer">
                <p>Alexgraf SL</p>
                <p>NIF 12329751</p>
                <p>C/ San Fernando, nº 18</p>
                <p>12570 Alcalà de Xivert</p>
                <p>675711301</p>
            </div>
        </div>

        <div class="row mt-30">
            <div class="col-4 leading-snug">
                <h3>Facturar a</h3>
                <p><?php echo $order['shippingAddress']['name'] . " " . $order['shippingAddress']['lastname'] ?></p>
                <p><?php echo $order['shippingAddress']['nif'] ?></p>
                <p><?php echo $order['shippingAddress']['address'] ?></p>
                <p><?php echo $order['shippingAddress']['postcode'] . " " . $order['shippingAddress']['location'] . " " . $order['shippingAddress']['province'] ?></p>
            </div>

            <div class="col-4 leading-snug">
                <h3>Enviar a</h3>
                <p><?php echo $order['billingAddress']['name'] . " " . $order['billingAddress']['lastname'] ?></p>
                <p><?php echo $order['billingAddress']['nif'] ?></p>
                <p><?php echo $order['billingAddress']['address'] ?></p>
                <p><?php echo $order['billingAddress']['postcode'] . " " . $order['billingAddress']['location'] . " " . $order['billingAddress']['province'] ?></p>
            </div>
            
            <?php
            $formatDate = new DateTime($order['updatedAt']);
            ?>

            <div class="col-4 leading-relaxed">
                <table class="col-12">
                    <tr>
                        <th class="font-bold uppercase text-left">Nº de factura</th>
                        <td class="text-right"><?php echo $invoice->getNumber() ?></td>
                    </tr>
                    <tr>
                        <th class="font-bold uppercase text-left">Nº de pedido</th>
                        <td class="text-right"><?php echo $order['number'] ?></td>
                    </tr>
                    <tr>
                        <th class="font-bold uppercase text-left">Emision</th>
                        <td class="text-right"><?php echo $formatDate->format('d/m/Y'), PHP_EOL ?></td>
                    </tr>
                    <tr>
                        <th class="font-bold uppercase text-left">Vencimiento</th>
                        <td class="text-right"><?php echo $formatDate->format('d/m/Y'), PHP_EOL ?></td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="row mt-40">
            <table class="items col-12">
                <thead>
                    <tr>
                        <th class="text-left">Descripción</th>
                        <th class="text-right">Precio u.</th>
                        <th>Cant.</th>
                        <th class="text-right">Importe</th>
                    </tr>
                </thead>

                <tbody>
                    <?php
                    foreach ($order['items'] as $item) :
                        foreach ($item['files'] as $file) :
                    ?>
                            <tr>
                                <td><?php echo $file['name'] ?></td>
                                <td class="text-right"><?php echo number_format($file['unitPrice'] / 1.21, 2, ',') ?> €</td>
                                <td class="text-center"><?php echo $item['options']['copies'] ?></td>
                                <td class="text-right"><?php echo number_format($file['totalPrice'] / 1.21, 2, ',') ?> €</td>
                            </tr>
                    <?php
                        endforeach;
                    endforeach;

                    $shippingPrice = $order['shippingPrice'] / 1.21;
                    $subtotal = $order['subtotal'] / 1.21;
                    $discount = $order['discount'];
                    $discountAmount = $subtotal * $discount / 100;
                    $iva = ($subtotal - $discountAmount +  $shippingPrice) * 1.21 - ($subtotal - $discountAmount +  $shippingPrice);
                    $total = $order['total'];
                    ?>

                    <tr>
                        <td>Portes</td>
                        <td class="text-right"><?php echo number_format($shippingPrice, 2, ',') ?> €</td>
                        <td class="text-center">1</td>
                        <td class="text-right"><?php echo number_format($shippingPrice, 2, ',') ?> €</td>
                    </tr>
                </tbody>

                <tfoot>
                    <tr>
                        <td></td>
                        <td colspan="2" class="text-right">Subtotal</td>
                        <td class="text-right"><?php echo number_format($subtotal + $shippingPrice, 2, ',') ?> €</td>
                    </tr>

                    <?php if ($discount > 0) : ?>
                        <tr>
                            <td></td>
                            <td colspan="2" class="text-right">Descuento <?php echo $discount ?> %</td>
                            <td class="text-right"><?php echo number_format($discountAmount, 2, ',') ?> €</td>
                        </tr>

                        <tr>
                            <td></td>
                            <td colspan="2" class="text-right">Subtotal menos dto.</td>
                            <td class="text-right"><?php echo number_format($subtotal + $shippingPrice - $discountAmount, 2, ',') ?> €</td>
                        </tr>
                    <?php endif ?>

                    <tr>
                        <td></td>
                        <td colspan="2" class="text-right">IVA 21 %</td>
                        <td class="text-right"><?php echo number_format($iva, 2, ',') ?> €</td>
                    </tr>

                    <tr>
                        <td></td>
                        <td colspan="2" class="text-right uppercase font-bold">Total</td>
                        <td class="text-right font-bold"><?php echo number_format($total, 2, ',') ?> €</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="row mt-40">
            <div class="col-12 text-center leading-loose">
                <p>Gracias por confiar en nosotros.</p>
                <p>Si usted tiene alguna pregunta sobre esta factura, póngase en contacto admin@lacopiadera.com.</p>
            </div>
        </div>
    </div>

</body>

</html>