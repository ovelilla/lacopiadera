import Input from "../classes/mio/Input";
import Switch from "../classes/mio/Switch";
import Cart from "../classes/Cart";
import Options from "../classes/Options";
import Files from "../classes/Files";
import Spinner from "../classes/Spinner";
import Popup from "../classes/Popup";
import Confirm from "../classes/Confirm";
import Modal from "../classes/Modal";
import Table from "../classes/Table";
import { navigator } from "../app";
import { indexedDB } from "./IndexedDB";
import { icons } from "./Icons";
import { api } from "./Api";

export const codes = async () => {
    let code = null;
    let codes = [];

    let values = {
        name: "",
        code: "",
        discount: 0,
    };

    let errors = {
        name: "",
        code: "",
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

    const readCodes = async () => {
        const response = await api.get("/api/code");
        if (response.status === "error") {
            return;
        }
        codes = response.codes;
    };

    const createSwitchForm = (row) => {
        const form = document.createElement("form");
        form.classList.add("mio-form");

        const active = new Switch({
            label: {
                text: "",
                for: `active${row.id}`,
            },
            input: {
                name: `active${row.id}`,
                id: `active${row.id}`,
                value: row.active,
            },
            size: "small",
            callback: (value) => {
                code = row;
                code.active = value;
                updateCodeActive();
            },
        });

        form.appendChild(active.getField());

        return form;
    };

    const updateCodeActive = async () => {
        const response = await api.put("/api/code/active", code);
        if (response.status === "error") {
            return;
        }
        table.updateRow(response.code);
    };

    const handleCreateCode = () => {
        modal = new Modal({
            title: "Crear código",
            content: createCodeForm(),
            action: "Crear",
            maxWidth: "700px",
            fullscreenButton: true,
            actionCallback: () => createCode(),
            closeCallback: () => {
                resetValues();
                resetErrors();
            },
            fullscreenCallback: () => {},
        });
    };

    const createCode = async () => {
        const response = await api.post("/api/code", values);

        if (response.status === "error") {
            setErrors(response.errors);
            modal.repaint(createCodeForm());
            return;
        }

        const popup = new Popup({
            title: "¡Código creado!",
            message: "El código ha sido creado correctamente.",
            type: "success",
            timer: 3000,
        });
        await popup.open();
        await modal.close();

        table.addRow(response.code);
    };

    const handleUpdateCode = async (row) => {
        code = row;
        setValues(row);

        modal = new Modal({
            title: "Actualizar código",
            content: createCodeForm(),
            action: "Actualizar",
            maxWidth: "700px",
            fullscreenButton: true,
            actionCallback: () => updateCode(),
            closeCallback: () => {
                resetValues();
                resetErrors();
            },
            fullscreenCallback: () => {},
        });
    };

    const updateCode = async () => {
        const data = { ...code, ...values };

        const response = await api.put("/api/code", data);

        if (response.status === "error") {
            setErrors(response.errors);
            modal.repaint(createCodeForm());
            return;
        }

        const popup = new Popup({
            title: "¡Código actualizado!",
            message: "El código ha sido actualizado correctamente.",
            type: "success",
            timer: 3000,
        });
        await popup.open();
        await modal.close();

        table.updateRow(response.code);
    };

    const handleDeleteCode = async (row) => {
        const confirm = new Confirm({
            title: "¿Eliminar código?",
            description:
                "¿Estás seguro de eliminar esta código? Los datos no podrán ser recuperados.",
            accept: "Eliminar",
            cancel: "Cancelar",
        });
        const confirmResponse = await confirm.question();

        if (!confirmResponse) {
            return;
        }

        const response = await api.delete("/api/code", { id: row.id });

        if (response.status === "error") {
            return;
        }

        const popup = new Popup({
            title: "¡Código eliminado!",
            message: "El código ha sido eliminado correctamente.",
            type: "success",
            timer: 3000,
        });
        await popup.open();

        table.deleteRow(row);
    };

    const handleDeleteCodes = async (rows) => {
        const confirm = new Confirm({
            title: `¿Eliminar ${rows.length > 1 ? "códigos" : "código"}?`,
            description: `¿Estás seguro de eliminar  ${
                rows.length > 1 ? "estos códigos" : "esta código"
            }? Los datos no podrán ser recuperados.`,
            accept: "Eliminar",
            cancel: "Cancelar",
        });

        const confirmResponse = await confirm.question();

        if (!confirmResponse) {
            return;
        }

        const response = await api.delete("/api/code/multiple", rows);

        if (response.status === "error") {
            return;
        }

        const popup = new Popup({
            title: `¡${rows.length > 1 ? "Códigos eliminados" : "Código eliminado"}!`,
            message: `${
                rows.length > 1 ? "Los códigos han sido eliminados" : "El codigo ha sido eliminado"
            } correctamente!`,
            type: "success",
            timer: 3000,
        });
        await popup.open();

        table.deleteRows(rows);
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

    const createCodeForm = () => {
        const form = document.createElement("form");
        form.classList.add("mio-form");
        form.noValidate = true;

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
        form.appendChild(name.getField());

        const code = new Input({
            label: {
                text: "Código",
                for: "code",
            },
            input: {
                type: "text",
                name: "code",
                id: "code",
                value: values.code,
            },
            error: errors.code.length > 0,
            message: errors.code,
            onInput: (value) => {
                values.code = value;
                errors.code = "";
            },
        });
        form.appendChild(code.getField());

        const discount = new Input({
            label: {
                text: "Descuento",
                for: "discount",
            },
            input: {
                type: "number",
                name: "discount",
                id: "discount",
                value: values.discount,
            },
            error: errors.discount.length > 0,
            message: errors.discount,
            onInput: async (value) => {
                values.discount = value.length > 0 ? value : 0;
                errors.discount = "";
            },
        });
        form.appendChild(discount.getField());

        return form;
    };

    const codesContainer = document.querySelector("#codes");
    const userSidebar = document.querySelector("#user-sidebar");
    const openUserSidebarBtn = document.querySelector("#open-user-sidebar-btn");
    const closeUserSidebarBtn = document.querySelector("#close-user-sidebar-btn");

    window.addEventListener("resize", handleResize);
    openUserSidebarBtn.addEventListener("click", handleOpenUserSidebar);
    closeUserSidebarBtn.addEventListener("click", handleCloseUserSidebar);
    userSidebar.addEventListener("click", handleCloseUserSidebar);

    const spinner = new Spinner({
        parent: document.querySelector("#codes").parentElement,
    });
    await spinner.open();

    await readCodes();

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
        { field: "name", headerName: "Nombre" },
        { field: "code", headerName: "Código" },
        { field: "discount", headerName: "Descuento" },
    ];

    const table = new Table({
        title: "Códigos",
        columns: columns,
        customColumns: [
            {
                field: "active",
                headerName: "Activo",
                content: createSwitchForm,
            },
        ],
        rows: codes,
        findFields: ["name", "code"],
        container: codesContainer,
        visibleRows: 10,
        rowsPerPage: 15,
        rowsPerPageOptions: [5, 10, 15],
        showActionsMenu: true,
        headerActions: [
            {
                name: "Crear código",
                icon: icons.get("plusLg"),
                callback: handleCreateCode,
            },
        ],
        rowsActions: [
            {
                name: "Editar código",
                icon: icons.get("pencilSquare"),
                callback: handleUpdateCode,
            },
            {
                name: "Eliminar código",
                icon: icons.get("trash"),
                callback: handleDeleteCode,
            },
        ],
        selectActions: [
            {
                name: "Eliminar códigos",
                icon: icons.get("trash"),
                callback: handleDeleteCodes,
            },
        ],
    });
};
