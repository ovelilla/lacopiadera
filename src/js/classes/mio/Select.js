import Form from "./Form";
import IconButton from "./IconButton";
import { icons } from "../../modules/Icons";

class Select extends Form {
    constructor(data) {
        super(data);

        Object.assign(this, data);

        this.activeOptions = false;

        this.findText = "";
        this.timeout = null;

        this.activeIndex = 0;
        this.selectedIndex = 0;

        this.init();
    }

    init() {
        window.addEventListener("resize", this.handleResize.bind(this));
        window.addEventListener("scroll", this.handleResize.bind(this));

        this.create();
    }

    handleResize() {
        if (this.customOptions) {
            this.position();
        }
    }

    create() {
        this.field = this.createField();

        const wrapper = this.createWrapper();
        this.field.appendChild(wrapper);

        this.customSelect = this.createCustomSelect();
        wrapper.appendChild(this.customSelect);

        this.labelEl = this.createLabel();
        wrapper.appendChild(this.labelEl);

        this.selectEl = this.createSelect();
        wrapper.appendChild(this.selectEl);

        this.optionsEl = this.createOptions();
        this.selectEl.appendChild(this.optionsEl);

        if (this.message) {
            const message = this.createMessage();
            this.field.appendChild(message);
        }
    }

    createField() {
        const field = document.createElement("div");
        field.classList.add("mio-field");
        if (this.selected) {
            field.classList.add("active");
        }
        if (this.error) {
            field.classList.add("error");
        }

        return field;
    }

    createCustomSelect() {
        const select = document.createElement("div");
        select.classList.add("mio-input");
        select.addEventListener("click", this.open.bind(this));

        const span = document.createElement("span");
        span.textContent = "\u200b";
        select.appendChild(span);

        const adornment = this.createAdornment();
        select.appendChild(adornment);

        return select;
    }

    createAdornment() {
        const icon = document.createElement("div");
        icon.classList.add("mio-adornment");

        const iconButton = new IconButton({
            type: "button",
            ariaLabel: "Button icon",
            buttonSize: "medium",
            svgSize: "xs",
            icon: icons.get("caretDownFill"),
            onClick: this.open.bind(this),
        });

        icon.appendChild(iconButton.get());

        return icon;
    }

    createLabel() {
        const label = document.createElement("label");
        label.classList.add("mio-label");
        label.textContent = this.label.text;
        label.htmlFor = this.label.for;
        label.addEventListener("click", this.open.bind(this));
        return label;
    }

    createSelect() {
        const select = document.createElement("select");
        select.name = this.select.name;
        select.id = this.select.id;
        select.addEventListener("focus", this.focusSelect.bind(this));
        select.addEventListener("keydown", this.handleKeydown.bind(this));
        select.addEventListener("change", this.handleInput.bind(this));
        return select;
    }

    createOptions() {
        const fragment = document.createDocumentFragment();

        const optionEl = new Option();
        fragment.appendChild(optionEl);

        this.options.forEach((option, index) => {
            const optionEl = new Option(option[this.option.text], option[this.option.value]);

            if (
                this.selected &&
                this.selected.toString() === option[this.option.value].toString()
            ) {
                optionEl.selected = true;
                this.field.classList.add("active");
                this.selectOption(option, index);
            }

            fragment.appendChild(optionEl);
        });

        return fragment;
    }

    focusSelect() {
        this.selectEl.focus();
        this.field.classList.add("active");
        this.field.classList.add("focus");
    }

    blurSelect() {
        this.selectEl.blur();
        if (!this.selectedOption) {
            this.field.classList.remove("active");
        }
        this.field.classList.remove("focus");
    }

