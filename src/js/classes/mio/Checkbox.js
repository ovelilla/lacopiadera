import Form from "./Form.js";
import IconButton from "./IconButton.js";
import { icons } from "../../modules/Icons.js";

class Checkbox extends Form {
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

        this.checkbox = this.createCheckbox();
        wrapper.appendChild(this.checkbox);

        const label = this.createLabel();
        wrapper.appendChild(label);

        if (this.message) {
            const message = this.createMessage();
            field.appendChild(message);
        }

        return field;
    }

    createCheckbox() {
        const input = document.createElement("input");
        input.classList.add("mio-checkbox-input");

        input.type = "checkbox";
        input.name = this.input.name;
        input.id = this.input.id;

        if (this.input.value) {
            input.checked = true;
        }

        return input;
    }

    createLabel() {
        const label = document.createElement("label");
        label.classList.add("mio-checkbox-label");
        label.htmlFor = this.label.for;
        label.addEventListener("click", () => {
            this.checkbox.checked = !this.checkbox.checked;
            this.removeMessage();
            this.onClick(this.checkbox.checked);
        });

        const checkIcon = new IconButton({
            ariaLabel: "Recuérdame",
            buttonSize: "large",
            svgSize: "large",
            icon: icons.get(`${this.checkbox.checked ? "checkSquareFill" : "square"}`),
            onClick: () => {
                this.checkbox.checked = !this.checkbox.checked;
                this.removeMessage();
                this.onClick(this.checkbox.checked);
            },
        });
        label.appendChild(checkIcon.get());

        if (this.label.text) {
            const text = document.createElement("span");
            text.classList.add("mio-checkbox-text");
            text.innerText = this.label.text;
            label.appendChild(text);
        }

        return label;
    }
}

export default Checkbox;
