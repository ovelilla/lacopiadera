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

export const confirm = async (req) => {
    const handleConfirm = async () => {
        const response = await api.post("/api/user/confirm", { token: req.params.token });

        if (response.status === "error") {
            showMessage("error", response.errors.token);
            return;
        }

        showMessage("success", response.message);
    };

    const showMessage = (type, message) => {
        const confirm = document.querySelector("#confirm");

        const messageEl = document.createElement("div");
        messageEl.classList.add("message");
        if (type === "error") {
            messageEl.classList.add("error");

            const icon = icons.get("exclamationCircle");
            messageEl.appendChild(icon);
        } else {
            messageEl.classList.add("success");

            const icon = icons.get("check2Circle");
            messageEl.appendChild(icon);
        }
        confirm.appendChild(messageEl);

        const p = document.createElement("p");
        p.textContent = message;
        messageEl.appendChild(p);
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

    handleConfirm();

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