    handleKeydown(e) {
        switch (e.key) {
            case "Escape":
                this.blurSelect();
                this.closeCustomOptions();
                break;
            case "Tab":
                this.blurSelect();
                this.closeCustomOptions();
                break;
            case "ArrowDown":
                if (this.activeOptions) {
                    this.blurOption();
                    this.activeIndex = (this.activeIndex + 1) % this.optionsNodes.childNodes.length;
                    this.focusOption();
                } else {
                    this.open();
                }
                break;
            case "ArrowUp":
                if (this.activeOptions) {
                    this.blurOption();
                    this.activeIndex =
                        (this.optionsNodes.childNodes.length + (this.activeIndex - 1)) %
                        this.optionsNodes.childNodes.length;
                    this.focusOption();
                }
                break;
            case "Enter":
                if (this.activeOptions) {
                    this.selectOption(this.options[this.activeIndex], this.activeIndex);
                    this.onSelect(this.options[this.activeIndex]);
                    this.removeMessage();
                    this.closeCustomOptions();
                } else {
                    this.open();
                }
                break;
            default:
                this.findOption(e.key);
                break;
        }
    }

    async open() {
        this.activeOptions = true;
        this.focusSelect();
        this.customOptions = this.createCustomOptions();
        document.body.appendChild(this.customOptions);
        this.position();
        this.focusOption();
    }

    async closeCustomOptions() {
        this.activeOptions = false;
        this.activeIndex = this.selectedIndex;

        this.blurSelect();

        if (this.customOptions) {
            this.customOptions.remove();
        }
    }

    createCustomOptions() {
        const options = document.createElement("div");
        options.classList.add("mio-options");
        options.addEventListener("click", this.closeCustomOptions.bind(this));

        const content = document.createElement("div");
        content.classList.add("content");
        content.addEventListener("click", (e) => e.stopPropagation());
        options.appendChild(content);

        this.optionsNodes = content;

        this.options.forEach((option, index) => {
            const optionEl = document.createElement("div");
            optionEl.classList.add("option");

            if (option === this.selectedOption) optionEl.classList.add("selected");
            if (index === this.activeIndex) optionEl.classList.add("focus");

            optionEl.addEventListener("click", () => {
                this.selectOption(option, index);
                this.onSelect(option);
                this.removeMessage();
                this.closeCustomOptions();
            });

            content.appendChild(optionEl);

            const span = document.createElement("span");
            span.textContent = option[this.option.text];
            optionEl.appendChild(span);
        });

        return options;
    }

    position() {
        const rect = this.field.getBoundingClientRect();

        this.customOptions.firstChild.style.maxHeight = `${210}px`;

        if (
            rect.top + this.customOptions.firstChild.offsetHeight + this.field.offsetHeight + 2 >
            window.innerHeight
        ) {
            this.customOptions.firstChild.style.top = `${
                rect.top - this.customOptions.firstChild.offsetHeight - 2
            }px`;
        } else {
            this.customOptions.firstChild.style.top = `${rect.top + this.field.offsetHeight + 2}px`;
        }

        this.customOptions.firstChild.style.left = `${rect.left}px`;
        this.customOptions.firstChild.style.width = `${this.field.offsetWidth}px`;
    }

    focusOption() {
        this.optionsNodes.childNodes[this.activeIndex].scrollIntoView(false);
        this.optionsNodes.childNodes[this.activeIndex].classList.add("focus");
    }

    blurOption() {
        this.optionsNodes.childNodes[this.activeIndex].classList.remove("focus");
    }

    selectOption(option, index) {
        this.selectedOption = option;

        this.activeIndex = index;
        this.selectedIndex = index;

        this.selectEl.value = option[this.option.value];
        this.customSelect.firstElementChild.textContent = option[this.option.text];
    }

    findOption(key) {
        this.findText += key;

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => (this.findText = ""), 500);

        this.options.forEach((option, index) => {
            const text = option[this.option.text].toLowerCase();
            const find = this.findText.toLowerCase();

            if (text.includes(find)) {
                this.selectEl.options[index].selected = true;

                this.blurOption();
                this.selectOption(option, index);
                this.onSelect(option);
                this.removeMessage();
                this.focusOption();

                return;
            }
        });
    }

    async animationend(target) {
        return new Promise((resolve) => {
            target.addEventListener("animationend", resolve, { once: true });
        });
    }
}

export default Select;
