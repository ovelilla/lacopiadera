import Collapse from "./Collapse";
import Loader from "./Loader";
import { api } from "../modules/Api";
import { icons } from "../modules/Icons";
import { tools } from "../modules/Tools";
import { navigator } from "../app";

class Orders {
    constructor() {
        this.orders = [];

        this.page = 1;
        this.limit = 10;
        this.total = 0;
    }

    async init() {
        const orders = document.querySelector("#orders");

        orders.parentElement.addEventListener("scroll", this.scroll.bind(this));

        await this.read();
        this.show();

        if (
            orders.parentElement.clientHeight > orders.clientHeight &&
            this.page * this.limit < this.total
        ) {
            this.page++;

            const loader = new Loader({
                parent: orders,
            });
            await loader.open();

            await this.timeout(1000);
            await this.read();

            await loader.close();
            this.show();
        }
    }

    add(orders) {
        this.orders = [...this.orders, ...orders];
    }

    clear() {
        this.orders = [];
    }

    async read() {
        const data = {
            page: this.page,
            limit: this.limit,
        };

        const response = await api.post("/api/order/read", data);

        this.add(response.orders);

        this.total = response.total;
    }

    show() {
        const orders = document.querySelector("#orders");

        if (!this.orders.length) {
            this.ordersEl = this.createEmpty();
            orders.appendChild(this.ordersEl);
            return;
        }

        this.ordersEl = this.createOrders();
        orders.appendChild(this.ordersEl);
    }

    async scroll() {
        const orders = document.querySelector("#orders");

        const { scrollTop, scrollHeight, clientHeight } = orders.parentElement;

        console.log(this.page * this.limit <= this.total);

        if (scrollTop + clientHeight >= scrollHeight && this.page * this.limit < this.total) {
            this.page++;

            const loader = new Loader({
                parent: orders.firstChild,
            });
            await loader.open();

            await this.timeout(1000);
            await this.read();

            await loader.close();

            this.show();
        }
    }

    timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    createEmpty() {
        const empty = document.createElement("div");
        empty.classList.add("empty");

        const icon = icons.get("exclamationCircle");
        empty.appendChild(icon);

        const message = document.createElement("p");
        message.textContent = "Aún no has realizado ningún pedido";
        empty.appendChild(message);

        return empty;
    }

    createOrders() {
        const fragment = document.createDocumentFragment();

        this.orders.forEach((order) => fragment.appendChild(this.createOrder(order)));

        return fragment;
    }

