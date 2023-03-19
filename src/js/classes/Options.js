import Select from "./mio/Select";
import InputNumber from "./mio/InputNumber";
import Switch from "./mio/Switch";
import Collapse from "./Collapse";
import LoadingButton from "./LoadingButton";
import { icons } from "../modules/Icons";
import { indexedDB } from "../modules/IndexedDB";

class Options {
    constructor({ options, onChange, onCreate, onUpdate, onCancel } = {}) {
        this.values = {
            color: "black",
            copies: 1,
            doubleSided: false,
            orientation: "automatic",
            customPages: "all",
            from: 1,
            to: 1,
            size: "a4",
            pagesPerSheet: 1,
            binding: "none",
        };

        this.isUpdate = false;
        this.isOpen = false;
        this.isAnimated = false;
        this.isMoreOptionsCollapsed = true;
        this.isCustomPagesEnabled = true;

        this.maxCustomPagesTo = null;

        this.onChange = onChange ?? null;
        this.onCreate = onCreate ?? null;
        this.onUpdate = onUpdate ?? null;
        this.onCancel = onCancel ?? null;

        if (options) {
            this.set(options);
        }
    }

    init() {
        const openBtn = document.querySelector("#open-options-btn");
        const closeBtn = document.querySelector("#close-options-btn");
        const sidebar = document.querySelector("#options-sidebar");

        window.addEventListener("resize", this.handleResize.bind(this));
        openBtn.addEventListener("click", this.handleOpen.bind(this));
        closeBtn.addEventListener("click", this.handleClose.bind(this));
        sidebar.addEventListener("click", this.handleClose.bind(this));

        this.create();
    }

    set(options) {
        this.values = options.values;

        this.isUpdate = options.isUpdate;
        this.isOpened = options.isOpened;
        this.isAnimated = options.isAnimated;
        this.isMoreOptionsCollapsed = options.isMoreOptionsCollapsed;
        this.isCustomPagesEnabled = options.isCustomPagesEnabled;

        this.maxCustomPagesTo = options.maxCustomPagesTo;
    }

    getValues() {
        return this.values;
    }

    setValues(values) {
        this.values = values;
    }

    setCustomPages(customPages) {
        this.values.customPages = customPages;
    }

    setFrom(from) {
        this.values.from = from;
    }

    setTo(to) {
        this.values.to = to;
    }

    getUpdate() {
        return this.isUpdate;
    }

    setUpdate(isUpdate) {
        this.isUpdate = isUpdate;
    }

    setCustumPagesEnabled(isCustomPagesEnabled) {
        this.isCustomPagesEnabled = isCustomPagesEnabled;
    }

    setMaxCustomPagesTo(maxCustomPagesTo) {
        this.maxCustomPagesTo = maxCustomPagesTo;
    }

    async reset() {
        this.values = {
            color: "black",
            copies: 1,
            doubleSided: false,
            orientation: "automatic",
            customPages: "all",
            from: 1,
            to: 1,
            size: "a4",
            pagesPerSheet: 1,
            binding: "none",
        };

        this.isUpdate = false;
        this.isOpened = false;
        this.isAnimated = false;
        this.isMoreOptionsCollapsed = true;
        this.isCustomPagesEnabled = true;

        this.maxCustomPagesTo = null;

        await indexedDB.clearRecords("options");
    }

    repaint() {
        this.form.remove();
        this.create();
    }

