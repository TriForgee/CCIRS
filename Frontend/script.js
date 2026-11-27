/* =========================================================
   CCIRS — Campus Complaint & Issue Reporting System
   Team TriForge | Front-end behaviour
   ---------------------------------------------------------
   - Mobile navigation (toggle, close on link / Escape / outside / resize)
   - Sticky-header elevation on scroll
   - Scroll spy (active navigation link)
   - Auto-updating footer year
   All DOM access is null-guarded so the script never throws.
   ========================================================= */

(function () {
    "use strict";

    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");

    /* ---------- Mobile navigation ---------- */
    function closeMenu() {
        if (!toggle || !menu) {
            return;
        }
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
    }

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            var isOpen = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!isOpen));
            menu.classList.toggle("is-open", !isOpen);
        });

        // Close after choosing a menu item (mobile)
        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeMenu);
        });

        // Close on Escape
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        // Close when clicking outside the open menu
        document.addEventListener("click", function (event) {
            if (!menu.classList.contains("is-open")) {
                return;
            }
            if (menu.contains(event.target) || toggle.contains(event.target)) {
                return;
            }
            closeMenu();
        });

        // Reset when resizing up to desktop
        window.addEventListener("resize", function () {
            if (window.innerWidth > 860) {
                closeMenu();
            }
        });
    }

    /* ---------- Sticky-header elevation ---------- */
    if (header) {
        var updateHeader = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };
        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });
    }

    /* ---------- Scroll spy (active nav link) ---------- */
    var navLinks = menu
        ? Array.prototype.slice.call(menu.querySelectorAll('.nav-links a[href^="#"]'))
        : [];

    if (navLinks.length && "IntersectionObserver" in window) {
        var linkMap = {};
        var sections = [];

        navLinks.forEach(function (link) {
            var id = link.getAttribute("href").slice(1);
            var section = id ? document.getElementById(id) : null;
            if (section) {
                linkMap[id] = link;
                sections.push(section);
            }
        });

        var setActive = function (id) {
            navLinks.forEach(function (link) {
                link.classList.remove("is-active");
                link.removeAttribute("aria-current");
            });
            var active = linkMap[id];
            if (active) {
                active.classList.add("is-active");
                active.setAttribute("aria-current", "true");
            }
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setActive(entry.target.id);
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
})();
