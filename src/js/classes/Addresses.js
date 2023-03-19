import Input from "./mio/Input";
import Select from "./mio/Select";
import Switch from "./mio/Switch.js";
import Popup from "./Popup";
import Confirm from "./Confirm";
import Modal from "./Modal";
import Tooltip from "./Tooltip";
import IconButton from "./mio/IconButton";
import { icons } from "../modules/Icons";
import { api } from "../modules/Api";

class Addresses {
    constructor() {
        this.values = {
            name: "",
            lastname: "",
            phone: "",
            nif: "",
            address: "",
            postcode: "",
            location: "",
            province: "",
            country: "",
            type: "",
            predetermined: false,
        };

        this.errors = {
            name: "",
            lastname: "",
            phone: "",
            nif: "",
            address: "",
            postcode: "",
            location: "",
            province: "",
            country: "",
        };

        this.addresses = [];

        this.shippingAddresses = [];
        this.billingAddresses = [];

        this.selectedShippingAddress = null;
        this.selectedBillingAddress = null;

        this.modal = null;
        this.addressesEl = null;
    }

    async init() {
        await this.readAddresses();
    }

    getSelectedShippingAddress() {
        return this.selectedShippingAddress;
    }

    getSelectedBillingAddress() {
        return this.selectedBillingAddress;
    }

    hasSelectedAddresses() {
        return this.selectedShippingAddress && this.selectedBillingAddress;
    }

    setAddresses(addresses) {
        this.addresses = addresses;

        this.shippingAddresses = this.addresses.filter((address) => address.type === "shipping");
        this.billingAddresses = this.addresses.filter((address) => address.type === "billing");

        if (!this.selectedShippingAddress) {
            this.selectedShippingAddress = this.shippingAddresses.find(
                (address) => address.predetermined
            );
        } else {
            const existsShippingAddress = this.shippingAddresses.find(
                (address) => address.id === this.selectedShippingAddress.id
            );

            if (!existsShippingAddress) {
                this.selectedShippingAddress = this.shippingAddresses.find(
                    (address) => address.predetermined
                );
            } else {
                this.selectedShippingAddress = existsShippingAddress;
            }
        }

        if (!this.selectedBillingAddress) {
            this.selectedBillingAddress = this.billingAddresses.find(
                (address) => address.predetermined
            );
        } else {
            const existsBillingAddress = this.billingAddresses.find(
                (address) => address.id === this.selectedBillingAddress.id
            );

            if (!existsBillingAddress) {
                this.selectedBillingAddress = this.billingAddresses.find(
                    (address) => address.predetermined
                );
            } else {
                this.selectedBillingAddress = existsBillingAddress;
            }
        }
    }

    async readAddresses() {
        const response = await api.get("/api/user/address");

        if (response.status === "error") {
            return;
        }

        this.addresses = response.addresses;
        this.shippingAddresses = this.addresses.filter((address) => address.type === "shipping");
        this.billingAddresses = this.addresses.filter((address) => address.type === "billing");
        if (!this.selectedShippingAddress) {
            this.selectedShippingAddress = this.shippingAddresses.find(
                (address) => address.predetermined
            );
        }
        if (!this.selectedBillingAddress) {
            this.selectedBillingAddress = this.billingAddresses.find(
                (address) => address.predetermined
            );
        }
    }

