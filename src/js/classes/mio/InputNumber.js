import Form from "./Form";
import IconButton from "./IconButton";
import { icons } from "../../modules/Icons";

class InputNumber extends Form {
    constructor(data) {
        super(data);

        Object.assign(this, data);

        this.init();
    }

    init() {
        this.field = this.create();
    }

    create() {
        const field = this.createField();

        const wrapper = this.createWrapper();
        field.appendChild(wrapper);

        const label = this.createLabel();
        wrapper.appendChild(label);

        this.inputEl = this.createInput();
        wrapper.appendChild(this.inputEl);

        if (this.message) {
            const message = this.createMessage();
            field.appendChild(message);
        }

        const incDec = this.createIncDec();
        wrapper.appendChild(incDec);

        return field;
    }

    createInput() {
        const input = document.createElement("input");
        input.classList.add("mio-input");

        input.type = "number";
        input.name = this.input.name;
        input.id = this.input.id;
        input.value = this.input.value;
        if (this.input.min) {
            input.min = this.min;
        }
        if (this.input.max) {
            input.max = this.max;
        }
        if (this.input.step) {
            input.step = this.step;
        }
        if (this.input.placeholder) {
            input.placeholder = this.input.placeholder;
        }

        this.previousValue = input.value;

        input.addEventListener("focus", this.handleFocus.bind(this));
        input.addEventListener("blur", this.handleBlur.bind(this));
        input.addEventListener("input", this.handleInput.bind(this));
        input.addEventListener("keypress", this.handleKeypress.bind(this));

        return input;
    }

    createIncDec() {
        const incDec = document.createElement("div");
        incDec.classList.add("mio-inc-dec");

        const increase = new IconButton({
            icon: icons.get("plus"),
            buttonSize: "medium",
            svgSize: "large",
            ariaLabel: "Incrementar",
            onClick: () => {
                const value = parseInt(this.inputEl.value);
                const step = this.input.step;
                const max = this.input.max;

                if (max && value + step > max) {
                    return;
                }
                this.inputEl.value = value + step;
                this.previousValue = this.inputEl.value;

                this.removeMessage();

                if (this.onClick) {
                    this.onClick(parseInt(this.inputEl.value));
                }
            },
        });
        incDec.appendChild(increase.get());

        const decrease = new IconButton({
            icon: icons.get("dash"),
            buttonSize: "medium",
            svgSize: "large",
            ariaLabel: "Decrementar",
            onClick: () => {
                const value = parseInt(this.inputEl.value);
                const step = this.input.step;
                const min = this.input.min;

                if (min && value - step < min) {
                    return;
                }

                this.inputEl.value = value - step;
                this.previousValue = this.inputEl.value;

                this.removeMessage();

                if (this.onClick) {
                    this.onClick(parseInt(this.inputEl.value));
                }
            },
        });
        incDec.appendChild(decrease.get());

        return incDec;
    }

    handleInput(e) {
        const value = parseInt(e.target.value);
        const min = this.input.min;
        const max = this.input.max;

        if (!value) {
            return;
        }

        this.removeMessage();

        if (value < min) {
            e.target.value = min;
        } else if (value > max) {
            e.target.value = max;
        }

        this.previousValue = value;
        e.target.value = value;

        if (this.onInput) {
            this.onInput(value);
        }
    }

    handleKeypress(e) {
        const charCode = e.which ? e.which : e.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            e.preventDefault();
        }
    }

    handleBlur(e) {
        const value = parseInt(e.target.value);

        if (!value) {
            e.target.value = this.previousValue;
        }

        this.field.classList.remove("focus");

        if (this.onBlur) {
            this.onBlur(value);
        }
    }

    createMessage() {
        if (!this.message) {
            return;
        }

        this.messageEl = document.createElement("div");
        this.messageEl.classList.add("mio-message");
        if (this.error) {
            this.messageEl.classList.add("mio-error");
        }
        this.messageEl.textContent = this.message;

        return this.messageEl;
    }

    removeMessage() {
        if (!this.messageEl) {
            return;
        }
        this.messageEl.remove();
        if (this.error) {
            this.field.classList.remove("error");
            this.messageEl.classList.remove("mio-error");
        }
    }
}

export default InputNumber;
