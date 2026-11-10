/* ==========================================================================
   MAIN.JS
   Global interface behavior: header state, mobile navigation, active links,
   footer year, and image fallbacks.
   ========================================================================== */
(() => {
    "use strict";

    const MOBILE_QUERY = window.matchMedia("(max-width: 820px)");
    document.body.classList.add("js");

    /* ----------------------------------------------------------------------
       Footer year
       ---------------------------------------------------------------------- */
    const yearTarget = document.getElementById("year");
    if (yearTarget) {
        yearTarget.textContent = String(new Date().getFullYear());
    }

    /* ----------------------------------------------------------------------
       Header elevation on scroll
       ---------------------------------------------------------------------- */
    const header = document.getElementById("site-header");

    const syncHeader = () => {
        if (!header) return;
        header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    /* ----------------------------------------------------------------------
       Mobile navigation
       ---------------------------------------------------------------------- */
    const navToggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("primary-nav");

    const isNavOpen = () => Boolean(nav && nav.classList.contains("is-open"));

    const setNav = (open, returnFocus = false) => {
        if (!nav || !navToggle) return;

        nav.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", String(open));
        navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        document.body.classList.toggle("nav-open", open);

        if (!open && returnFocus) {
            navToggle.focus();
        }
    };

    navToggle?.addEventListener("click", () => {
        setNav(!isNavOpen());
    });

    /* Close the mobile menu after choosing a destination. */
    nav?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setNav(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isNavOpen()) {
            setNav(false, true);
        }
    });

    /* Close when clicking outside the menu. */
    document.addEventListener("click", (event) => {
        if (!isNavOpen() || !nav || !navToggle) return;
        if (!nav.contains(event.target) && !navToggle.contains(event.target)) {
            setNav(false);
        }
    });

    /* Reset the menu when resizing to the desktop layout. */
    MOBILE_QUERY.addEventListener?.("change", (event) => {
        if (!event.matches) setNav(false);
    });

    /* ----------------------------------------------------------------------
       Active section highlighting (nav links for About, Education, Contact)
       ---------------------------------------------------------------------- */
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const sectionIds = navLinks
        .map((link) => link.getAttribute("href")?.replace("#", ""))
        .filter(Boolean);
    const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    navLinks.forEach((link) => {
                        const active = link.getAttribute("href") === `#${entry.target.id}`;
                        link.classList.toggle("is-active", active);

                        if (active) {
                            link.setAttribute("aria-current", "true");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
        );

        sections.forEach((section) => observer.observe(section));
    }

    /* ----------------------------------------------------------------------
       Image fallbacks
       If logo_portfolio.png is missing or fails to load, show initials.
       ---------------------------------------------------------------------- */
    const attachFallback = (image, host) => {
        if (!image || !host) return;

        const showFallback = () => host.classList.add("is-fallback");

        if (image.complete && image.naturalWidth === 0) {
            showFallback();
        }

        image.addEventListener("error", showFallback, { once: true });
    };

    document.querySelectorAll(".brand-logo").forEach((host) => {
        attachFallback(host.querySelector("img"), host);
    });

    const portrait = document.querySelector(".portrait");
    attachFallback(portrait?.querySelector("img"), portrait);
})();
