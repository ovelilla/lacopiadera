import Form from "./Form.js";

class Input extends Form {
    constructor(data) {
        super(data);

        Object.assign(this, data);

        this.create();
    }

    create() {
        this.field = this.createField();

        this.wrapper = this.createWrapper();
        this.field.appendChild(this.wrapper);

        this.label = this.createLabel();
        this.wrapper.appendChild(this.label);

        this.input = this.createInput();
        this.wrapper.appendChild(this.input);

        if (this.message && !this.manualErrorHandling) {
            this.field.appendChild(this.createMessage());
        }

        if (this.adornment) {
            this.wrapper.appendChild(this.createAdornment());
        }

        return this.field;
    }

    createInput() {
        const input = document.createElement("input");
        input.classList.add("mio-input");

        input.type = this.input.type;
        input.name = this.input.name;
        input.id = this.input.id;
        input.value = this.input.value;
        if (this.input.autocomplete) {
            input.autocomplete = this.input.autocomplete;
        }
        if (this.input.placeholder) {
            input.placeholder = this.input.placeholder;
        }
        if (this.input.readOnly) {
            input.readOnly = true;
        }
        if (this.input.maxLength) {
            input.maxLength = this.input.maxLength;
        }

        input.focus();

        input.addEventListener("focus", this.handleFocus.bind(this));
        input.addEventListener("blur", this.handleBlur.bind(this));
        input.addEventListener("input", this.handleInput.bind(this));

        input.addEventListener("change", () => {
            console.log("change");
        })

        return input;
    }
}

export default Input;
