import Form from "./Form.js";

class Input extends Form {
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

        const input = this.createTextarea();
        wrapper.appendChild(input);

        if (this.message) {
            const message = this.createMessage();
            field.appendChild(message);
        }

        return field;
    }

    createTextarea() {
        const textarea = document.createElement("textarea");
        textarea.classList.add("mio-input");
        textarea.name = this.input.name;
        textarea.id = this.input.id;
        textarea.rows = this.input.rows ?? "";
        textarea.value = this.input.value;
        if (this.input.maxlength) {
            textarea.maxLength = this.input.maxlength;
        }

        textarea.addEventListener("focus", this.handleFocus.bind(this));
        textarea.addEventListener("blur", this.handleBlur.bind(this));
        textarea.addEventListener("input", this.handleInput.bind(this));

        return textarea;
    }
}

export default Input;
