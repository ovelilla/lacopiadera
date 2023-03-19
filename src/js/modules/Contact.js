import Cart from "../classes/Cart";
import Options from "../classes/Options";
import Files from "../classes/Files";
import Input from "../classes/mio/Input";
import Textarea from "../classes/mio/Textarea";
import Checkbox from "../classes/mio/Checkbox";
import LoadingButton from "../classes/LoadingButton";
import Spinner from "../classes/Spinner";
import Popup from "../classes/Popup";
import Confirm from "../classes/Confirm";
import Collapse from "../classes/Collapse";
import { indexedDB } from "./IndexedDB";
import { navigator } from "../app";
import { api } from "./Api";

export const contact = async () => {
    const values = {
        name: "",
        email: "",
        phone: "",
        message: "",
        accept: false,
    };

    const errors = {
        name: "",
        email: "",
        phone: "",
        message: "",
        accept: "",
    };

    let contactForm = null;
    let submitBtn = null;

    const handleUpdateCartItem = async (item) => {
        const spinner = new Spinner({
            parent: document.querySelector("main"),
        });
        await spinner.open();

        await Promise.all([options.reset(), files.reset()]);

        options.setValues(item.options);
        options.setUpdate(true);
        files.set(item.files);

        await Promise.all([options.save(), files.save()]);
        await Promise.all([spinner.close(), cart.close()]);

        navigator.goTo("/imprimir");
    };

    const handleDeleteCartItem = async (item) => {
        const confirm = new Confirm({
            title: "¿Eliminar impresión?",
            description:
                "La impresion se eliminará del carrito. ¿Estás seguro de que deseas continuar?",
            accept: "Eliminar",
            cancel: "Cancelar",
        });
        const confirmResponse = await confirm.question();

        if (!confirmResponse) {
            return;
        }

        const spinner = new Spinner({
            parent: document.querySelector("main"),
        });
        await spinner.open();

        await Promise.all([options.reset(), files.reset(), cart.delete(item)]);
        cart.repaint();

        await spinner.close();

        const popup = new Popup({
            title: "¡Impresión eliminada!",
            message: "La impresión ha sido eliminada correctamente del carrito.",
            type: "success",
            timer: 3000,
        });
        await popup.open();

        cart.close();
    };

    const handleClearCart = async () => {
        if (!cart.length()) {
            return;
        }

        const confirm = new Confirm({
            title: "¿Vaciar carrito?",
            description: "El carrito se vaciará. ¿Estás seguro de que deseas continuar?",
            accept: "Vaciar",
            cancel: "Cancelar",
        });
        const confirmResponse = await confirm.question();

        if (!confirmResponse) {
            return;
        }

        const spinner = new Spinner({
            parent: document.querySelector("main"),
        });
        await spinner.open();

        await Promise.all([options.reset(), files.reset(), cart.clear()]);

        cart.repaint();

        await spinner.close();
        const popup = new Popup({
            title: "¡Carrito vacío!",
            message: "El carrito ha sido vaciado correctamente.",
            type: "success",
            timer: 3000,
        });
        await popup.open();
        await cart.close();
    };

    const handleAccordion = async (e) => {
        const targetItem = e.target.closest(".item");
        if (targetItem && targetItem.firstElementChild.classList.contains("active")) {
            const accordion = document.querySelector("#accordion");
            const accordionItems = accordion.querySelectorAll(".item");
            const targetItem = e.target.closest(".item");

            accordionItems.forEach((item) => {
                if (item !== targetItem && item.firstElementChild.classList.contains("active")) {
                    item.firstElementChild.click();
                }
            });
        }
    };

    const createContactForm = () => {
        const contact = document.querySelector("#contact");

        contactForm = document.createElement("form");
        contactForm.classList.add("mio-form");
        contactForm.noValidate = true;
        contactForm.addEventListener("submit", handleSubmit);
        contact.appendChild(contactForm);

        const name = new Input({
            label: {
                text: "Nombre",
                for: "name",
            },
            input: {
                type: "text",
                name: "name",
                id: "name",
                value: values.name,
            },
            error: errors.name.length > 0,
            message: errors.name,
            onInput: (value) => {
                values.name = value;
                errors.name = "";
            },
        });
        contactForm.appendChild(name.getField());

        const email = new Input({
            label: {
                text: "Email",
                for: "email",
            },
            input: {
                type: "text",
                name: "email",
                id: "email",
                value: values.email,
            },
            error: errors.email.length > 0,
            message: errors.email,
            onInput: (value) => {
                values.email = value;
                errors.email = "";
            },
        });
        contactForm.appendChild(email.getField());

        const phone = new Input({
            label: {
                text: "Teléfono",
                for: "phone",
            },
            input: {
                type: "tel",
                phone: "phone",
                id: "phone",
                value: values.phone,
            },
            error: errors.phone.length > 0,
            message: errors.phone,
            onInput: (value) => {
                values.phone = value;
                errors.phone = "";
            },
        });
        contactForm.appendChild(phone.getField());

        const message = new Textarea({
            label: {
                text: "Mensaje",
                for: "message",
            },
            input: {
                name: "message",
                id: "message",
                rows: 3,
                value: values.message,
            },
            error: errors.message.length > 0,
            message: errors.message,
            onInput: (value) => {
                values.message = value;
                errors.message = "";
            },
        });
        contactForm.appendChild(message.getField());

        const accept = new Checkbox({
            label: {
                text: "He leído y acepto la Política de Privacidad",
                for: "accept",
            },
            input: {
                name: "accept",
                id: "accept",
                value: values.accept,
            },
            error: errors.accept.length > 0,
            message: errors.accept,
            onClick: (value) => {
                values.accept = value;
                errors.accept = "";
                repaint();
            },
        });
        contactForm.appendChild(accept.getField());

        const submitField = document.createElement("div");
        submitField.classList.add("mio-field");
        contactForm.appendChild(submitField);

        submitBtn = new LoadingButton({
            type: "submit",
            text: "Enviar",
            classes: ["btn", "primary-btn"],
            onClick: () => {},
        });
        submitField.appendChild(submitBtn.get());
    };

    const resetValues = () => {
        for (const key of Object.keys(values)) {
            if (key === "accept") {
                values[key] = false;
            } else {
                values[key] = "";
            }
        }
    };

    const resetErrors = () => {
        for (const key of Object.keys(errors)) {
            errors[key] = "";
        }
    };

    const setErrors = (responseErrors) => {
        for (const key of Object.keys(responseErrors)) {
            if (errors[key] !== undefined) {
                errors[key] = responseErrors[key];
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await api.post("/api/contact", values);

        if (response.status === "error") {
            setErrors(response.errors);
            contactForm.remove();
            createContactForm();
            return;
        }

        const popup = new Popup({
            title: "¡Mensaje enviado!",
            message:
                "Gracias por contactar con nosotros. Nos pondremos en contacto contigo lo antes posible.",
            type: "success",
            timer: 3000,
        });
        await popup.open();

        resetValues();
        resetErrors();
        contactForm.remove();
        createContactForm();
    };

    const repaint = () => {
        contactForm.remove();
        createContactForm();
    };

    const accordion = document.querySelector("#accordion");
    const accordionItems = accordion.querySelectorAll(".item");

    accordionItems.forEach((item) => {
        const target = item.firstElementChild;
        const container = item.lastElementChild;
        new Collapse({
            target,
            container,
            collapsed: true,
        });
    });

    createContactForm();

    accordion.addEventListener("click", handleAccordion);

    await indexedDB.createIndexedDB();
    const cartDB = await indexedDB.getRecords("cart");

    const cart = new Cart({
        cart: cartDB,
        onUpdate: handleUpdateCartItem,
        onDelete: handleDeleteCartItem,
        onClear: handleClearCart,
    });
    const options = new Options();
    const files = new Files();
};
