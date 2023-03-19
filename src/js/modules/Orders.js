import Cart from "../classes/Cart";
import Options from "../classes/Options";
import Files from "../classes/Files";
import Spinner from "../classes/Spinner";
import Popup from "../classes/Popup";
import Confirm from "../classes/Confirm";
import { indexedDB } from "./IndexedDB";
import { navigator } from "../app";
import Orders from "../classes/Orders";

export const orders = async () => {
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
        parent: document.querySelector("#orders").parentElement,
    });
    await spinner.open();

    const orders = new Orders();
    await orders.init();

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