    showAddresses() {
        const addressesContainer = document.querySelector("#addresses");

        this.addressesEl = document.createElement("div");
        this.addressesEl.classList.add("addresses");
        addressesContainer.appendChild(this.addressesEl);

        const colShipping = document.createElement("div");
        colShipping.classList.add("col");
        this.addressesEl.appendChild(colShipping);

        const headerShipping = document.createElement("div");
        headerShipping.classList.add("header");
        headerShipping.textContent = "Direcciones de envío";
        colShipping.appendChild(headerShipping);

        const bodyShipping = document.createElement("div");
        bodyShipping.classList.add("body");
        colShipping.appendChild(bodyShipping);

        this.shippingAddresses.forEach((address) => {
            const addressEl = this.createAddress(address);
            bodyShipping.append(addressEl);
        });

        const footerShipping = document.createElement("div");
        footerShipping.classList.add("footer");
        colShipping.appendChild(footerShipping);

        const btnShipping = document.createElement("button");
        btnShipping.classList.add("btn", "secondary-btn");
        btnShipping.textContent = "Añadir otra dirección";
        btnShipping.addEventListener("click", () => {
            this.values.type = "shipping";
            this.modal = new Modal({
                title: "Crear dirección de envio",
                content: this.createAddressForm(true),
                action: "Crear",
                maxWidth: "700px",
                fullscreenButton: true,
                actionCallback: this.handleCreateAddress.bind(this),
                closeCallback: () => {
                    this.resetValues();
                    this.resetErrors();
                },
            });
        });
        footerShipping.appendChild(btnShipping);

        const colBilling = document.createElement("div");
        colBilling.classList.add("col");
        this.addressesEl.appendChild(colBilling);

        const headerBilling = document.createElement("div");
        headerBilling.classList.add("header");
        headerBilling.textContent = "Direcciones de facturación";
        colBilling.appendChild(headerBilling);

        const bodyBilling = document.createElement("div");
        bodyBilling.classList.add("body");
        colBilling.appendChild(bodyBilling);

        this.billingAddresses.forEach((address) => {
            const addressEl = this.createAddress(address);
            bodyBilling.append(addressEl);
        });

        const footerBilling = document.createElement("div");
        footerBilling.classList.add("footer");
        colBilling.appendChild(footerBilling);

        const btnBilling = document.createElement("button");
        btnBilling.classList.add("btn", "secondary-btn");
        btnBilling.textContent = "Añadir otra dirección";
        btnBilling.addEventListener("click", () => {
            this.values.type = "billing";
            this.modal = new Modal({
                title: "Crear dirección de facturación",
                content: this.createAddressForm(true),
                action: "Crear",
                maxWidth: "700px",
                fullscreenButton: true,
                actionCallback: this.handleCreateAddress.bind(this),
                closeCallback: () => {
                    this.resetValues();
                    this.resetErrors();
                },
            });
        });
        footerBilling.appendChild(btnBilling);
    }

    createAddress(data) {
        const label = document.createElement("label");
        label.htmlFor = data.id;
        label.classList.add("address", "radio");

        const input = document.createElement("input");
        input.type = "radio";
        input.name = data.id;
        input.id = data.id;

        if (data.type === "shipping") {
            input.checked = this.selectedShippingAddress.id === data.id;
        } else {
            input.checked = this.selectedBillingAddress.id === data.id;
        }

        if (input.checked) {
            label.classList.add("active");
        }

        input.addEventListener("change", async () => {
            if (data.type === "shipping") {
                this.selectedShippingAddress = data;
            } else {
                this.selectedBillingAddress = data;
            }
            this.repaint();
        });
        label.appendChild(input);

        const info = document.createElement("div");
        info.classList.add("info");
        label.appendChild(info);

        if (data.predetermined) {
            const predetermined = document.createElement("div");
            predetermined.classList.add("predetermined");
            predetermined.textContent = "Predeterminada";
            info.appendChild(predetermined);
        }

        const name = document.createElement("div");
        name.classList.add("name");
        name.textContent = `${data.name} ${data.lastname}`;
        info.appendChild(name);

        const fullAddress = document.createElement("div");
        fullAddress.classList.add("full-address");
        fullAddress.textContent = `${data.address}, ${data.postcode}, ${data.location}, ${data.province}, ${data.country}`;
        info.appendChild(fullAddress);

        const actions = document.createElement("div");
        actions.classList.add("actions");
        label.appendChild(actions);

        const update = new IconButton({
            icon: icons.get("pencilSquare"),
            buttonSize: "large",
            svgSize: "large",
            ariaLabel: "Editar dirección",
            onClick: () => {
                this.setValues(data);

                this.modal = new Modal({
                    title: "Actualizar dirección",
                    content: this.createAddressForm(true),
                    action: "Actualizar",
                    maxWidth: "700px",
                    fullscreenButton: true,
                    actionCallback: this.handleUpdateAddress.bind(this, data),
                    closeCallback: () => {
                        this.resetValues();
                        this.resetErrors();
                    },
                });
            },
        });
        actions.appendChild(update.get());

        new Tooltip({
            target: update.get(),
            message: "Editar dirección",
            position: "top",
        });

        const remove = new IconButton({
            icon: icons.get("trash"),
            buttonSize: "large",
            svgSize: "large",
            ariaLabel: "Eliminar dirección",
            onClick: this.handleDeleteAddress.bind(this, data),
        });
        actions.appendChild(remove.get());

        new Tooltip({
            target: remove.get(),
            message: "Eliminar dirección",
            position: "top",
        });

        return label;
    }

