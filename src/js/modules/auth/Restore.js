import Input from "../../classes/mio/Input";
import IconButton from "../../classes/mio/IconButton";
import LoadingButton from "../../classes/LoadingButton";
import Cart from "../../classes/Cart";
import Options from "../../classes/Options";
import Files from "../../classes/Files";
import Spinner from "../../classes/Spinner";
import Popup from "../../classes/Popup";
import Confirm from "../../classes/Confirm";
import { icons } from "../Icons";
import { indexedDB } from "../IndexedDB";
import { api } from "../Api";
import { navigator } from "../../app";

export const restore = async (req) => {
    const values = {
        newPassword: "",
    };

    const errors = {
        newPassword: "",
    };

    let form = null;
    let submitBtn = null;
    let passwordHidden = true;

    const createForm = () => {
        const restore = document.querySelector("#restore");

        form = document.createElement("form");
        form.classList.add("mio-form");
        form.noValidate = true;
        form.addEventListener("submit", handleSubmit.bind(this));
        restore.appendChild(form);

        const input = document.createElement("input");
        input.type = "email";
        input.name = "email";
        input.value = "";
        input.autocomplete = "username";
        input.classList.add("hidden");

        form.appendChild(input);

        const visibility = new IconButton({
            ariaLabel: "Mostrar contraseña",
            buttonSize: "medium",
            svgSize: "large",
            icon: icons.get(`${passwordHidden ? "eyeFill" : "eyeSlashFill"}`),
            onClick: () => {
                passwordHidden = !passwordHidden;
                repaint();
            },
        });

        const newPassword = new Input({
            label: {
                text: "Contraseña",
                for: "newPassword",
            },
            input: {
                type: `${passwordHidden ? "password" : "text"}`,
                name: "newPassword",
                id: "newPassword",
                autocomplete: "new-password",
                value: values.newPassword,
            },
            adornment: visibility.get(),
            error: errors.newPassword.length > 0,
            message: errors.newPassword,
            onInput: (value) => {
                values.newPassword = value;
                errors.newPassword = "";
            },
        });
        form.appendChild(newPassword.getField());

        const submitField = document.createElement("div");
        submitField.classList.add("mio-field");
        form.appendChild(submitField);

        submitBtn = new LoadingButton({
            type: "submit",
            text: "Restablecer contraseña",
            classes: ["btn", "primary-btn"],
        });
        submitField.appendChild(submitBtn.get());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        values.token = req.params.token;

        const response = await api.post("/api/user/restore", values);
        console.log(response);
        submitBtn.stop();

        if (response.status === "error") {
            setErrors(response.errors);
            repaint();
            return;
        }

        const popup = new Popup({
            title: "Contraseña restaurada",
            message:
                "La contraseña se ha restablecido correctamente. Te redirigimos a la página de inicio de sesión.",
            type: "success",
            timer: 4000,
        });
        await popup.open();

        navigator.goTo("/login");
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

    createForm();

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
