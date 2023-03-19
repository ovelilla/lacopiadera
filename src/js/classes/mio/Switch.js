import Form from "./Form.js";

class Switch extends Form {
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

        this.switch = this.createSwitch();
        wrapper.appendChild(this.switch);

        const label = this.createLabel();
        wrapper.appendChild(label);

        if (this.message) {
            const message = this.createMessage();
            field.appendChild(message);
        }

        return field;
    }

    createSwitch() {
        const input = document.createElement("input");
        input.classList.add("mio-switch-input");

        input.type = "checkbox";
        input.name = this.input.name;
        input.id = this.input.id;

        if (this.input.value) {
            input.checked = true;
        }

        input.addEventListener("change", () => {
            this.removeMessage();

            this.callback(input.checked);
        });

        return input;
    }

    createLabel() {
        const label = document.createElement("label");
        label.classList.add("mio-switch-label", this.size);
        label.textContent = this.label.text;
        label.htmlFor = this.label.for;

        label.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            this.switch.checked = !this.switch.checked;
            await this.transitionend(label);
            this.switch.dispatchEvent(new Event("change"));
        });

        return label;
    }

    async transitionend(target) {
        return new Promise((resolve) => {
            target.addEventListener("transitionend", resolve, { once: true });
        });
    }
}

export default Switch;
