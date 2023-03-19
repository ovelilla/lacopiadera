import Switch from "../classes/mio/Switch";
import Cart from "../classes/Cart";
import Options from "../classes/Options";
import Files from "../classes/Files";
import Spinner from "../classes/Spinner";
import Popup from "../classes/Popup";
import Confirm from "../classes/Confirm";
import Modal from "../classes/Modal";
import Table from "../classes/Table";
import Items from "../classes/Items";
import PreviewOrder from "../classes/PreviewOrder";
import { navigator } from "../app";
import { indexedDB } from "./IndexedDB";
import { icons } from "./Icons";
import { api } from "./Api";
import { tools } from "./Tools";

export const ordersAdmin = async () => {
    let order = null;
    let orders = [];

    let values = {
        paid: false,
    };

    let errors = {
        name: "",
        order: "",
        discount: "",
    };

    let modal = null;

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

    const readOrders = async () => {
        const response = await api.post("/api/order/read");
        if (response.status === "error") {
            return;
        }
        orders = response.orders;
    };

    const handleSeeOrder = async (row) => {
        console.log(row);
        const previewOrder = new PreviewOrder({
            items: row.items,
            onDownload: handleDownload,
        });

        modal = new Modal({
            title: "Ver pedido",
            content: previewOrder.create(),
            action: "Aceptar",
            maxWidth: "900px",
            fullscreenButton: true,
            actionCallback: () => {},
            closeCallback: () => {},
            fullscreenCallback: () => {},
        });
    };

    const handleDownload = async (item) => {
        // console.log(item);
        // return;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/order/download";

        const inputOrderId = document.createElement("input");
        inputOrderId.type = "hidden";
        inputOrderId.name = "orderId";
        inputOrderId.value = item.orderId;
        form.appendChild(inputOrderId);

        const inputItemId = document.createElement("input");
        inputItemId.type = "hidden";
        inputItemId.name = "id";
        inputItemId.value = item.id;
        form.appendChild(inputItemId);
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const handleUpdateOrder = async (row) => {
        order = row;
        setValues(row);

        modal = new Modal({
            title: "Actualizar pedido",
            content: createOrderForm(),
            action: "Actualizar",
            maxWidth: "700px",
            fullscreenButton: true,
            actionCallback: () => updateOrder(),
            closeCallback: () => {
                resetValues();
                resetErrors();
            },
            fullscreenCallback: () => {},
        });
    };

    const updateOrder = async () => {
        const data = { ...order, ...values };

        const response = await api.put("/api/order", data);

        if (response.status === "error") {
            setErrors(response.errors);
            modal.repaint(createOrderForm());
            return;
        }

        const popup = new Popup({
            title: "¡Pedido actualizado!",
            message: "El pedido ha sido actualizado correctamente.",
            type: "success",
            timer: 3000,
        });
        await popup.open();
        await modal.close();

        table.updateRow(response.order);
    };

    const handleDeleteOrder = async (row) => {
        const confirm = new Confirm({
            title: "¿Eliminar pedido?",
            description:
                "¿Estás seguro de eliminar este pedido? Los datos no podrán ser recuperados.",
            accept: "Eliminar",
            cancel: "Cancelar",
        });
        const confirmResponse = await confirm.question();

        if (!confirmResponse) {
            return;
        }

        const response = await api.delete("/api/order", row);

        if (response.status === "error") {
            const popup = new Popup({
                title: "¡Error!",
                message: response.message,
                type: "error",
                timer: 3000,
            });
            await popup.open();
            return;
        }

        const popup = new Popup({
            title: "¡Pedido eliminado!",
            message: "El pedido ha sido eliminado correctamente.",
            type: "success",
            timer: 3000,
        });
        await popup.open();

        table.deleteRow(row);
    };

    const handleDeleteOrders = async (rows) => {
        const confirm = new Confirm({
            title: `¿Eliminar ${rows.length > 1 ? "pedidos" : "pedido"}?`,
            description: `¿Estás seguro de eliminar  ${
                rows.length > 1 ? "estos pedidos" : "esta pedido"
            }? Los datos no podrán ser recuperados.`,
            accept: "Eliminar",
            cancel: "Cancelar",
        });

        const confirmResponse = await confirm.question();

        if (!confirmResponse) {
            return;
        }

        const response = await api.delete("/api/order/multiple", rows);

        if (response.status === "error") {
            const popup = new Popup({
                title: "¡Error!",
                message: response.message,
                type: "error",
                timer: 3000,
            });
            await popup.open();
            return;
        }

        const popup = new Popup({
            title: `¡${rows.length > 1 ? "Pedidos eliminados" : "Pedido eliminado"}!`,
            message: `${
                rows.length > 1 ? "Los pedidos han sido eliminados" : "El codigo ha sido eliminado"
            } correctamente!`,
            type: "success",
            timer: 3000,
        });
        await popup.open();

        table.deleteRows(rows);
    };

    const handleDownloadDocuments = async (row) => {
        console.log(row);
        // return;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/order/download/all";

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "id";
        input.value = row.id;

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const handleGenerateInvoicePDF = async (row) => {
        if (!row.paid) {
            const popup = new Popup({
                title: "¡Error!",
                message: "El pedido no ha sido pagado.",
                type: "error",
                timer: 3000,
            });
            await popup.open();
            return;
        }

        const response = await api.post("/api/order/invoice", row);

        const linkSource = `data:application/pdf;base64,${response.base64}`;
        const downloadLink = document.createElement("a");
        const fileName = response.fileName;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    };

    const resetValues = () => {
        for (const key of Object.keys(values)) {
            if (key === "predetermined") {
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

    const setValues = (row) => {
        for (const key of Object.keys(values)) {
            values[key] = row[key];
        }
    };

    const setErrors = (responseErrors) => {
        for (const key of Object.keys(responseErrors)) {
            if (errors[key] !== undefined) {
                errors[key] = responseErrors[key];
            }
        }
    };

    const createOrderForm = () => {
        const form = document.createElement("form");
        form.classList.add("mio-form");
        form.noValidate = true;

        const paid = new Switch({
            label: {
                text: "Pagado",
                for: "paid",
            },
            input: {
                name: "paid",
                id: "paid",
                value: values.paid,
            },
            size: "medium",
            callback: (value) => {
                values.paid = value;
            },
        });
        form.appendChild(paid.getField());

        return form;
    };

    const ordersContainer = document.querySelector("#orders-admin");
    const userSidebar = document.querySelector("#user-sidebar");
    const openUserSidebarBtn = document.querySelector("#open-user-sidebar-btn");
    const closeUserSidebarBtn = document.querySelector("#close-user-sidebar-btn");

    window.addEventListener("resize", handleResize);
    openUserSidebarBtn.addEventListener("click", handleOpenUserSidebar);
    closeUserSidebarBtn.addEventListener("click", handleCloseUserSidebar);
    userSidebar.addEventListener("click", handleCloseUserSidebar);

    const spinner = new Spinner({
        parent: document.querySelector("#orders-admin").parentElement,
    });
    await spinner.open();

    await readOrders();

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

    const columns = [
        { field: "id", headerName: "Id" },
        { field: "number", headerName: "Pedido" },
        { field: "username", headerName: "Cliente" },
        { field: "total", headerName: "Total" },
        { field: "paid", headerName: "Pagado", formatter: (paid) => (paid ? "Sí" : "No") },
        { field: "createdAt", headerName: "Fecha", formatter: tools.dateTimeFormat },
    ];

    const table = new Table({
        title: "Pedidos",
        columns: columns,
        rows: orders,
        findFields: ["number", "username"],
        container: ordersContainer,
        visibleRows: 10,
        rowsPerPage: 15,
        rowsPerPageOptions: [5, 10, 15],
        showActionsMenu: true,
        headerActions: [],
        rowsActions: [
            {
                name: "Consultar pedido",
                icon: icons.get("eyeFill"),
                callback: handleSeeOrder,
            },
            {
                name: "Editar pedido",
                icon: icons.get("pencilSquare"),
                callback: handleUpdateOrder,
            },
            {
                name: "Eliminar pedido",
                icon: icons.get("trash"),
                callback: handleDeleteOrder,
            },
            {
                name: "Descargar documentos",
                icon: icons.get("download"),
                callback: handleDownloadDocuments,
            },
            {
                name: "Generar factura PDF",
                icon: icons.get("filePDF"),
                callback: handleGenerateInvoicePDF,
            },
        ],
        selectActions: [
            {
                name: "Eliminar pedidos",
                icon: icons.get("trash"),
                callback: handleDeleteOrders,
            },
        ],
    });
};
