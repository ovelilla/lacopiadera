import Input from "../classes/mio/Input";
import LoadingButton from "../classes/LoadingButton";
import Cart from "../classes/Cart";
import Options from "../classes/Options";
import Files from "../classes/Files";
import Spinner from "../classes/Spinner";
import Popup from "../classes/Popup";
import Confirm from "../classes/Confirm";
import { navigator } from "../app";
import { indexedDB } from "./IndexedDB";
import { api } from "./Api";

export const profile = async () => {
    const values = {
        name: "",
        lastname: "",
        phone: "",
        nif: "",
        email: "",
    };

    let errors = {
        name: "",
        lastname: "",
        phone: "",
        nif: "",
        email: "",
    };

    let email = null;
    let form = null;
    let submitBtn = null;

    let isOpen = false;
    let isAnimated = false;

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

    const readProfile = async () => {
        const response = await api.get("/api/user/profile");
        if (response.status === "error") {
            return;
        }
        values.name = response.profile.name;
        values.lastname = response.profile.lastname;
        values.phone = response.profile.phone;
        values.nif = response.profile.nif;
        values.email = response.user.email;

        email = response.user.email;
    };

    const createForm = () => {
        const profile = document.querySelector("#profile");

        form = document.createElement("form");
        form.classList.add("mio-form");
        form.noValidate = true;
        form.addEventListener("submit", handleSubmit);
        profile.appendChild(form);

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
                autocomplete: "username",
                value: values.name,
            },
            error: errors.name.length > 0,
            message: errors.name,
            onInput: (value) => {
                values.name = value;
                errors.name = "";
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
                autocomplete: "username",
                value: values.lastname,
            },
            error: errors.lastname.length > 0,
            message: errors.lastname,
            onInput: (value) => {
                values.lastname = value;
                errors.lastname = "";
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
                autocomplete: "username",
                value: values.phone,
            },
            error: errors.phone.length > 0,
            message: errors.phone,
            onInput: (value) => {
                values.phone = value;
                errors.phone = "";
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
                autocomplete: "username",
                value: values.nif,
            },
            error: errors.nif.length > 0,
            message: errors.nif,
            onInput: (value) => {
                values.nif = value;
                errors.nif = "";
            },
        });
        double2.appendChild(nif.getField());

        const email = new Input({
            label: {
                text: "Email",
                for: "email",
            },
            input: {
                type: "email",
                name: "email",
                id: "email",
                autocomplete: "username",
                value: values.email,
            },
            error: errors.email.length > 0,
            message: errors.email,
            onInput: (value) => {
                values.email = value;
                errors.email = "";
            },
        });
        form.appendChild(email.getField());

        const submitField = document.createElement("div");
        submitField.classList.add("mio-submit-field");
        form.appendChild(submitField);

        submitBtn = new LoadingButton({
            type: "submit",
            text: "Actualizar datos",
            classes: ["btn", "primary-btn"],
        });
        submitField.appendChild(submitBtn.get());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (email !== values.email) {
            const confirm = new Confirm({
                title: "¿Cambiar email?",
                description:
                    "El nuevo email se usará para iniciar sesión. ¿Estás seguro de que deseas cambiarlo?",
                accept: "Aceptar",
                cancel: "Cancelar",
            });
            const confirmResponse = await confirm.question();

            if (!confirmResponse) {
                submitBtn.stop();
                return;
            }
        }

        const response = await api.put("/api/user/profile", values);

        submitBtn.stop();

        if (response.status === "error") {
            setErrors(response.errors);
            repaint();
            return;
        }

        const popup = new Popup({
            title: "Perfil actualizado",
            message: "El perfil ha sido actualizado correctamente.",
            type: "success",
            timer: 3000,
        });
        await popup.open();

        navigator.reload();
    };

    const setErrors = (responseErrors) => {
        for (const key of Object.keys(responseErrors)) {
            if (errors[key] !== undefined) {
                errors[key] = responseErrors[key];
            }
        }
    };

    const repaint = () => {
        form.remove();
        createForm();
    };

    const handleResize = () => {
        if (window.innerWidth >= 768 && isOpen) {
            isOpen = false;

            userSidebar.classList.remove("active", "in", "out");
        }
    };

    const handleOpenUserSidebar = async () => {
        if (!isOpen && !isAnimated) {
            isOpen = true;
            isAnimated = true;

            userSidebar.classList.add("active", "in");
            await animationend(userSidebar);

            isAnimated = false;
        }
    };

    const handleCloseUserSidebar = async (e) => {
        if (
            (e.target === userSidebar || e.currentTarget === closeUserSidebarBtn) &&
            isOpen &&
            !isAnimated
        ) {
            isOpen = false;
            isAnimated = true;

            if (innerWidth < 768) {
                userSidebar.classList.add("out");
                await animationend(userSidebar);
                userSidebar.classList.remove("active", "in", "out");
            }

            isAnimated = false;
        }
    };

    const animationend = (target) => {
        return new Promise((resolve) => {
            target.addEventListener("animationend", resolve, { once: true });
        });
    };

    const userSidebar = document.querySelector("#user-sidebar");
    const openUserSidebarBtn = document.querySelector("#open-user-sidebar-btn");
    const closeUserSidebarBtn = document.querySelector("#close-user-sidebar-btn");

    window.addEventListener("resize", handleResize);
    openUserSidebarBtn.addEventListener("click", handleOpenUserSidebar);
    closeUserSidebarBtn.addEventListener("click", handleCloseUserSidebar);
    userSidebar.addEventListener("click", handleCloseUserSidebar);

    const spinner = new Spinner({
        parent: document.querySelector("#profile").parentElement,
    });
    await spinner.open();

    await readProfile();
    createForm();

    await indexedDB.createIndexedDB();
    const cartDB = await indexedDB.getRecords("cart");

    await spinner.close();

    const cart = new Cart({
        cart: cartDB,
        onUpdate: handleUpdateCartItem,
        onDelete: handleDeleteCartItem,
        onClear: handleClearCart,
    });
    const options = new Options();
    const files = new Files();
};
