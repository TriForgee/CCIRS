/* =========================================================
   CCIRS — Campus Complaint & Issue Reporting System
   Team TriForge | Application behaviour (forms + widgets)
   ---------------------------------------------------------
   Loaded on every page that has a form, dropdown, password
   toggle or character counter. script.js handles the site
   chrome (navigation, header, year). This file handles data.

   Validation here is a convenience for the user only; the
   backend must validate everything again, since the browser
   can be bypassed. All DOM access is null-guarded.
   ========================================================= */

(function () {
    "use strict";

    /* ---------- Configuration (shared lists) ---------- */
    var CATEGORIES = [
        "Infrastructure", "Hostel", "Academics", "Transport",
        "Cafeteria", "Security", "IT & Internet", "Other"
    ];
    var DEPARTMENTS = [
        "Maintenance", "Administration", "Transport", "IT Services", "Student Affairs"
    ];
    var STATUSES = ["Pending", "In Progress", "Resolved"];

    /* ---------- Validators ---------- */
    var Patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        studentId: /^[A-Za-z0-9-]{3,20}$/
    };

    var Check = {
        required: function (label) {
            return function (value) {
                return value.trim() === "" ? label + " is required." : "";
            };
        },
        minLength: function (label, min) {
            return function (value) {
                return value.trim().length < min
                    ? label + " must be at least " + min + " characters." : "";
            };
        },
        maxLength: function (label, max) {
            return function (value) {
                return value.trim().length > max
                    ? label + " must be at most " + max + " characters." : "";
            };
        },
        pattern: function (regex, message) {
            return function (value) { return regex.test(value.trim()) ? "" : message; };
        },
        matches: function (otherId, message) {
            return function (value) {
                var other = document.getElementById(otherId);
                return other && value === other.value ? "" : message;
            };
        },
        strongPassword: function (value) {
            if (value.length < 8) return "Password must be at least 8 characters.";
            if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
                return "Password must include at least one letter and one number.";
            }
            return "";
        }
    };

    /* ---------- Field errors ---------- */
    function setFieldError(input, message) {
        if (!input) return;
        var error = document.getElementById(input.id + "-error");
        input.setAttribute("aria-invalid", "true");
        if (error) { error.textContent = message; error.hidden = false; }
    }

    function clearFieldError(input) {
        if (!input) return;
        var error = document.getElementById(input.id + "-error");
        input.removeAttribute("aria-invalid");
        if (error) { error.textContent = ""; error.hidden = true; }
    }

    function runChecks(input, checks) {
        if (!input) return true;
        for (var i = 0; i < checks.length; i++) {
            var message = checks[i](input.value);
            if (message) { setFieldError(input, message); return false; }
        }
        clearFieldError(input);
        return true;
    }

    function validateForm(rules) {
        var firstInvalid = null;
        Object.keys(rules).forEach(function (id) {
            var input = document.getElementById(id);
            if (!input) return;
            if (!runChecks(input, rules[id]) && !firstInvalid) firstInvalid = input;
        });
        if (firstInvalid) firstInvalid.focus();
        return !firstInvalid;
    }

    // Re-check a field on every keystroke once it has shown an error.
    function liveValidate(rules) {
        Object.keys(rules).forEach(function (id) {
            var input = document.getElementById(id);
            if (!input) return;
            var recheck = function () {
                if (input.hasAttribute("aria-invalid")) runChecks(input, rules[id]);
            };
            input.addEventListener("input", recheck);
            input.addEventListener("change", recheck);
        });
    }

    /* ---------- Alerts ---------- */
    function showAlert(box, type, message) {
        if (!box) return;
        box.className = "alert alert-" + type;
        box.textContent = message; // textContent, never innerHTML (XSS-safe)
        box.hidden = false;
        box.scrollIntoView({ block: "nearest" });
    }

    function hideAlert(box) {
        if (!box) return;
        box.hidden = true;
        box.textContent = "";
    }

    /* ---------- Loading button ---------- */
    function setLoading(button, isLoading, loadingText) {
        if (!button) return;
        if (isLoading) {
            button.dataset.label = button.textContent;
            button.textContent = loadingText || "Please wait...";
            button.disabled = true;
            button.classList.add("is-loading");
            button.setAttribute("aria-busy", "true");
        } else {
            if (button.dataset.label) button.textContent = button.dataset.label;
            button.disabled = false;
            button.classList.remove("is-loading");
            button.removeAttribute("aria-busy");
        }
    }

    // Placeholder for the real server call (connected in a later phase).
    function fakeRequest(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms || 700); });
    }

    /* ---------- Widgets ---------- */
    function fillSelect(select, items, placeholderText) {
        if (!select || !Array.isArray(items)) return;
        var first = document.createElement("option");
        first.value = "";
        first.textContent = placeholderText;
        select.append(first);
        items.forEach(function (item) {
            var option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            select.append(option);
        });
    }

    function initSelects() {
        var lists = { categories: CATEGORIES, departments: DEPARTMENTS, statuses: STATUSES };
        document.querySelectorAll("select[data-options]").forEach(function (select) {
            var items = lists[select.dataset.options];
            if (!items) return;
            fillSelect(select, items, select.dataset.placeholder || "Select");
        });
    }

    function initPasswordToggles() {
        document.querySelectorAll("[data-toggle-password]").forEach(function (button) {
            var input = document.getElementById(button.dataset.togglePassword);
            if (!input) return;
            button.setAttribute("aria-pressed", "false");
            button.addEventListener("click", function () {
                var reveal = input.type === "password";
                input.type = reveal ? "text" : "password";
                button.textContent = reveal ? "Hide" : "Show";
                button.setAttribute("aria-pressed", String(reveal));
            });
            if (input.form) {
                input.form.addEventListener("reset", function () {
                    input.type = "password";
                    button.textContent = "Show";
                    button.setAttribute("aria-pressed", "false");
                });
            }
        });
    }

    function initCharCounters() {
        document.querySelectorAll("[data-counter]").forEach(function (area) {
            var output = document.getElementById(area.dataset.counter);
            if (!output) return;
            var update = function () {
                output.textContent = area.value.length + " / " + area.maxLength;
            };
            area.addEventListener("input", update);
            if (area.form) area.form.addEventListener("reset", function () {
                setTimeout(update, 0);
            });
            update();
        });
    }

    /* ---------- Generic form handler ---------- */
    // Wires validation + fake submit to a form. `successMessage` shows after a
    // valid submit; `resetOnSuccess` clears the form (used by signup/complaint).
    function handleForm(formId, rules, loadingText, successMessage, resetOnSuccess) {
        var form = document.getElementById(formId);
        if (!form) return;
        var alertBox = document.getElementById("form-alert");
        var submitButton = document.getElementById("submit-btn");

        liveValidate(rules);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            hideAlert(alertBox);

            if (!validateForm(rules)) {
                showAlert(alertBox, "error", "Please fix the highlighted fields and try again.");
                return;
            }

            setLoading(submitButton, true, loadingText);
            fakeRequest().then(function () {
                setLoading(submitButton, false);
                showAlert(alertBox, "success", successMessage);
                if (resetOnSuccess) form.reset();
            });
        });
    }

    /* ---------- Per-page wiring ---------- */
    function initPage() {
        var page = document.body.getAttribute("data-page");

        if (page === "login") {
            var loginForm = document.getElementById("login-form");
            var role = loginForm ? loginForm.dataset.role : "student";
            handleForm(
                "login-form",
                {
                    email: [
                        Check.required("Email"),
                        Check.pattern(Patterns.email, "Enter a valid email address, like name@example.com.")
                    ],
                    password: [Check.required("Password")]
                },
                "Logging in...",
                "Form is valid. " + (role === "admin" ? "Admin" : "Student") +
                " login will be connected to the server in the next phase.",
                false
            );
        }

        if (page === "register") {
            var confirmInput = document.getElementById("confirm-password");
            var passwordInput = document.getElementById("password");
            var registerRules = {
                name: [
                    Check.required("Full name"),
                    Check.minLength("Full name", 2),
                    Check.maxLength("Full name", 60)
                ],
                "student-id": [
                    Check.required("Student ID"),
                    Check.pattern(Patterns.studentId,
                        "Student ID can use letters, numbers and dashes (3 to 20 characters).")
                ],
                email: [
                    Check.required("Email"),
                    Check.pattern(Patterns.email, "Enter a valid email address, like name@example.com.")
                ],
                password: [Check.required("Password"), Check.strongPassword],
                "confirm-password": [
                    Check.required("Password confirmation"),
                    Check.matches("password", "Passwords do not match.")
                ]
            };
            // Re-check the confirmation when the first password field changes.
            if (passwordInput && confirmInput) {
                passwordInput.addEventListener("input", function () {
                    if (confirmInput.hasAttribute("aria-invalid")) {
                        runChecks(confirmInput, registerRules["confirm-password"]);
                    }
                });
            }
            handleForm(
                "register-form",
                registerRules,
                "Creating account...",
                "Form is valid. Account creation will be connected to the server in the next phase.",
                true
            );
        }

        if (page === "complaint") {
            handleForm(
                "complaint-form",
                {
                    category: [Check.required("Category")],
                    description: [
                        Check.required("Description"),
                        Check.minLength("Description", 10),
                        Check.maxLength("Description", 1000)
                    ]
                },
                "Submitting...",
                "Form is valid. Saving the complaint to the server is connected in the next phase.",
                true
            );
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        initSelects();
        initPasswordToggles();
        initCharCounters();
        initPage();
    });
})();
