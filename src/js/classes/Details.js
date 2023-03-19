import Select from "./mio/Select";
import Input from "./mio/Input";
import LoadingButton from "./LoadingButton";
import { tools } from "../modules/Tools";
import { api } from "../modules/Api";
import { icons } from "../modules/Icons";

class Details {
    constructor({ cart, nextStepText, onClick }) {
        this.cart = cart;
        this.nextStepText = nextStepText;
        this.onClick = onClick;

        this.shippingMethod = "standard";
        this.shippingPrice = this.calculateShippingPrice();

        this.code = "";
        this.discount = 0;

        this.units = this.calculateUnits();
        this.subtotal = this.calculateSubtotal();
        this.total = this.calculateTotal();
    }

    init() {
        this.show();
    }

    get() {
        return {
            shippingMethod: this.shippingMethod,
            shippingPrice: this.shippingPrice,
            code: this.code,
            discount: this.discount,
            units: this.units,
            subtotal: this.subtotal,
            total: this.total,
        };
    }

    setDetails(details) {
        this.shippingMethod = details.shippingMethod;
        this.shippingPrice = details.shippingPrice;
        this.code = details.code;
        this.discount = details.discount;
    }

    calculateShippingPrice() {
        switch (this.shippingMethod) {
            case "standard":
                return 3;
            case "express":
                return 6;
            case "shop":
                return 0;
        }
    }

    calculateUnits() {
        return this.cart.length();
    }

    calculateSubtotal() {
        return this.cart.get().reduce((total, item) => total + item.resume.price, 0);
    }

    calculateTotal() {
        return this.subtotal + this.shippingPrice - (this.subtotal * this.discount) / 100;
    }

    recalculate() {
        this.shippingPrice = this.calculateShippingPrice();
        this.units = this.calculateUnits();
        this.subtotal = this.calculateSubtotal();
        this.total = this.calculateTotal();
    }

    repaint() {
        this.remove();
        this.recalculate();
        this.show();
    }

    remove() {
        this.detailsEl.remove();
    }

    show() {
        const detailsContainer = document.querySelector("#details");

        this.detailsEl = this.create();
        detailsContainer.appendChild(this.detailsEl);
    }

    create() {
        const detailsEl = document.createElement("div");
        detailsEl.classList.add("details");

        const title = document.createElement("div");
        title.classList.add("title");
        title.textContent = "Detalles del pedido";
        detailsEl.appendChild(title);

        const info = document.createElement("div");
        info.classList.add("info");
        detailsEl.appendChild(info);

        const units = document.createElement("div");
        units.classList.add("units");
        units.textContent = "Impresiones";
        info.appendChild(units);

        const unitsSpan = document.createElement("span");
        unitsSpan.textContent = this.units;
        units.appendChild(unitsSpan);

        const subtotal = document.createElement("div");
        subtotal.classList.add("subtotal");
        subtotal.textContent = "Subtotal";
        info.appendChild(subtotal);

        const subtotalSpan = document.createElement("span");
        subtotalSpan.textContent = tools.formatCurrency(this.subtotal);
        subtotal.appendChild(subtotalSpan);

        if (this.discount) {
            const discount = document.createElement("div");
            discount.classList.add("discount");
            discount.textContent = "Descuento";
            info.appendChild(discount);

            const discountSpan = document.createElement("span");
            discountSpan.textContent = `${this.discount} %`;
            discount.appendChild(discountSpan);
        }

        const form = document.createElement("form");
        form.classList.add("mio-form");
        detailsEl.appendChild(form);

        const shippingMethod = new Select({
            label: {
                text: "Método de envio",
                for: "shippingMethod",
            },
            select: {
                name: "shippingMethod",
                id: "shippingMethod",
            },
            option: {
                value: "value",
                text: "text",
            },
            options: [
                { value: "standard", text: "Envio estandard 3 €" },
                { value: "express", text: "Envio express 6 €" },
                { value: "shop", text: "Recogida en tienda 0 €" },
            ],
            selected: this.shippingMethod,
            onSelect: async (option) => {
                this.shippingMethod = option.value;
                this.repaint();
            },
        });
        form.appendChild(shippingMethod.getField());

        this.codeInput = new Input({
            label: {
                text: "Código promocional",
                for: "code",
            },
            input: {
                type: "text",
                name: "code",
                id: "code",
                autocomplete: "username",
                value: this.code,
                maxLength: 20,
            },
            manualErrorHandling: true,
            adornment: this.discount ? icons.get("check") : null,
            onInput: async (value) => {
                this.code = value;
                this.handlePromoCode();
            },
            onBlur: () => {
                if (!this.discount) {
                    this.codeInput.clear();
                    this.code = "";
                    this.repaint();
                }
            },
        });
        form.appendChild(this.codeInput.getField());

        const total = document.createElement("div");
        total.classList.add("total");
        total.textContent = "Total";
        detailsEl.appendChild(total);

        const totalSpan = document.createElement("span");
        totalSpan.textContent = tools.formatCurrency(this.total);
        total.appendChild(totalSpan);

        this.orderBtn = new LoadingButton({
            type: "button",
            text: this.nextStepText,
            classes: ["btn", "primary-btn"],
            onClick: this.onClick,
        });
        detailsEl.appendChild(this.orderBtn.get());

        return detailsEl;
    }

    async handlePromoCode() {
        if (!this.code) {
            this.discount = 0;
            this.codeInput.blur();
            return;
        }

        const response = await api.post("/api/code/validate", { code: this.code });

        this.codeInput.removeError();
        this.codeInput.removeAdornment();

        if (response.status === "error") {
            this.discount = 0;
            this.codeInput.showError(response.errors.code);
            this.codeInput.showAdornment(icons.get("x"));
            return;
        }

        this.discount = response.discount;
        this.codeInput.showAdornment(icons.get("check"));
        this.repaint();
    }
}

export default Details;
