/* ==========================================================================
   FORM.JS
   Accessible client-side validation and a mailto fallback for the contact form.
   ========================================================================== */
(() => {
    "use strict";

    /* ----------------------------------------------------------------------
       EDIT BEFORE PUBLISHING
       Replace YOUR_EMAIL_HERE with the address that should receive messages.
       ---------------------------------------------------------------------- */
    const RECIPIENT_EMAIL = "YOUR_EMAIL_HERE";

    const form = document.getElementById("contact-form");
    if (!form) return;

    const toast = document.getElementById("toast");
    const status = document.getElementById("form-status");
    let toastTimer;

    const showToast = (message, isError = false) => {
        if (!toast) return;

        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.toggle("is-error", isError);
        toast.classList.add("is-visible");

        toastTimer = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 5200);
    };

    const fields = {
        name: {
            input: form.querySelector("#name"),
            error: form.querySelector("#name-error"),
            validate: (value) => value.trim().length >= 2 || "Please enter at least 2 characters."
        },
        email: {
            input: form.querySelector("#email"),
            error: form.querySelector("#email-error"),
            validate: (value) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Please enter a valid email address."
        },
        subject: {
            input: form.querySelector("#subject"),
            error: form.querySelector("#subject-error"),
            validate: (value) => value.trim().length >= 3 || "Please add a short subject."
        },
        message: {
            input: form.querySelector("#message"),
            error: form.querySelector("#message-error"),
            validate: (value) => value.trim().length >= 10 || "Please write at least 10 characters."
        }
    };

    const setFieldError = (field, message) => {
        if (!field.input || !field.error) return;

        field.error.textContent = message || "";
        field.input.setAttribute("aria-invalid", message ? "true" : "false");
        field.input.closest(".field")?.classList.toggle("has-error", Boolean(message));
    };

    const validateField = (field) => {
        if (!field.input) return true;

        const result = field.validate(field.input.value || "");
        const message = result === true ? "" : result;
        setFieldError(field, message);

        return !message;
    };

    Object.values(fields).forEach((field) => {
        if (!field.input) return;

        /* Clear an error as soon as the visitor starts fixing it. */
        field.input.addEventListener("input", () => {
            if (field.error?.textContent) setFieldError(field, "");
        });

        /* Validate once the visitor leaves a field. */
        field.input.addEventListener("blur", () => {
            if (field.input.value.trim()) validateField(field);
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (status) status.textContent = "";

        const entries = Object.values(fields);
        const isValid = entries.map(validateField).every(Boolean);
        const firstInvalid = entries.find(
            (field) => field.input?.getAttribute("aria-invalid") === "true"
        );

        if (!isValid) {
            firstInvalid?.input?.focus();
            showToast("Please correct the highlighted fields.", true);
            return;
        }

        /* The placeholder keeps the form honest until a real address is set. */
        if (RECIPIENT_EMAIL === "YOUR_EMAIL_HERE") {
            const message = "Form email is not configured yet. Please reach out via GitHub or Facebook.";
            if (status) status.textContent = message;
            showToast(message, true);
            return;
        }

        const data = Object.fromEntries(new FormData(form).entries());
        const subject = encodeURIComponent(`Portfolio contact — ${data.subject}`);
        const body = encodeURIComponent(
            `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
        );

        if (status) status.textContent = "Opening your email app…";
        showToast("Opening your email app…");

        window.location.href = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
    });
})();
