import Files from "../classes/Files";
import File from "../classes/File";
import InputFiles from "../classes/InputFiles";
import Drop from "../classes/Drop";
import Thumbs from "../classes/Thumbs";
import Options from "../classes/Options";
import Pdf from "../classes/Pdf";
import Cart from "../classes/Cart";
import Spinner from "../classes/Spinner";
import Popup from "../classes/Popup";
import Confirm from "../classes/Confirm";
import Resume from "../classes/Resume";
import Item from "../classes/Item";
import { indexedDB } from "./IndexedDB";

export const printer = async () => {
    await indexedDB.createIndexedDB();

    const [filesDB, optionsDB, cartDB] = await Promise.all([
        indexedDB.getRecords("files"),
        indexedDB.getRecords("options"),
        indexedDB.getRecords("cart"),
    ]);

    const handleLoad = async () => {
        cart.get().forEach((item) => {
            const filesMatch = item.files.some((itemFile) => {
                return files.get().some((file) => file.id === itemFile.id);
            });

            if (filesMatch) {
                cart.setItem(item);
            }
        });

        if (files.length() === 0 && cart.getItem() === null && options.getUpdate()) {
            await options.reset();
            options.repaint();
            cart.setItem(null);
        }
    };

    const handleAddFiles = async (filesParam) => {
        const spinner = new Spinner({
            parent: document.querySelector("#droparea"),
        });
        await spinner.open();

        options.setCustomPages("all");
        options.setFrom(1);
        options.setTo(1);
        options.setMaxCustomPagesTo(null);

        await files.recalculate(options.getValues());
        thumbs.show(files.get(), options.getValues());

        for (let i = 0; i < filesParam.length; i++) {
            const file = filesParam[i];

            const { image, pages } = await pdf.getData(file);

            const fileObject = new File({
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                image,
                pages,
                options: options.getValues(),
            });

            await files.add(fileObject);
            thumbs.add(fileObject, options.getValues());
        }

        if (files.length() > 1) {
            options.setCustumPagesEnabled(false);
        } else {
            options.setCustumPagesEnabled(true);
            options.setTo(files.getFirst().pages);
            options.setMaxCustomPagesTo(files.getFirst().pages);
        }

        await options.save();
        options.repaint();
        inputFiles.clear();

        await spinner.close();
    };

    const handleDeleteFile = async (file) => {
        const confirm = new Confirm({
            title: "¿Eliminar archivo?",
            description: "El archivo se borrará. ¿Estás seguro de eliminar este archivo?",
            accept: "Eliminar",
            cancel: "Cancelar",
        });
        const confirmResponse = await confirm.question();

        if (!confirmResponse) {
            return;
        }

        await files.delete(file);

        if (files.length() === 0 && !cart.getItem()) {
            await Promise.all([options.reset(), files.reset()]);
            options.repaint();
            thumbs.clear();
            return;
        }

        if (files.length() === 1) {
            options.setCustumPagesEnabled(true);
            options.setTo(files.getFirst().pages);
            options.setMaxCustomPagesTo(files.getFirst().pages);
        }

        if (files.length() > 1) {
            options.setCustumPagesEnabled(false);
        }

        thumbs.show(files.get(), options.getValues());

        await options.save();
        options.repaint();
    };

    const handleChangeOptions = async () => {
        await files.recalculate(options.getValues());
        thumbs.show(files.get(), options.getValues());
    };

    const handleCreateItem = async () => {
        if (!files.length()) {
            const popup = new Popup({
                title: "¡Error de subida!",
                message: "No hay archivos para subir. Por favor, añade archivos.",
                type: "error",
                timer: 3000,
            });

            options.createBtn.stop();
            await popup.open();
            return;
        }

        const spinner = new Spinner({
            parent: document.querySelector("#print"),
        });
        await spinner.open();

        const resume = new Resume({
            files: files.get(),
        });

        const item = new Item({
            files: files.get(),
            options: options.getValues(),
            resume: resume.get(),
        });

        await cart.add(item);

        options.createBtn.stop();
        await spinner.close();

        const popup = new Popup({
            title: "¡Impresión añadida!",
            message: "La impresión ha sido añadida correctamente al carrito.",
            type: "success",
            timer: 3000,
        });
        await popup.open();

        await Promise.all([options.reset(), files.reset()]);

        options.repaint();
        options.close();

        thumbs.clear();

        cart.repaint();
        await cart.open();
    };

    const handleUpdateItem = async () => {
        if (!files.length()) {
            const popup = new Popup({
                title: "¡Error de subida!",
                message: "No hay archivos para actualizar. Por favor, añade archivos.",
                type: "error",
                timer: 3000,
            });

            options.updateBtn.stop();
            await popup.open();
            return;
        }

        const spinner = new Spinner({
            parent: document.querySelector("#print"),
        });
        await spinner.open();

        const resume = new Resume({
            files: files.get(),
        });

        const item = new Item({
            files: files.get(),
            options: options.getValues(),
            resume: resume.get(),
        });
        item.setId(cart.getItem().id);

        await cart.update(item);

        options.updateBtn.stop();
        await spinner.close();

        const popup = new Popup({
            title: "¡Impresión actualizada!",
            message: "La impresión ha sido actualizada correctamente.",
            type: "success",
            timer: 3000,
        });
        await popup.open();

        await Promise.all([options.reset(), files.reset()]);

        options.repaint();
        options.close();

        thumbs.clear();

        cart.repaint();
        await cart.open();
    };

    const handleCancelItem = async () => {
        await Promise.all([options.reset(), files.reset()]);
        options.repaint();
        thumbs.clear();
        cart.setItem(null);
        await options.close();
    };

    const handleUpdateCartItem = async (item) => {
        cart.setItem(item);

        await Promise.all([cart.close(), options.close()]);

        const spinner = new Spinner({
            parent: document.querySelector("#print"),
        });
        await spinner.open();

        await Promise.all([options.reset(), files.reset()]);

        options.setValues(item.options);
        options.setUpdate(true);
        files.set(item.files);

        await Promise.all([options.save(), files.save()]);

        options.repaint();
        thumbs.show(files.get(), options.getValues());

        await spinner.close();
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

        if (cart.getItem() === item) {
            await options.close();
        }

        const spinner = new Spinner({
            parent: document.querySelector("#print"),
        });
        await spinner.open();

        if (cart.getItem() === item) {
            await Promise.all([options.reset(), files.reset()]);
            options.repaint();
            thumbs.clear();
            cart.setItem(null);
        }

        await cart.delete(item);
        cart.repaint();

        await spinner.close();

        const popup = new Popup({
            title: "¡Impresión eliminada!",
            message: "La impresión ha sido eliminada correctamente del carrito.",
            type: "success",
            timer: 3000,
        });
        await popup.open();

        if (!cart.length()) {
            await cart.close();
        }
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

        await options.close();

        const spinner = new Spinner({
            parent: document.querySelector("#print"),
        });
        await spinner.open();

        await cart.clear();
        cart.repaint();

        if (cart.getItem()) {
            await Promise.all([options.reset(), files.reset()]);
            options.repaint();
            thumbs.clear();
            cart.setItem(null);
        }

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

    const options = new Options({
        options: optionsDB[0],
        onChange: handleChangeOptions,
        onCreate: handleCreateItem,
        onUpdate: handleUpdateItem,
        onCancel: handleCancelItem,
    });
    options.init();

    const pdf = new Pdf();

    const files = new Files({
        files: filesDB.map((file) => new File(file)),
    });

    const inputFiles = new InputFiles({
        onInput: handleAddFiles,
    });

    const drop = new Drop({
        onDrop: handleAddFiles,
    });

    const thumbs = new Thumbs({
        onDelete: handleDeleteFile,
    });
    thumbs.show(files.get(), options.getValues());

    const cart = new Cart({
        cart: cartDB,
        onUpdate: handleUpdateCartItem,
        onDelete: handleDeleteCartItem,
        onClear: handleClearCart,
    });

    handleLoad();
};
