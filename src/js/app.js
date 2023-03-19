import Router from "./modules/Router";
import Navigator from "./classes/Navigator";

import { layout } from "./modules/Layout";

import { home } from "./modules/Home";
import { printer } from "./modules/Printer";
import { contact } from "./modules/Contact";

import { login } from "./modules/auth/Login";
import { logout } from "./modules/auth/Logout";
import { register } from "./modules/auth/Register";
import { confirm } from "./modules/auth/Confirm";
import { recover } from "./modules/auth/Recover";
import { restore } from "./modules/auth/Restore";

import { profile } from "./modules/Profile";
import { addresses } from "./modules/Addresses";
import { orders } from "./modules/Orders";
import { codes } from "./modules/Codes";
import { ordersAdmin } from "./modules/OrdersAdmin";

import { checkout } from "./modules/Checkout";
import { payment } from "./modules/Payment";

const router = Router();

router.add("/", home);
router.add("/imprimir", printer);
router.add("/contacto", contact);

router.add("/login", login);
router.add("/logout", logout);
router.add("/registro", register);
router.add("/confirmar/:token", confirm);
router.add("/recuperar", recover);
router.add("/restablecer/:token", restore);

router.add("/perfil", profile);
router.add("/direcciones", addresses);
router.add("/pedidos", orders);
router.add("/codigos", codes);
router.add("/pedidos-admin", ordersAdmin);

router.add("/checkout", checkout);
router.add("/pago", payment);

export const navigator = new Navigator({
    active: true,
    onLoad: () => {
        layout.init();
        router.check();
    },
});

// pulir css
// terminar landing page y contacto
// textos