    showNewAddress() {
        const addressesContainer = document.querySelector("#addresses");

        this.addressesEl = document.createElement("div");
        this.addressesEl.classList.add("new-address");
        addressesContainer.appendChild(this.addressesEl);

        const addressesTitle = document.createElement("div");
        addressesTitle.classList.add("title");
        addressesTitle.textContent = "Direcciones de envío";
        this.addressesEl.appendChild(addressesTitle);

        const addressesInfo = document.createElement("div");
        addressesInfo.classList.add("info");
        addressesInfo.textContent =
            "No tienes ninguna direccion de envio regsitrada. Puedes crear una nueva a continuación.";
        this.addressesEl.appendChild(addressesInfo);

        const addAddressesBtn = document.createElement("button");
        addAddressesBtn.classList.add("btn", "primary-btn");
        addAddressesBtn.textContent = "Añadir dirección";
        addAddressesBtn.addEventListener("click", () => {
            this.modal = new Modal({
                title: "Crear dirección",
                content: this.createAddressForm(false),
                action: "Crear",
                maxWidth: "700px",
                fullscreenButton: true,
                actionCallback: this.handleCreateNewAddress.bind(this),
                closeCallback: () => {
                    this.resetValues();
                    this.resetErrors();
                },
            });
        });
        this.addressesEl.appendChild(addAddressesBtn);
    }