    createOrder(order) {
        const orderEl = document.createElement("div");
        orderEl.classList.add("order");

        const header = document.createElement("div");
        header.classList.add("header");
        orderEl.appendChild(header);

        const firstRow = document.createElement("div");
        firstRow.classList.add("row");
        header.appendChild(firstRow);

        const fileIcon = document.createElement("div");
        fileIcon.classList.add("file-icon");
        firstRow.appendChild(fileIcon);

        fileIcon.appendChild(icons.get("bagShopping"));

        const col = document.createElement("div");
        col.classList.add("col");
        firstRow.appendChild(col);        

        const name = document.createElement("div");
        name.classList.add("name");
        col.appendChild(name);

        const nameSpan = document.createElement("span");
        nameSpan.textContent = `Pedido con ${order.units} ${
            order.units > 1 ? "impresiones" : "impresión"
        }`;
        name.appendChild(nameSpan);

        const date = document.createElement("div");
        date.classList.add("date");
        date.textContent = tools.dateFormatShort(order.createdAt);
        col.appendChild(date);

        const total = document.createElement("div");
        total.classList.add("total");
        total.textContent = `${order.total} €`;
        col.appendChild(total);

        const openIcon = document.createElement("div");
        openIcon.classList.add("open-icon");
        firstRow.appendChild(openIcon);

        openIcon.appendChild(icons.get("chevronRight"));

        const secondRow = document.createElement("div");
        secondRow.classList.add("row");
        header.appendChild(secondRow);

        const number = document.createElement("div");
        number.classList.add("number");
        secondRow.appendChild(number);

        const numberSpan = document.createElement("span");
        numberSpan.textContent = `${innerWidth < 1024 ? "ID:" : "ID de pedido:"} ${order.number}`;
        number.appendChild(numberSpan);

        const actions = document.createElement("div");
        actions.classList.add("actions");
        secondRow.appendChild(actions);

        const detailsBtn = document.createElement("button");
        detailsBtn.textContent = "Detalles";
        detailsBtn.setAttribute("aria-label", "Detalles pedido");
        detailsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
        });
        actions.appendChild(detailsBtn);

        if (order.paid) {
            const invoiceBtn = document.createElement("button");
            invoiceBtn.textContent = "Factura";
            invoiceBtn.setAttribute("aria-label", "Factura pedido");
            invoiceBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.handleInvoice(order);
            });
            actions.appendChild(invoiceBtn);
        } else {
            const payBtn = document.createElement("button");
            payBtn.textContent = "Pagar";
            payBtn.setAttribute("aria-label", "Pagar pedido");
            payBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.handlePayment(order);
            });
            actions.appendChild(payBtn);
        }

        const body = document.createElement("div");
        body.classList.add("body");
        orderEl.appendChild(body);

        new Collapse({
            target: header,
            container: body,
            collapsed: true,
        });

        const itemsEl = this.createItems(order.items);
        body.appendChild(itemsEl);

        return orderEl;
    }

    createItems(items) {
        const fragment = document.createDocumentFragment();
        items.forEach((item) => fragment.appendChild(this.createItem(item)));
        return fragment;
    }

    createItem(item) {
        const itemEl = document.createElement("div");
        itemEl.classList.add("item");

        const header = document.createElement("div");
        header.classList.add("header");
        itemEl.appendChild(header);

        const icon = document.createElement("div");
        icon.classList.add("icon");
        header.appendChild(icon);

        icon.appendChild(icons.get("files"));

        const row = document.createElement("div");
        row.classList.add("row");
        header.appendChild(row);

        const name = document.createElement("div");
        name.classList.add("name");
        row.appendChild(name);

        const nameSpan = document.createElement("span");
        nameSpan.textContent = `Impresión con ${item.files.length} ${
            item.files.length > 1 ? "documentos" : "documento"
        }`;
        name.appendChild(nameSpan);

        const price = document.createElement("div");
        price.classList.add("price");
        price.textContent = tools.formatCurrency(item.price);
        row.appendChild(price);

        const openIconDiv = document.createElement("div");
        openIconDiv.classList.add("open-icon");
        header.appendChild(openIconDiv);

        const openIcon = icons.get("chevronRight");
        openIconDiv.appendChild(openIcon);

        const body = document.createElement("div");
        body.classList.add("body");
        itemEl.appendChild(body);

        const options = this.createOptions(item);
        body.appendChild(options);

        const files = this.createFiles(item);
        body.appendChild(files);

        new Collapse({
            target: header,
            container: body,
            collapsed: true,
        });

        return itemEl;
    }

    createOptions(item) {
        const optionsEl = document.createElement("div");
        optionsEl.classList.add("options");

        const dl = document.createElement("dl");
        optionsEl.appendChild(dl);

        for (const [key, value] of Object.entries(item.options)) {
            let dtText;
            let ddText;

            switch (key) {
                case "color":
                    dtText = "Color:";
                    ddText = value === "color" ? "Color" : "Blanco y negro";
                    break;
                case "copies":
                    dtText = "Número de copias:";
                    ddText = value;
                    break;
                case "doubleSided":
                    dtText = "Doble cara:";
                    ddText = value ? "Sí" : "No";
                    break;
                case "orientation":
                    dtText = "Orientación:";
                    switch (value) {
                        case "automatic":
                            ddText = "Automática";
                            break;
                        case "vertical":
                            ddText = "Vertical";
                            break;
                        case "horizontal":
                            ddText = "Horizontal";
                            break;
                    }
                    break;
                case "customPages":
                    dtText = "Páginas";
                    switch (value) {
                        case "all":
                            ddText = "Todas";
                            break;
                        case "range":
                            ddText = `${item.options.from} - ${item.options.to}`;
                            break;
                    }
                    break;
                case "size":
                    dtText = "Tamaño de hoja:";
                    switch (value) {
                        case "a4":
                            ddText = "A4";
                            break;
                        case "a3":
                            ddText = "A3";
                            break;
                    }
                    break;
                case "pagesPerSheet":
                    dtText = "Páginas por hoja:";
                    switch (value) {
                        case 1:
                            ddText = "Normal";
                            break;
                        case 2:
                            ddText = "2";
                            break;
                        case 3:
                            ddText = "4";
                            break;
                    }
                    break;
                case "binding":
                    dtText = "Encuadernar:";
                    switch (value) {
                        case "none":
                            ddText = "No";
                            break;
                        case "bound":
                            ddText = "Encuadernado";
                            break;
                        case "stapled":
                            ddText = "Grapado";
                            break;
                        case "punch-double":
                            ddText = "Perforado doble";
                            break;
                        case "punch-quadruple":
                            ddText = "Perforado cuadruple";
                            break;
                        case "laminated":
                            ddText = "Plastificado";
                            break;
                    }
                    break;
                default:
                    continue;
            }

            const option = document.createElement("div");
            dl.appendChild(option);

            const dt = document.createElement("dt");
            dt.textContent = dtText;
            option.appendChild(dt);

            const dd = document.createElement("dd");
            dd.textContent = ddText;
            option.appendChild(dd);
        }

        return optionsEl;
    }

    createFiles(item) {
        const files = document.createElement("div");
        files.classList.add("files");

        item.files.forEach((file) => {
            const fileEl = document.createElement("div");
            fileEl.classList.add("file");
            files.appendChild(fileEl);

            const image = document.createElement("div");
            image.classList.add("image");
            fileEl.appendChild(image);

            const img = document.createElement("img");
            img.src = file.imageBase64;
            img.alt = "Imágen primera página PDF";
            if (item.options.color === "color") {
                img.classList.add("color");
            }
            image.appendChild(img);

            const data = document.createElement("div");
            data.classList.add("data");
            fileEl.appendChild(data);

            const name = document.createElement("div");
            name.classList.add("name");
            data.appendChild(name);

            const nameSpan = document.createElement("span");
            nameSpan.textContent = file.name;
            name.appendChild(nameSpan);

            const info = document.createElement("div");
            info.classList.add("info");
            data.appendChild(info);

            const pages = document.createElement("span");
            pages.classList.add("pages");
            info.appendChild(pages);

            const pagesSpan = document.createElement("span");
            pagesSpan.textContent = `${file.pages} ${file.pages > 0 ? "páginas" : "página"}`;
            pages.appendChild(pagesSpan);

            const size = document.createElement("span");
            size.classList.add("size");
            info.appendChild(size);

            const sizeSpan = document.createElement("span");
            sizeSpan.textContent = tools.formatBytes(file.size);
            size.appendChild(sizeSpan);

            const type = document.createElement("span");
            type.classList.add("type");
            info.appendChild(type);

            const typeSpan = document.createElement("span");
            typeSpan.textContent = `Tipo: ${file.type.replace("application/", "").toUpperCase()}`;
            type.appendChild(typeSpan);

            const sheets = document.createElement("div");
            sheets.classList.add("sheets");
            fileEl.appendChild(sheets);

            const sheetsSpan = document.createElement("div");
            sheetsSpan.classList.add("title");
            sheetsSpan.textContent = "Hojas";
            sheets.appendChild(sheetsSpan);

            const unitSheetsSpan = document.createElement("span");
            unitSheetsSpan.classList.add("unit");
            unitSheetsSpan.textContent = file.unitSheets;
            sheets.appendChild(unitSheetsSpan);

            const totalSheetsSpan = document.createElement("span");
            totalSheetsSpan.classList.add("total");
            totalSheetsSpan.textContent = file.totalSheets;
            sheets.appendChild(totalSheetsSpan);

            const price = document.createElement("div");
            price.classList.add("price");
            fileEl.appendChild(price);

            const priceSpan = document.createElement("span");
            priceSpan.classList.add("title");
            priceSpan.textContent = "Precio";
            price.appendChild(priceSpan);

            const unitPriceSpan = document.createElement("span");
            unitPriceSpan.classList.add("unit");
            unitPriceSpan.textContent = tools.formatCurrency(file.unitPrice);
            price.appendChild(unitPriceSpan);

            const totalPriceSpan = document.createElement("span");
            totalPriceSpan.classList.add("total");
            totalPriceSpan.textContent = tools.formatCurrency(file.totalPrice);
            price.appendChild(totalPriceSpan);
        });

        return files;
    }

    repaint() {
        this.remove();
        this.show();
    }

    async handleInvoice(order) {
        const response = await api.post("/api/order/invoice", order);

        const linkSource = `data:application/pdf;base64,${response.base64}`;
        const downloadLink = document.createElement("a");
        const fileName = response.fileName;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }
    
    async handlePayment(order) {
        const responseUpdateNumber = await api.post("/api/order/update-number", order);
        const responseRedsysData = await api.post("/api/order/redsys-data", responseUpdateNumber.order);

        const form = document.createElement("form");
        form.action = "https://sis-t.redsys.es:25443/sis/realizarPago";
        form.method = "POST";
        form.target = "_blank";
        form.style.display = "none";

        const inputDs_SignatureVersion = document.createElement("input");
        inputDs_SignatureVersion.name = "Ds_SignatureVersion";
        inputDs_SignatureVersion.value = responseRedsysData.data.Ds_SignatureVersion;
        form.appendChild(inputDs_SignatureVersion);

        const inputDs_MerchantParameters = document.createElement("input");
        inputDs_MerchantParameters.name = "Ds_MerchantParameters";
        inputDs_MerchantParameters.value = responseRedsysData.data.Ds_MerchantParameters;
        form.appendChild(inputDs_MerchantParameters);

        const inputDs_Signature = document.createElement("input");
        inputDs_Signature.name = "Ds_Signature";
        inputDs_Signature.value = responseRedsysData.data.Ds_Signature;
        form.appendChild(inputDs_Signature);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        navigator.goTo("/pedidos");
    }
}

export default Orders;
