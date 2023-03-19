import { icons } from "../modules/Icons";

class Steps {
    constructor({ index, disabled, onClick }) {
        this.index = index;
        this.disabled = disabled;
        this.onClick = onClick;
    }

    init() {
        this.show();
    }

    show() {
        const stepsContainer = document.querySelector("#steps");

        this.stepsEl = this.create();
        stepsContainer.appendChild(this.stepsEl);
    }

    getIndex() {
        return this.index;
    }

    setIndex(index) {
        this.index = index;
    }

    next() {
        this.index++;
    }

    create() {
        const stepsEl = document.createElement("div");
        stepsEl.classList.add("steps");

        const steps = [
            {
                title: "Resumen",
                message: "Resumen del pedido",
                icon: icons.get("basket"),
            },
            {
                title: "Envio",
                message: "Datos de envío",
                onClick: this.onClick,
                icon: icons.get("truck"),
            },
            {
                title: "Upload",
                message: "Subir impresiones",
                icon: icons.get("cloudUpload"),
            },
            {
                title: "Pago",
                message: "Realiza el pago",
                icon: icons.get("creditCard"),
            },
        ];

        steps.forEach((step, index) => {
            const stepBtn = document.createElement("button");
            stepBtn.type = "button";
            stepBtn.classList.add("step");
            if (index < this.index) {
                stepBtn.classList.add("done");
            }
            if (index === this.index) {
                stepBtn.classList.add("active");
            }
            stepBtn.addEventListener("click", () => {
                if (this.disabled) {
                    return;
                }
                this.onClick(index);
            });
            stepsEl.appendChild(stepBtn);

            const iconEl = document.createElement("div");
            iconEl.classList.add("icon");
            stepBtn.appendChild(iconEl);

            iconEl.appendChild(step.icon);

            const infoEl = document.createElement("div");
            infoEl.classList.add("info");
            stepBtn.appendChild(infoEl);

            const titleEl = document.createElement("div");
            titleEl.classList.add("title");
            titleEl.textContent = step.title;
            infoEl.appendChild(titleEl);

            const messageEl = document.createElement("div");
            messageEl.classList.add("message");
            messageEl.textContent = step.message;
            infoEl.appendChild(messageEl);
        });

        return stepsEl;
    }

    repaint() {
        this.remove();
        this.show();
    }

    remove() {
        this.stepsEl.remove();
    }
}

export default Steps;
