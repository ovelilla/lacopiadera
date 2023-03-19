import Cart from "../classes/Cart";
import Options from "../classes/Options";
import Files from "../classes/Files";
import Login from "../classes/auth/Login";
import Steps from "../classes/Steps";
import Items from "../classes/Items";
import Addresses from "../classes/Addresses";
import Details from "../classes/Details";
import Upload from "../classes/Upload";
import Spinner from "../classes/Spinner";
import Popup from "../classes/Popup";
import Confirm from "../classes/Confirm";
import { indexedDB } from "./IndexedDB";
import { api } from "./Api";
import { navigator } from "../app";

export const checkout = async (req) => {
    const handleUpdateCartItem = async (item) => {
        if (upload.isUpload) {
            return;
        }
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
        if (upload.isUpload) {
            return;
        }
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
        items.repaint();
        details.repaint();

        await spinner.close();

        const popup = new Popup({
            title: "¡Impresión eliminada!",
            message: "La impresión ha sido eliminada correctamente del carrito.",
            type: "success",
            timer: 3000,
        });
        await popup.open();
        await cart.close();
    };

    const handleClearCart = async () => {
        if (upload.isUpload) {
            return;
        }

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
        items.repaint();
        details.repaint();

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

    const handleLoad = async () => {
        const isAuth = await getAuth();

        if (!isAuth) {
            steps.init();
            login.create(req);
            return;
        }

        await addresses.init();

        stepShipment();
    };

    const handleNextStep = async () => {
        if (upload.isUpload) {
            return;
        }

        const isAuth = await getAuth();
        if (!isAuth) {
            return;
        }

        if (cart.isEmpty()) {
            details.orderBtn.stop();
            return;
        }

        details.orderBtn.stop();

        steps.next();

        switch (steps.getIndex()) {
            case 0:
                stepShipment();
                break;
            case 1:
                stepAddresses();
                break;
            case 2:
                if (!addresses.hasSelectedAddresses()) {
                    return;
                }
                stepUpload();
                break;
        }
    };

    const handleClickStep = async (index) => {
        if (upload.isUpload) {
            return;
        }

        const isAuth = await getAuth();
        if (!isAuth) {
            return;
        }

        if (cart.isEmpty()) {
            return;
        }

        steps.setIndex(index);

        switch (index) {
            case 0:
                stepShipment();
                break;
            case 1:
                stepAddresses();
                break;
            case 2:
                if (!addresses.hasSelectedAddresses()) {
                    return;
                }
                stepUpload();
                break;
            case 3:
                return;
        }
    };

    const stepShipment = () => {
        const checkout = document.querySelector("#checkout");

        cleanHTML(checkout);

        const stepsEl = document.createElement("div");
        stepsEl.id = "steps";
        checkout.appendChild(stepsEl);

        const container = document.createElement("div");
        container.classList.add("container");
        checkout.appendChild(container);

        const itemsEl = document.createElement("div");
        itemsEl.id = "items";
        container.appendChild(itemsEl);

        const detailsEl = document.createElement("div");
        detailsEl.id = "details";
        container.appendChild(detailsEl);

        steps.init();
        items.init();
        details.init();
    };

    const stepAddresses = async () => {
        const checkout = document.querySelector("#checkout");

        cleanHTML(checkout);

        const stepsEl = document.createElement("div");
        stepsEl.id = "steps";
        checkout.appendChild(stepsEl);

        const container = document.createElement("div");
        container.classList.add("container");
        checkout.appendChild(container);

        const addressesEl = document.createElement("div");
        addressesEl.id = "addresses";
        container.appendChild(addressesEl);

        const detailsEl = document.createElement("div");
        detailsEl.id = "details";
        container.appendChild(detailsEl);

        steps.repaint();
        addresses.repaint();
        details.repaint();
    };

    const stepUpload = () => {
        const checkout = document.querySelector("#checkout");

        cleanHTML(checkout);

        const stepsEl = document.createElement("div");
        stepsEl.id = "steps";
        checkout.appendChild(stepsEl);

        const container = document.createElement("div");
        container.classList.add("container");
        checkout.appendChild(container);

        const uploadEl = document.createElement("div");
        uploadEl.id = "upload";
        container.appendChild(uploadEl);

        steps.repaint();
        upload.repaint();
    };

    const getAuth = async () => {
        const response = await api.get("/api/user/auth");

        return response.auth;
    };

    const cleanHTML = (el) => {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    };

    const handleUpload = async () => {
        await Promise.all([options.reset(), files.reset(), cart.clear()]);
        cart.repaint();
    };

    const handlePayment = async (order) => {
        navigator.setOnBeforeunload(null);

        const response = await api.post("/api/order/redsys-data", order);

        const form = document.createElement("form");
        form.action = "https://sis-t.redsys.es:25443/sis/realizarPago";
        form.method = "POST";
        form.target = "_blank";
        form.style.display = "none";

        const inputDs_SignatureVersion = document.createElement("input");
        inputDs_SignatureVersion.name = "Ds_SignatureVersion";
        inputDs_SignatureVersion.value = response.data.Ds_SignatureVersion;
        form.appendChild(inputDs_SignatureVersion);

        const inputDs_MerchantParameters = document.createElement("input");
        inputDs_MerchantParameters.name = "Ds_MerchantParameters";
        inputDs_MerchantParameters.value = response.data.Ds_MerchantParameters;
        form.appendChild(inputDs_MerchantParameters);

        const inputDs_Signature = document.createElement("input");
        inputDs_Signature.name = "Ds_Signature";
        inputDs_Signature.value = response.data.Ds_Signature;
        form.appendChild(inputDs_Signature);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        navigator.goTo("/");
    };

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

    const login = new Login({
        req,
    });

    const steps = new Steps({
        index: 0,
        onClick: handleClickStep,
    });

    const items = new Items({
        cart,
        onUpdate: handleUpdateCartItem,
        onDelete: handleDeleteCartItem,
    });

    const addresses = new Addresses();

    const details = new Details({
        cart,
        nextStepText: "Realizar pedido",
        onClick: handleNextStep,
    });

    const upload = new Upload({
        cart,
        details,
        addresses,
        onUpload: handleUpload,
        onClick: handlePayment,
    });

    handleLoad();
};
