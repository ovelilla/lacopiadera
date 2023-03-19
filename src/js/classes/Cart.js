import IconButton from "./mio/IconButton.js";
import { indexedDB } from "../modules/IndexedDB";
import { icons } from "../modules/Icons.js";
import { tools } from "../modules/Tools.js";

class Cart {
    constructor({ cart, onUpdate, onDelete, onClear }) {
        this.cart = cart;

        this.item = null;

        this.onUpdate = onUpdate;
        this.onDelete = onDelete;
        this.onClear = onClear;

        this.isOpen = false;

        this.init();
    }

    async init() {
        const cartPanelBtn = document.querySelector("#cart-panel-btn");
        const cartPanel = document.querySelector("#cart-panel");

        window.addEventListener("resize", this.position.bind(this));
        cartPanelBtn.addEventListener("click", () => {
            this.open();
        });
        cartPanel.addEventListener("click", (e) => {
            if (e.target.id === "cart-panel") {
                this.close();
            }
        });

        this.setCartPanelBtnUnits();

        this.cartEl = this.create();
        cartPanel.appendChild(this.cartEl);
    }

    set(cart) {
        this.cart = cart;
    }

    get() {
        return this.cart;
    }

    getItem() {
        return this.item;
    }

    setItem(item) {
        this.item = item;
    }

    async add(item) {
        const insertedId = await indexedDB.addRecord(item, "cart");
        item.setId(insertedId);
        this.cart = [...this.cart, item];
    }

    async update(updatedItem) {
        await indexedDB.updateRecord(updatedItem, "cart");
        this.cart = this.cart.map((item) => (item.id === updatedItem.id ? updatedItem : item));
    }

    async delete(deletedItem) {
        await indexedDB.deleteRecord(deletedItem.id, "cart");
        this.cart = this.cart.filter((item) => item.id !== deletedItem.id);
    }

    async clear() {
        await indexedDB.clearRecords("cart");
        this.cart = [];
    }

    length() {
        return this.cart.length;
    }

    isEmpty() {
        return this.cart.length === 0;
    }