    createAddressForm(showPredetermined) {
        const form = document.createElement("form");
        form.classList.add("mio-form");
        form.noValidate = true;

        const double1 = document.createElement("div");
        double1.classList.add("mio-double");
        form.appendChild(double1);

        const name = new Input({
            label: {
                text: "Nombre",
                for: "name",
            },
            input: {
                type: "text",
                name: "name",
                id: "name",
                value: this.values.name,
            },
            error: this.errors.name.length > 0,
            message: this.errors.name,
            onInput: (value) => {
                this.values.name = value;
                this.errors.name = "";
            },
        });
        double1.appendChild(name.getField());

        const lastname = new Input({
            label: {
                text: "Apellidos",
                for: "lastname",
            },
            input: {
                type: "text",
                name: "lastname",
                id: "lastname",
                value: this.values.lastname,
            },
            error: this.errors.lastname.length > 0,
            message: this.errors.lastname,
            onInput: (value) => {
                this.values.lastname = value;
                this.errors.lastname = "";
            },
        });
        double1.appendChild(lastname.getField());

        const double2 = document.createElement("div");
        double2.classList.add("mio-double");
        form.appendChild(double2);

        const phone = new Input({
            label: {
                text: "Teléfono",
                for: "phone",
            },
            input: {
                type: "tel",
                name: "phone",
                id: "phone",
                value: this.values.phone,
            },
            error: this.errors.phone.length > 0,
            message: this.errors.phone,
            onInput: (value) => {
                this.values.phone = value;
                this.errors.phone = "";
            },
        });
        double2.appendChild(phone.getField());

        const nif = new Input({
            label: {
                text: "NIF",
                for: "nif",
            },
            input: {
                type: "text",
                name: "nif",
                id: "nif",
                value: this.values.nif,
            },
            error: this.errors.nif.length > 0,
            message: this.errors.nif,
            onInput: (value) => {
                this.values.nif = value;
                this.errors.nif = "";
            },
        });
        double2.appendChild(nif.getField());

        const address = new Input({
            label: {
                text: "Dirección",
                for: "address",
            },
            input: {
                type: "text",
                name: "address",
                id: "address",
                value: this.values.address,
            },
            error: this.errors.address.length > 0,
            message: this.errors.address,
            onInput: (value) => {
                this.values.address = value;
                this.errors.address = "";
            },
        });
        form.appendChild(address.getField());

        const double3 = document.createElement("div");
        double3.classList.add("mio-double");
        form.appendChild(double3);

        const postcode = new Input({
            label: {
                text: "Código postal",
                for: "postcode",
            },
            input: {
                type: "text",
                name: "postcode",
                id: "postcode",
                value: this.values.postcode,
            },
            error: this.errors.postcode.length > 0,
            message: this.errors.postcode,
            onInput: (value) => {
                this.values.postcode = value;
                this.errors.postcode = "";
            },
        });
        double3.appendChild(postcode.getField());

        const location = new Input({
            label: {
                text: "Localidad",
                for: "location",
            },
            input: {
                type: "text",
                name: "location",
                id: "location",
                value: this.values.location,
            },
            error: this.errors.location.length > 0,
            message: this.errors.location,
            onInput: (value) => {
                this.values.location = value;
                this.errors.location = "";
            },
        });
        double3.appendChild(location.getField());

        const double4 = document.createElement("div");
        double4.classList.add("mio-double");
        form.appendChild(double4);

        const province = new Select({
            label: {
                text: "Provincia",
                for: "province",
            },
            select: {
                name: "province",
                id: "province",
            },
            option: {
                value: "value",
                text: "text",
            },
            options: [
                { value: "Alava", text: "Alava" },
                { value: "Albacete", text: "Albacete" },
                { value: "Alicante", text: "Alicante" },
                { value: "Almería", text: "Almería" },
                { value: "Asturias", text: "Asturias" },
                { value: "Avila", text: "Avila" },
                { value: "Badajoz", text: "Badajoz" },
                { value: "Barcelona", text: "Barcelona" },
                { value: "Burgos", text: "Burgos" },
                { value: "Cáceres", text: "Cáceres" },
                { value: "Cádiz", text: "Cádiz" },
                { value: "Cantabria", text: "Cantabria" },
                { value: "Castellón", text: "Castellón" },
                { value: "Ciudad Real", text: "Ciudad Real" },
                { value: "Córdoba", text: "Córdoba" },
                { value: "La Coruña", text: "La Coruña" },
                { value: "Cuenca", text: "Cuenca" },
                { value: "Gerona", text: "Gerona" },
                { value: "Granada", text: "Granada" },
                { value: "Guadalajara", text: "Guadalajara" },
                { value: "Guipúzcoa", text: "Guipúzcoa" },
                { value: "Huelva", text: "Huelva" },
                { value: "Huesca", text: "Huesca" },
                { value: "Islas Baleares", text: "Islas Baleares" },
                { value: "Jaén", text: "Jaén" },
                { value: "León", text: "León" },
                { value: "Lérida", text: "Lérida" },
                { value: "Lugo", text: "Lugo" },
                { value: "Madrid", text: "Madrid" },
                { value: "Málaga", text: "Málaga" },
                { value: "Murcia", text: "Murcia" },
                { value: "Navarra", text: "Navarra" },
                { value: "Orense", text: "Orense" },
                { value: "Palencia", text: "Palencia" },
                { value: "Las Palmas", text: "Las Palmas" },
                { value: "Pontevedra", text: "Pontevedra" },
                { value: "La Rioja", text: "La Rioja" },
                { value: "Salamanca", text: "Salamanca" },
                { value: "Segovia", text: "Segovia" },
                { value: "Sevilla", text: "Sevilla" },
                { value: "Soria", text: "Soria" },
                { value: "Tarragona", text: "Tarragona" },
                { value: "Santa Cruz de Tenerife", text: "Santa Cruz de Tenerife" },
                { value: "Teruel", text: "Teruel" },
                { value: "Toledo", text: "Toledo" },
                { value: "Valencia", text: "Valencia" },
                { value: "Valladolid", text: "Valladolid" },
                { value: "Vizcaya", text: "Vizcaya" },
                { value: "Zamora", text: "Zamora" },
                { value: "Zaragoza", text: "Zaragoza" },
            ],
            selected: this.values.province,
            error: this.errors.province.length > 0,
            message: this.errors.province,
            onSelect: async (option) => {
                this.values.province = option.value;
                this.errors.province = "";
            },
        });
        double4.appendChild(province.getField());

        const country = new Select({
            label: {
                text: "País",
                for: "country",
            },
            select: {
                name: "country",
                id: "country",
            },
            option: {
                value: "value",
                text: "text",
            },
            options: [{ value: "España", text: "España" }],
            selected: this.values.country,
            error: this.errors.country.length > 0,
            message: this.errors.country,
            onSelect: async (option) => {
                this.values.country = option.value;
                this.errors.country = "";
            },
        });
        double4.appendChild(country.getField());

        if (showPredetermined) {
            const predetermined = new Switch({
                label: {
                    text: "Predeterminar dirección",
                    for: "predetermined",
                },
                input: {
                    name: "predetermined",
                    id: "predetermined",
                    value: this.values.predetermined,
                },
                size: "medium",
                callback: (value) => {
                    this.values.predetermined = value;
                },
            });
            form.appendChild(predetermined.getField());
        }

        return form;
    }

