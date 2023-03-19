import Collapse from "./Collapse";
import Tooltip from "./Tooltip";
import IconButton from "./mio/IconButton";
import { icons } from "../modules/Icons";
import { tools } from "../modules/Tools";

class Items {
    constructor({ cart, onUpdate, onDelete }) {
        this.cart = cart;

        this.onUpdate = onUpdate;
        this.onDelete = onDelete;
    }

    init() {
        this.show();
    }

    show() {
        const itemsContainer = document.querySelector("#items");

        this.itemsEl = this.create();
        itemsContainer.appendChild(this.itemsEl);
    }

    create() {
        if (this.cart.isEmpty()) {
            return this.createEmpty();
        }

        const itemsEl = document.createElement("div");
        itemsEl.classList.add("items");

        const fragment = document.createDocumentFragment();

        this.cart.get().forEach((item) => {
            const itemEl = this.createItem(item);
            fragment.appendChild(itemEl);
        });

        itemsEl.appendChild(fragment);

        return itemsEl;
    }

    createEmpty() {
        const empty = document.createElement("div");
        empty.classList.add("empty");

        const icon = icons.get("exclamationCircle");
        empty.appendChild(icon);

        const message = document.createElement("p");
        message.textContent = "El carrito está vacío";
        empty.appendChild(message);

        return empty;
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
        price.textContent = tools.formatCurrency(item.resume.price);
        row.appendChild(price);

        const actions = document.createElement("div");
        actions.classList.add("actions");
        header.appendChild(actions);

        const editBtn = new IconButton({
            ariaLabel: "Editar impresión",
            buttonSize: "large",
            svgSize: "large",
            icon: icons.get("pencilSquare"),
            onClick: this.onUpdate.bind(this, item),
        });
        actions.appendChild(editBtn.get());

        new Tooltip({
            target: editBtn.get(),
            message: "Editar impresión",
            position: "top",
        });

        const deleteBtn = new IconButton({
            ariaLabel: "Eliminar impresión",
            buttonSize: "large",
            svgSize: "large",
            icon: icons.get("trash"),
            onClick: this.onDelete.bind(this, item),
        });
        actions.appendChild(deleteBtn.get());

        new Tooltip({
            target: deleteBtn.get(),
            message: "Eliminar impresión",
            position: "top",
        });

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
            img.src = file.image;
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

    remove() {
        this.itemsEl.remove();
    }
}

export default Items;