    repaint() {
        const cartPanel = document.querySelector("#cart-panel");

        this.cartEl.remove();
        this.cartEl = this.create();
        cartPanel.appendChild(this.cartEl);
        this.position();
        this.setCartPanelBtnUnits();
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + item.resume.price, 0);
    }

    setCartPanelBtnUnits() {
        const cartPanelBtn = document.querySelector("#cart-panel-btn");
        const units = cartPanelBtn.querySelector(".units");

        units.textContent = this.cart.length;
    }

    create() {
        const content = document.createElement("div");
        content.classList.add("content");

        const header = document.createElement("div");
        header.classList.add("header");
        content.appendChild(header);

        const title = document.createElement("div");
        title.classList.add("title");
        title.textContent = "Mi carrito";
        header.appendChild(title);

        const row = document.createElement("div");
        row.classList.add("row");
        header.appendChild(row);

        const unitsEl = document.createElement("div");
        unitsEl.classList.add("units");
        unitsEl.textContent = `${this.cart.length} ${
            this.cart.length === 0 || this.cart.length > 1 ? "items" : "item"
        }`;
        row.appendChild(unitsEl);

        const closeBtn = new IconButton({
            icon: icons.get("xLg"),
            buttonSize: "large",
            svgSize: "large",
            ariaLabel: "Cerrar",
            onClick: this.close.bind(this),
        });
        row.appendChild(closeBtn.get());

        const body = document.createElement("div");
        body.classList.add("body");
        content.appendChild(body);

        this.cart.forEach((item) => {
            const { files, options, resume } = item;

            const itemEl = document.createElement("div");
            itemEl.classList.add("item");
            body.appendChild(itemEl);

            const pdfIconDiv = document.createElement("div");
            pdfIconDiv.classList.add("icon");
            itemEl.appendChild(pdfIconDiv);

            const pdfIcon = icons.get("files");
            pdfIconDiv.appendChild(pdfIcon);

            const filesEl = document.createElement("div");
            filesEl.classList.add("files");
            itemEl.appendChild(filesEl);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                const span = document.createElement("span");
                filesEl.appendChild(span);
                if (files.length > 3 && i === 2) {
                    span.textContent = `${files.length - i} ${
                        files.length - i > 1 ? "documentos" : "documento"
                    } más`;
                    break;
                }
                span.textContent = file.name;
            }

            const info = document.createElement("div");
            info.classList.add("info");
            itemEl.appendChild(info);

            const quantity = document.createElement("span");
            quantity.classList.add("quantity");
            quantity.textContent = `${options.copies} ${options.copies > 1 ? "copias" : "copia"}`;
            info.appendChild(quantity);

            const sheets = document.createElement("span");
            sheets.classList.add("sheets");
            sheets.textContent = `${resume.sheets} ${resume.sheets > 1 ? "hojas" : "hoja"}`;
            info.appendChild(sheets);

            const price = document.createElement("span");
            price.classList.add("price");
            price.textContent = tools.formatCurrency(resume.price);
            info.appendChild(price);

            const action = document.createElement("div");
            action.classList.add("action");
            itemEl.appendChild(action);

            const updateBtn = new IconButton({
                icon: icons.get("pencilSquare"),
                buttonSize: "large",
                svgSize: "large",
                ariaLabel: "Editar",
                onClick: this.onUpdate.bind(this, item),
            });
            action.appendChild(updateBtn.get());

            const deleteBtn = new IconButton({
                icon: icons.get("trash"),
                buttonSize: "large",
                svgSize: "large",
                ariaLabel: "Eliminar",
                onClick: this.onDelete.bind(this, item),
            });
            action.appendChild(deleteBtn.get());
        });

        const footer = document.createElement("div");
        footer.classList.add("footer");
        content.appendChild(footer);

        const totalEl = document.createElement("div");
        totalEl.classList.add("total");
        totalEl.textContent = "Total";
        footer.appendChild(totalEl);

        const totalSpan = document.createElement("span");
        totalSpan.textContent = tools.formatCurrency(this.getTotal());
        totalEl.appendChild(totalSpan);

        const buttons = document.createElement("div");
        buttons.classList.add("buttons");
        footer.appendChild(buttons);

        const emptyCartBtn = document.createElement("button");
        emptyCartBtn.classList.add("btn", "secondary-btn");
        emptyCartBtn.setAttribute("aria-label", "Vaciar carrito");
        emptyCartBtn.textContent = "Vaciar carrito";
        emptyCartBtn.addEventListener("click", this.onClear.bind(this));
        buttons.appendChild(emptyCartBtn);

        const openResumeBtn = document.createElement("a");
        openResumeBtn.classList.add("btn", "primary-btn");
        openResumeBtn.href = "/checkout";
        openResumeBtn.textContent = "Ver pedido";
        buttons.appendChild(openResumeBtn);

        const arrow = document.createElement("div");
        arrow.classList.add("arrow");
        content.appendChild(arrow);

        return content;
    }

    async open() {
        const cartPanel = document.querySelector("#cart-panel");

        if (this.isOpen) {
            return;
        }

        this.isOpen = true;

        cartPanel.classList.add("active", "in");
        this.position();
        await this.animationend(cartPanel);
        cartPanel.classList.remove("in");
    }

    async close() {
        const cartPanel = document.querySelector("#cart-panel");

        if (!this.isOpen) {
            return;
        }

        this.isOpen = false;

        cartPanel.classList.add("out");
        await this.animationend(cartPanel);
        cartPanel.classList.remove("active", "in", "out");
    }

    position() {
        if (!this.isOpen) {
            return;
        }

        const header = document.querySelector("header .container");
        const cartPanelBtn = document.querySelector("#cart-panel-btn");
        const cartPanel = document.querySelector("#cart-panel");
        const arrow = document.querySelector("#cart-panel .arrow");

        const rect = cartPanelBtn.getBoundingClientRect();

        const style = getComputedStyle(header);
        const marginRight = parseInt(style.marginRight);

        const top = rect.top + cartPanelBtn.offsetHeight + 14;
        cartPanel.firstElementChild.style.top = `${top}px`;

        if (innerWidth < 480) {
            const width = document.body.offsetWidth - 20;
            const right = (document.body.offsetWidth - width) / 2;
            const rightArrow = width - rect.right + 10 + rect.width / 2 - arrow.offsetWidth / 2;

            cartPanel.firstElementChild.style.maxWidth = width + "px";
            cartPanel.firstElementChild.style.right = right + "px";
            arrow.style.right = rightArrow + "px";
        } else if (innerWidth < 768) {
            const width = document.body.offsetWidth - 40;
            const right = (document.body.offsetWidth - width) / 2;
            const rightArrow = width - rect.right + 20 + rect.width / 2 - arrow.offsetWidth / 2;

            cartPanel.firstElementChild.style.maxWidth = width + "px";
            cartPanel.firstElementChild.style.right = right + "px";
            arrow.style.right = rightArrow + "px";
        } else if (innerWidth < 1024) {
            const width = document.body.offsetWidth;
            const right = marginRight + 30;
            const rightArrow =
                width - rect.right - 30 + rect.width / 2 - arrow.offsetWidth / 2 - marginRight;

            cartPanel.firstElementChild.style.maxWidth = "500px";
            cartPanel.firstElementChild.style.right = right + "px";
            arrow.style.right = rightArrow + "px";
        } else {
            const width = document.body.offsetWidth;
            const right = marginRight + 40;
            const rightArrow =
                width - rect.right - 40 + rect.width / 2 - arrow.offsetWidth / 2 - marginRight;

            cartPanel.firstElementChild.style.maxWidth = "560px";
            cartPanel.firstElementChild.style.right = right + "px";
            arrow.style.right = rightArrow + "px";
        }
    }

    animationend(target) {
        return new Promise((resolve) => {
            target.addEventListener("animationend", resolve, { once: true });
        });
    }
}

export default Cart;