    resetValues() {
        for (const key of Object.keys(this.values)) {
            if (key === "predetermined") {
                this.values[key] = false;
            } else {
                this.values[key] = "";
            }
        }
    }

    resetErrors() {
        for (const key of Object.keys(this.errors)) {
            this.errors[key] = "";
        }
    }

    setValues(address) {
        for (const key of Object.keys(this.values)) {
            this.values[key] = address[key];
        }
    }

    setErrors(responseErrors) {
        for (const key of Object.keys(responseErrors)) {
            if (this.errors[key] !== undefined) {
                this.errors[key] = responseErrors[key];
            }
        }
    }

    async handleCreateNewAddress() {
        const response = await api.post("/api/user/address/first", this.values);

        if (response.status === "error") {
            this.setErrors(response.errors);
            this.modal.repaint(this.createAddressForm());
            return;
        }

        this.setAddresses(response.addresses);

        const popup = new Popup({
            title: "Dirección creada",
            message: "La dirección ha sido creada correctamente",
            type: "success",
            timer: 3000,
        });
        await popup.open();
        await this.modal.close();

        this.repaint();
    }

    async handleCreateAddress() {
        const response = await api.post("/api/user/address", this.values);

        if (response.status === "error") {
            this.setErrors(response.errors);
            this.modal.repaint(this.createAddressForm(true));
            return;
        }

        this.setAddresses(response.addresses);

        const popup = new Popup({
            title: "Dirección creada",
            message: "La dirección ha sido creada correctamente",
            type: "success",
            timer: 3000,
        });
        await popup.open();
        await this.modal.close();

        this.repaint();
    }

    async handleUpdateAddress(address) {
        this.values.id = address.id;
        this.values.userId = address.userId;
        this.values.type = address.type;
        this.values.createdAt = address.createdAt;

        const response = await api.put("/api/user/address", this.values);

        if (response.status === "error" && response.message) {
            const popup = new Popup({
                title: "Error",
                message: response.message,
                type: "error",
                timer: 5000,
            });
            await popup.open();
            return;
        }

        if (response.status === "error") {
            this.setErrors(response.errors);
            this.modal.repaint(this.createAddressForm(true));
            return;
        }

        this.setAddresses(response.addresses);

        const popup = new Popup({
            title: "Dirección actualizada",
            message: "La dirección ha sido actualizada correctamente",
            type: "success",
            timer: 3000,
        });
        await popup.open();
        await this.modal.close();

        this.repaint();
    }

    async handleDeleteAddress(address) {
        const confirm = new Confirm({
            title: "¿Eliminar dirección?",
            description:
                "¿Estás seguro de eliminar esta dirección? Los datos no podrán ser recuperados.",
            accept: "Eliminar",
            cancel: "Cancelar",
        });
        const confirmResponse = await confirm.question();

        if (!confirmResponse) {
            return;
        }

        const response = await api.delete("/api/user/address", address);

        if (response.status === "error") {
            const popup = new Popup({
                title: "Error",
                message: response.message,
                type: "error",
                timer: 5000,
            });
            await popup.open();
            return;
        }

        this.setAddresses(response.addresses);

        const popup = new Popup({
            title: "Dirección eliminada",
            message: "La dirección ha sido eliminada correctamente",
            type: "success",
            timer: 3000,
        });
        await popup.open();

        this.repaint();
    }

    repaint() {
        if (this.addressesEl) {
            this.addressesEl.remove();
        }

        if (this.addresses.length) {
            this.showAddresses();
        } else {
            this.showNewAddress();
        }
    }
}

export default Addresses;