    create() {
        const options = document.querySelector("#options");

        this.form = document.createElement("form");
        this.form.classList.add("mio-form");
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
        });
        options.appendChild(this.form);
    
        const color = new Select({
            label: {
                text: "Color",
                for: "color",
            },
            select: {
                name: "color",
                id: "color",
            },
            option: {
                value: "value",
                text: "text",
            },
            options: [
                { value: "black", text: "Blanco y negro" },
                { value: "color", text: "Color" },
            ],
            selected: this.values.color,
            onSelect: async (option) => {
                this.values.color = option.value;
                this.save();
                this.onChange();
            },
        });
        this.form.appendChild(color.getField());

        const copies = new InputNumber({
            label: {
                text: "Copias",
                for: "copies",
            },
            input: {
                type: "number",
                name: "copies",
                id: "copies",
                step: 1,
                min: 1,
                value: this.values.copies,
            },
            onInput: async (value) => {
                this.values.copies = value;
                await this.save();
                this.onChange();
            },
            onClick: async (value) => {
                this.values.copies = value;
                await this.save();
                this.onChange();
            },
        });
        this.form.appendChild(copies.getField());

        const doubleSided = new Switch({
            label: {
                text: "Imprimir a doble cara",
                for: "doubleSided",
            },
            input: {
                name: "doubleSided",
                id: "doubleSided",
                value: this.values.doubleSided,
            },
            size: "medium",
            callback: async (value) => {
                this.values.doubleSided = value;
                await this.save();
                this.onChange();
            },
        });
        this.form.appendChild(doubleSided.getField());

        const moreOptionsBtn = document.createElement("button");
        moreOptionsBtn.classList.add("more-options-btn");
        moreOptionsBtn.ariaLabel = "Más opciones";
        moreOptionsBtn.type = "button";
        moreOptionsBtn.addEventListener("click", async () => {
            this.isMoreOptionsCollapsed = !this.isMoreOptionsCollapsed;
            await this.save();
        });
        this.form.appendChild(moreOptionsBtn);

        const moreOptionsSpan = document.createElement("span");
        moreOptionsSpan.textContent = "Más opciones";
        moreOptionsBtn.appendChild(moreOptionsSpan);

        const moreOptionsIcon = icons.get("chevronRight");
        moreOptionsBtn.appendChild(moreOptionsIcon);

        const moreOptions = document.createElement("div");
        moreOptions.classList.add("more-options");
        this.form.appendChild(moreOptions);

        const moreOptionsWrapper = document.createElement("div");
        moreOptionsWrapper.classList.add("wrapper");
        moreOptions.appendChild(moreOptionsWrapper);

        const orientation = new Select({
            label: {
                text: "Orientación",
                for: "orientation",
            },
            select: {
                name: "orientation",
                id: "orientation",
            },
            option: {
                value: "value",
                text: "text",
            },
            options: [
                { value: "automatic", text: "Automática" },
                { value: "vertical", text: "Vertical" },
                { value: "horizontal", text: "Horizontal" },
            ],
            selected: this.values.orientation,
            onSelect: async (option) => {
                this.values.orientation = option.value;
                await this.save();
                this.onChange();
            },
        });
        moreOptionsWrapper.appendChild(orientation.getField());

        if (this.isCustomPagesEnabled) {
            const customPages = new Select({
                label: {
                    text: "Páginas",
                    for: "customPages",
                },
                select: {
                    name: "customPages",
                    id: "customPages",
                },
                option: {
                    value: "value",
                    text: "text",
                },
                options: [
                    { value: "all", text: "Todas" },
                    { value: "range", text: "Personalizado" },
                ],
                selected: this.values.customPages,
                onSelect: async (option) => {
                    if (option.value === this.values.customPages) {
                        return;
                    }

                    this.values.customPages = option.value;

                    await this.save();
                    this.repaint();
                    this.onChange();
                },
            });
            moreOptionsWrapper.appendChild(customPages.getField());
        }

        if (this.isCustomPagesEnabled && this.values.customPages === "range") {
            const doubleField = document.createElement("div");
            doubleField.classList.add("mio-double");
            moreOptionsWrapper.appendChild(doubleField);

            const from = new InputNumber({
                label: {
                    text: "Desde",
                    for: "from",
                },
                input: {
                    type: "number",
                    name: "from",
                    id: "from",
                    step: 1,
                    min: 1,
                    value: this.values.from,
                },
                onInput: async (value) => {
                    this.values.from = value;
                    await this.save();
                    this.onChange();
                },
                onClick: async (value) => {
                    if (value > this.values.to) {
                        this.repaint();
                        return;
                    }
                    this.values.from = value;
                    await this.save();
                    this.onChange();
                },
                onBlur: async (value) => {
                    if (value > this.values.to) {
                        this.values.from = this.values.to;
                        await this.save();
                        this.repaint();
                        this.onChange();
                    }
                },
            });
            doubleField.appendChild(from.getField());

            const to = new InputNumber({
                label: {
                    text: "Hasta",
                    for: "to",
                },
                input: {
                    type: "number",
                    name: "to",
                    id: "to",
                    step: 1,
                    min: 1,
                    max: this.maxCustomPagesTo,
                    value: this.values.to,
                },
                onInput: async (value) => {
                    this.values.to = value;
                    await this.save();
                    this.onChange();
                },
                onClick: async (value) => {
                    this.values.to = value;
                    if (value < this.values.from) {
                        this.values.to = this.values.from;
                        this.repaint();
                    }
                    await this.save();
                    this.onChange();
                },
                onBlur: async (value) => {
                    if (value < this.values.from) {
                        this.values.to = this.values.from;
                        await this.save();
                        this.repaint();
                        this.onChange();
                    }

                    if (value > this.maxCustomPagesTo) {
                        this.values.to = this.maxCustomPagesTo;
                        await this.save();
                        this.repaint();
                        this.onChange();
                    }
                },
            });
            doubleField.appendChild(to.getField());
        }

        const size = new Select({
            label: {
                text: "Tamaño del papel",
                for: "size",
            },
            select: {
                name: "size",
                id: "size",
            },
            option: {
                value: "value",
                text: "text",
            },
            options: [{ value: "a4", text: "A4 (210 x 297 mm)" }],
            selected: this.values.size,
            onSelect: async (option) => {
                this.values.size = option.value;
                await this.save();
                this.onChange();
            },
        });
        moreOptionsWrapper.appendChild(size.getField());

        const pagesPerSheet = new Select({
            label: {
                text: "Páginas por hoja",
                for: "pagesPerSheet",
            },
            select: {
                name: "pagesPerSheet",
                id: "pagesPerSheet",
            },
            option: {
                value: "value",
                text: "text",
            },
            options: [
                { value: 1, text: "Normal" },
                { value: 2, text: "2 páginas" },
                { value: 4, text: "4 páginas" },
            ],
            selected: this.values.pagesPerSheet,
            onSelect: async (option) => {
                this.values.pagesPerSheet = option.value;
                await this.save();
                this.onChange();
            },
        });
        moreOptionsWrapper.appendChild(pagesPerSheet.getField());

        const binding = new Select({
            label: {
                text: "Encuadernación",
                for: "binding",
            },
            select: {
                name: "binding",
                id: "binding",
            },
            option: {
                value: "value",
                text: "text",
            },
            options: [
                { value: "none", text: "Sin encuadernar" },
                { value: "bound", text: "Encuadernado" },
                { value: "stapled", text: "Grapado" },
                { value: "punch-double", text: "Perforado doble" },
                { value: "punch-quadruple", text: "Perforado cuadruple" },
                { value: "laminated", text: "Plastificado" },
            ],
            selected: this.values.binding,
            onSelect: async (option) => {
                this.values.binding = option.value;
                await this.save();
                this.onChange();
            },
        });
        moreOptionsWrapper.appendChild(binding.getField());

        const submitField = document.createElement("div");
        submitField.classList.add("submit-field");
        this.form.appendChild(submitField);

        if (this.isUpdate) {
            const cancelBtn = document.createElement("button");
            cancelBtn.classList.add("btn", "secondary-btn");
            cancelBtn.textContent = "Cancelar";
            cancelBtn.addEventListener("click", this.onCancel);
            submitField.appendChild(cancelBtn);

            this.updateBtn = new LoadingButton({
                type: "button",
                text: "Actualizar",
                classes: ["btn", "primary-btn", "pulse"],
                onClick: this.onUpdate,
            });
            submitField.appendChild(this.updateBtn.get());
        } else {
            this.createBtn = new LoadingButton({
                type: "button",
                text: "Añadir al carrito",
                classes: ["btn", "primary-btn", "pulse"],
                onClick: this.onCreate,
            });
            submitField.appendChild(this.createBtn.get());
        }

        new Collapse({
            target: moreOptionsBtn,
            container: moreOptions,
            collapsed: this.isMoreOptionsCollapsed,
        });
    }

    async save() {
        const { onChange, onCreate, onUpdate, onCancel, form, createBtn, updateBtn, ...options } =
            this;

        if (this.id) {
            await indexedDB.updateRecord(options, "options");
            return;
        }

        await indexedDB.clearRecords("options");
        const insertedId = await indexedDB.addRecord(options, "options");
        this.id = insertedId;
    }

    async handleResize() {
        const sidebar = document.querySelector("#options-sidebar");

        if (window.innerWidth >= 768 && this.isOpen) {
            this.isOpen = false;

            sidebar.classList.remove("active", "in", "out");
        }
    }

    async handleOpen() {
        const sidebar = document.querySelector("#options-sidebar");

        if (!this.isOpen && !this.isAnimated) {
            this.isOpen = true;
            this.isAnimated = true;

            sidebar.classList.add("active", "in");
            await this.animationend(sidebar);

            this.isAnimated = false;
        }
    }

    async handleClose(e) {
        const closeBtn = document.querySelector("#close-options-btn");
        const sidebar = document.querySelector("#options-sidebar");

        if (
            (e.target === sidebar || e.currentTarget === closeBtn) &&
            this.isOpen &&
            !this.isAnimated
        ) {
            this.isAnimated = true;

            await this.close();

            this.isAnimated = false;
        }
    }

    async close() {
        const sidebar = document.querySelector("#options-sidebar");

        if (!this.isOpen) {
            return;
        }

        this.isOpen = false;

        if (innerWidth < 768) {
            sidebar.classList.add("out");
            await this.animationend(sidebar);
            sidebar.classList.remove("active", "in", "out");
        }
    }

    animationend(target) {
        return new Promise((resolve) => {
            target.addEventListener("animationend", resolve, { once: true });
        });
    }
}

export default Options;
