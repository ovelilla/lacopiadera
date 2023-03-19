import Cart from "../classes/Cart";
import Steps from "../classes/Steps";

export const payment = async (req) => {
    const handleLoad = async () => {
        steps.init();
    };

    const cart = new Cart({
        cart: [],
        onUpdate: () => {},
        onDelete: () => {},
        onClear: () => {},
    });

    const steps = new Steps({
        index: 3,
        disabled: true,
        onClick: () => {},
    });

    handleLoad();
};
