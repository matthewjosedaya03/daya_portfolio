/* ==========================================================================
   ANIMATIONS.JS
   GSAP entrance timeline, ScrollTrigger reveals, skill bars, and parallax.
   Falls back to fully visible, static content when motion is reduced or GSAP
   is unavailable.
   ========================================================================== */
(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Reveal skill values immediately for reduced-motion / no-GSAP users. */
    const finalizeSkills = () => {
        document.querySelectorAll(".skill").forEach((skill) => {
            const fill = skill.querySelector(".skill-fill");
            const value = skill.querySelector(".skill-value");
            const level = Number(value?.dataset.level || 0);

            if (fill) fill.style.transform = "scaleX(1)";
            if (value) value.textContent = `${level}%`;
        });
    };

    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
        finalizeSkills();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const revealConfig = (trigger, start = "top 88%") => ({
        trigger,
        start,
        toggleActions: "play none none reverse"
    });

    /* ----------------------------------------------------------------------
       Hero entrance timeline
       ---------------------------------------------------------------------- */
    const heroTimeline = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 }
    });

    heroTimeline
        .from(".site-header", { y: -24, opacity: 0, duration: 0.6 })
        .from(".hero-eyebrow", { y: 18, opacity: 0, duration: 0.6 }, "-=0.25")
        .from(".hero-title", { y: 32, opacity: 0, duration: 0.9 }, "-=0.35")
        .from(".hero-role", { y: 20, opacity: 0 }, "-=0.6")
        .from(".hero-location", { y: 16, opacity: 0 }, "-=0.65")
        .from(".hero-actions", { y: 18, opacity: 0 }, "-=0.6")
        .from(".hero-socials", { y: 14, opacity: 0 }, "-=0.6")
        .from(".portrait-frame", { scale: 0.88, opacity: 0, duration: 1.1 }, "<-0.45");

    /* ----------------------------------------------------------------------
       Generic in-view reveals
       ---------------------------------------------------------------------- */
    gsap.utils.toArray("[data-reveal]").forEach((element) => {
        gsap.from(element, {
            y: 36,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: revealConfig(element)
        });
    });

    /* Hobbies: staggered reveal */
    const hobbyItems = gsap.utils.toArray(".hobby-item");
    if (hobbyItems.length) {
        gsap.from(hobbyItems, {
            y: 24,
            opacity: 0,
            duration: 0.6,
            stagger: 0.07,
            ease: "power2.out",
            scrollTrigger: revealConfig(".hobby-list", "top 85%")
        });
    }

    /* Skills: cards fade in, then bars fill and counters count up */
    gsap.from(".skill", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: revealConfig(".skill-list", "top 85%")
    });

    gsap.utils.toArray(".skill").forEach((skill) => {
        const fill = skill.querySelector(".skill-fill");
        const value = skill.querySelector(".skill-value");
        if (!fill || !value) return;

        const level = Number(value.dataset.level || 0);
        const counter = { value: 0 };

        gsap.set(fill, { scaleX: 0 });
        value.textContent = "0%";

        const barTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: skill,
                start: "top 88%",
                toggleActions: "play none none reverse"
            }
        });

        barTimeline
            .to(fill, { scaleX: 1, duration: 1.3, ease: "power3.out" }, 0)
            .to(
                counter,
                {
                    value: level,
                    duration: 1.3,
                    ease: "power3.out",
                    onUpdate: () => {
                        value.textContent = `${Math.round(counter.value)}%`;
                    }
                },
                0
            );
    });

    /* Projects: staggered card reveal */
    gsap.from(".project-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: revealConfig(".project-grid", "top 82%")
    });

    /* Education: timeline entries and line draw */
    gsap.from(".timeline-item", {
        y: 32,
        opacity: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: revealConfig(".timeline", "top 82%")
    });

    const timelineLine = document.querySelector(".timeline-line");
    if (timelineLine) {
        gsap.fromTo(
            timelineLine,
            { scaleY: 0 },
            {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".timeline-wrap",
                    start: "top 75%",
                    end: "bottom 65%",
                    scrub: 0.6
                }
            }
        );
    }

    /* Ambient blobs drift subtly as the page scrolls */
    gsap.utils.toArray(".blob").forEach((blob, index) => {
        gsap.to(blob, {
            yPercent: index % 2 === 0 ? 18 : -14,
            xPercent: index % 2 === 0 ? -6 : 7,
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2
            }
        });
    });

    /* Recalculate trigger positions once images and fonts have settled. */
    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
    });
})();
