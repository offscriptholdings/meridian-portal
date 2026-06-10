/* ============================================================
   Auth — Login · Invite acceptance · Not-authorized gate
   window.Screens.Login / Invite / Gate
   ============================================================ */
(function () {
  const { e, Icon, Mark, Avatar, DATA } = window.MK;
  const { useState } = React;
  window.Screens = window.Screens || {};

  function GoogleG() {
    return e("svg", { width: 17, height: 17, viewBox: "0 0 48 48", "aria-hidden": true },
      e("path", { fill: "#FFC107", d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" }),
      e("path", { fill: "#FF3D00", d: "M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" }),
      e("path", { fill: "#4CAF50", d: "M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z" }),
      e("path", { fill: "#1976D2", d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z" }));
  }

  function ArcBg() {
    return e("svg", { className: "auth-arc", viewBox: "0 0 480 760", preserveAspectRatio: "xMidYMid slice", "aria-hidden": true },
      e("line", { x1: 0, y1: 600, x2: 480, y2: 600, stroke: "var(--rule)", strokeWidth: 1 }),
      e("line", { x1: 240, y1: 40, x2: 240, y2: 700, stroke: "var(--accent-line)", strokeWidth: 1, strokeDasharray: "2 7" }),
      e("path", { d: "M-40 600 Q240 120 520 600", stroke: "var(--rule-strong)", strokeWidth: 1, fill: "none" }),
      e("circle", { cx: 240, cy: 180, r: 16, fill: "var(--accent)" }),
      e("circle", { cx: 240, cy: 180, r: 28, fill: "none", stroke: "var(--accent-line)", strokeWidth: 1 }),
      e("circle", { cx: 95, cy: 470, r: 7, fill: "var(--ink-4)" }),
      e("circle", { cx: 385, cy: 470, r: 7, fill: "var(--ink-4)" }));
  }

  function Aside({ quote, src }) {
    return e("div", { className: "auth-aside" },
      e(ArcBg),
      e("div", { style: { position: "relative", zIndex: 1 } }, e(Mark, { size: 30 })),
      e("blockquote", { className: "qt", style: { position: "relative", zIndex: 1 } }, quote),
      e("div", { className: "src", style: { position: "relative", zIndex: 1 } }, src));
  }

  /* ---------------- LOGIN ---------------- */
  window.Screens.Login = function Login({ app }) {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    return e("div", { className: "auth-stage" },
      e(Aside, { quote: e(React.Fragment, null, "A calm, single place to see where things ", e("em", null, "stand"), "."),
        src: "Meridian Tech Co — client portal" }),
      e("div", { className: "auth-main" },
        e("div", { className: "auth-card reveal-up" },
          e("div", { className: "brand" }, e(Mark, { size: 30 }),
            e("div", { className: "name", style: { fontFamily: "var(--serif)", fontSize: 19, fontWeight: 300 } }, "Meridian")),
          sent
            ? e("div", { className: "magic-sent" },
                e("div", { className: "ic" }, e(Icon, { name: "mail", size: 22 })),
                e("h1", { style: { fontSize: 24 } }, "Check your inbox"),
                e("p", { className: "lede", style: { marginBottom: 6 } }, "We sent a sign-in link to ", e("b", { style: { color: "var(--ink)" } }, email || "your email"), ". It expires in 15 minutes."),
                e("button", { className: "btn btn-ghost", onClick: () => setSent(false) }, e(Icon, { name: "arrowL", size: 14, className: "ico" }), "Use a different method"))
            : e(React.Fragment, null,
                e("h1", null, "Sign in to your ", e("em", null, "portal")),
                e("p", { className: "lede" }, "Welcome back. Pick how you'd like to sign in."),
                e("button", { className: "btn btn-block gbtn", style: { height: "var(--control-h)" }, onClick: () => app.go("plan") },
                  e(GoogleG), "Continue with Google"),
                e("div", { className: "or" }, e("span", { className: "ln" }), "or", e("span", { className: "ln" })),
                e("div", { className: "field", style: { marginBottom: 12 } },
                  e("label", null, "Work email"),
                  e("input", { className: "input", type: "email", placeholder: "you@company.com", value: email, onChange: ev => setEmail(ev.target.value) })),
                e("button", { className: "btn btn-primary btn-block", onClick: () => setSent(true) },
                  e(Icon, { name: "mail", size: 15, className: "ico" }), "Email me a magic link")),
          e("div", { className: "fine" }, "Meridian's portal is invite-only. ", e("a", { href: "#", onClick: ev => { ev.preventDefault(); app.go("invite"); } }, "Have an invite?"), " Need access? ", e("a", { href: "#" }, "Contact David"), "."))));
  };

  /* ---------------- INVITE ACCEPTANCE ---------------- */
  window.Screens.Invite = function Invite({ app }) {
    return e("div", { className: "auth-stage" },
      e(Aside, { quote: e(React.Fragment, null, "You'll know ", e("em", null, "what it does"), ", what it costs, and what you own."),
        src: "Meridian — the promise" }),
      e("div", { className: "auth-main" },
        e("div", { className: "auth-card reveal-up" },
          e("div", { className: "invite-badge" }, e(Icon, { name: "mail", size: 13 }), "You've been invited"),
          e("h1", null, "Join ", e("em", null, DATA.client.name), "'s engagement"),
          e("p", { className: "lede" }, "David invited you to the Meridian portal for ", e("b", { style: { color: "var(--ink)" } }, DATA.client.name), ". Sign in to accept and see where things stand."),
          e("div", { className: "invite-who" },
            e(Avatar, { name: DATA.user.name, size: "lg" }),
            e("div", { className: "det" },
              e("div", { className: "nm" }, DATA.user.name),
              e("div", { className: "em" }, DATA.user.email))),
          e("button", { className: "btn btn-block gbtn", style: { marginBottom: 10 }, onClick: () => app.go("plan") }, e(GoogleG), "Accept & continue with Google"),
          e("button", { className: "btn btn-primary btn-block", onClick: () => app.go("plan") }, "Accept invitation"),
          e("div", { className: "fine" }, "Invited to the wrong place? ", e("a", { href: "#" }, "Let David know"), ".")) ));
  };

  /* ---------------- NOT-AUTHORIZED GATE ---------------- */
  window.Screens.Gate = function Gate({ app }) {
    return e("div", { className: "gate reveal-up" },
      e("div", { className: "mk" }, e(Mark, { size: 38 })),
      e("h1", null, "You're signed in — but not ", e("em", null, "set up yet")),
      e("p", null, "Your account doesn't have an engagement attached to it. This usually means David hasn't added you to a client workspace yet."),
      e("p", { style: { color: "var(--ink-3)", fontSize: 14 } }, "Reach out and he'll get you connected — it only takes a moment."),
      e("div", { style: { display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" } },
        e("button", { className: "btn btn-primary" }, e(Icon, { name: "mail", size: 15, className: "ico" }), "Contact David"),
        e("button", { className: "btn", onClick: () => app.go("login") }, "Back to sign in")),
      e("div", { className: "who" }, "Signed in as ", DATA.user.email));
  };
})();
