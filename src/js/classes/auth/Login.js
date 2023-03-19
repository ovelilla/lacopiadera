import Input from "../mio/Input";
import IconButton from "../mio/IconButton";
import Checkbox from "../mio/Checkbox";
import LoadingButton from "../LoadingButton";
import Popup from "../Popup";
import { icons } from "../../modules/Icons";
import { api } from "../../modules/Api";
import { navigator } from "../../app";

class Login {
    constructor({ req }) {
        this.values = {
            email: "",
            currentPassword: "",
            remember: false,
        };

        this.errors = {
            email: "",
            currentPassword: "",
        };

        this.req = req;
        this.form = null;
        this.submitBtn = null;
        this.passwordHidden = true;
    }

    create() {
        const login = document.querySelector("#login");

        this.form = document.createElement("form");
        this.form.classList.add("mio-form");
        this.form.noValidate = true;
        this.form.addEventListener("submit", this.handleSubmit.bind(this));
        login.appendChild(this.form);

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
                value: this.values.email,
            },
            error: this.errors.email.length > 0,
            message: this.errors.email,
            onInput: (value) => {
                this.values.email = value;
                this.errors.email = "";
            },
        });
        this.form.appendChild(email.getField());

        const visibility = new IconButton({
            ariaLabel: "Mostrar contraseña",
            buttonSize: "medium",
            svgSize: "large",
            icon: icons.get(`${this.passwordHidden ? "eyeFill" : "eyeSlashFill"}`),
            onClick: () => {
                this.passwordHidden = !this.passwordHidden;
                this.repaint();
            },
        });

        const currentPassword = new Input({
            label: {
                text: "Contraseña",
                for: "currentPassword",
            },
            input: {
                type: `${this.passwordHidden ? "password" : "text"}`,
                name: "currentPassword",
                id: "currentPassword",
                autocomplete: "current-password",
                value: this.values.currentPassword,
            },
            adornment: visibility.get(),
            error: this.errors.currentPassword.length > 0,
            message: this.errors.currentPassword,
            onInput: (value) => {
                this.values.currentPassword = value;
                this.errors.currentPassword = "";
            },
        });
        this.form.appendChild(currentPassword.getField());

        const remeber = new Checkbox({
            label: {
                text: "Recuérdame",
                for: "remember",
            },
            input: {
                name: "remember",
                id: "remember",
                value: this.values.remember,
            },
            onClick: (value) => {
                this.values.remember = value;
                this.repaint();
            },
        });
        this.form.appendChild(remeber.getField());

        const submitField = document.createElement("div");
        submitField.classList.add("mio-field");
        this.form.appendChild(submitField);

        this.submitBtn = new LoadingButton({
            type: "submit",
            text: "Iniciar sesión",
            classes: ["btn", "primary-btn"],
        });
        submitField.appendChild(this.submitBtn.get());
    }

    async handleSubmit(e) {
        e.preventDefault();

        const response = await api.post("/api/user/login", this.values);

        this.submitBtn.stop();

        if (response.status === "error") {
            this.setErrors(response.errors);
            this.repaint();
            return;
        }

        const popup = new Popup({
            title: `¡Bienvenido ${response.user.name}!`,
            message: `${
                this.req.path === "checkout"
                    ? "Puedes seguir con el proceso de compra"
                    : "Te vamos a redirigir a la página principal"
            }`,
            type: "success",
            timer: 4000,
        });
        await popup.open();

        if (this.req.path === "checkout") {
            navigator.reload();
            return;
        }

        navigator.goTo("/");
    }

    setErrors(responseErrors) {
        for (const key of Object.keys(responseErrors)) {
            if (this.errors[key] !== undefined) {
                this.errors[key] = responseErrors[key];
            }
        }
    }

    repaint() {
        this.form.remove();
        this.create();
    }
}

export default Login;
