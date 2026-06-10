/* ============================================================
   Meridian Client Portal — app shell, harness & router
   ============================================================ */
(function () {
  const { e, Icon, Mark, Avatar, DATA } = window.MK;
  const S = window.Screens;
  const { useState, useEffect, useRef } = React;

  /* ---------------- screen registry ---------------- */
  const SCREENS = {
    plan:        { label: "Project plan", group: "Client", shell: "client", path: "/plan", comp: S.ClientPlan },
    tickets:     { label: "Tickets", group: "Client", shell: "client", path: "/tickets", comp: S.ClientTickets },
    docs:        { label: "Documents", group: "Client", shell: "client", path: "/documents", comp: S.ClientDocs },
    admin:       { label: "Dashboard", group: "Admin", shell: "admin", path: "/admin", comp: S.AdminDash },
    adminclients:{ label: "Client management", group: "Admin", shell: "admin", path: "/admin/clients", comp: S.AdminClients },
    admintickets:{ label: "Ticket queue", group: "Admin", shell: "admin", path: "/admin/tickets", comp: S.AdminTickets },
    admindocs:   { label: "Documents", group: "Admin", shell: "admin", path: "/admin/documents", comp: S.AdminDocs },
    login:       { label: "Login", group: "Auth", shell: "auth", path: "/login", comp: S.Login },
    invite:      { label: "Invite acceptance", group: "Auth", shell: "auth", path: "/invite/x7f2", comp: S.Invite },
    gate:        { label: "Not-authorized gate", group: "Auth", shell: "auth", path: "/no-engagement", comp: S.Gate },
  };
  const GROUPS = ["Client", "Admin", "Auth"];

  const CLIENT_NAV = [
    { key: "plan", label: "Project plan", icon: "plan" },
    { key: "tickets", label: "Requests", icon: "tickets", count: 2 },
    { key: "docs", label: "Documents", icon: "docs" },
  ];
  const ADMIN_NAV = [
    { key: "admin", label: "Overview", icon: "dashboard" },
    { key: "adminclients", label: "Clients", icon: "clients" },
    { key: "admintickets", label: "Queue", icon: "inbox", count: 5 },
    { key: "admindocs", label: "Documents", icon: "docs" },
  ];

  /* ---------------- harness: screen picker ---------------- */
  function ScreenPicker({ screen, onPick }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      function h(ev) { if (ref.current && !ref.current.contains(ev.target)) setOpen(false); }
      document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
    }, []);
    const cur = SCREENS[screen];
    return e("div", { className: "picker", ref },
      e("button", { className: "picker-btn", onClick: () => setOpen(o => !o) },
        e("span", { className: "k" }, cur.group),
        e("span", { className: "v" }, cur.label),
        e(Icon, { name: "chevUD", size: 15, className: "chev" })),
      open && e("div", { className: "menu" },
        GROUPS.map(g => e("div", { className: "menu-group", key: g },
          e("div", { className: "menu-label" }, g),
          Object.keys(SCREENS).filter(k => SCREENS[k].group === g).map((k, i) =>
            e("button", { className: "menu-item", key: k, "aria-current": k === screen,
              onClick: () => { onPick(k); setOpen(false); } },
              e("span", { className: "num" }, String(i + 1).padStart(2, "0")),
              e("span", { className: "lab" }, SCREENS[k].label),
              k === screen && e(Icon, { name: "check", size: 15, className: "tick" })))))));
  }

  function StatePicker({ value, onChange }) {
    const opts = [["ready", "Populated"], ["empty", "Empty"], ["loading", "Loading"], ["error", "Error"]];
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      function h(ev) { if (ref.current && !ref.current.contains(ev.target)) setOpen(false); }
      document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
    }, []);
    return e("div", { className: "picker", ref },
      e("button", { className: "picker-btn", style: { minWidth: 150 }, onClick: () => setOpen(o => !o) },
        e("span", { className: "k" }, "State"),
        e("span", { className: "v" }, (opts.find(o => o[0] === value) || opts[0])[1]),
        e(Icon, { name: "chevUD", size: 15, className: "chev" })),
      open && e("div", { className: "menu", style: { width: 180 } },
        opts.map(([v, l]) => e("button", { className: "menu-item", key: v, "aria-current": v === value,
          onClick: () => { onChange(v); setOpen(false); } },
          e("span", { className: "lab" }, l),
          v === value && e(Icon, { name: "check", size: 15, className: "tick" })))));
  }

  /* ---------------- tenant switcher (admin) ---------------- */
  function TenantSwitcher({ mobile }) {
    const [open, setOpen] = useState(false);
    const [cur, setCur] = useState(DATA.clients[0]);
    const ref = useRef(null);
    useEffect(() => {
      function h(ev) { if (ref.current && !ref.current.contains(ev.target)) setOpen(false); }
      document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
    }, []);
    return e("div", { className: "tenant", ref },
      e("button", { className: "tenant-btn", onClick: () => setOpen(o => !o) },
        e(Avatar, { name: cur.name, size: "sm" }),
        e("div", { className: "info" },
          e("div", { className: "nm" }, cur.name),
          e("div", { className: "meta" }, "Viewing · all clients")),
        e(Icon, { name: "chevUD", size: 15, className: "chev" })),
      open && e("div", { className: "tenant-menu" },
        e("div", { className: "menu-label" }, "Switch client"),
        DATA.clients.map(c => e("button", { className: "tenant-opt", key: c.code, onClick: () => { setCur(c); setOpen(false); } },
          e(Avatar, { name: c.name, size: "sm" }),
          e("div", { className: "info" }, e("div", { className: "nm" }, c.name), e("div", { className: "meta" }, c.code, " · ", c.phase)),
          c.code === cur.code ? e(Icon, { name: "check", size: 15, className: "tick" }) : (c.open ? e("span", { className: "q" }, c.open) : null)))));
  }

  /* ---------------- shells ---------------- */
  function NavLink({ item, screen, onNav }) {
    return e("button", { className: "navlink", "aria-current": item.key === screen, onClick: () => onNav(item.key) },
      e(Icon, { name: item.icon, size: 18 }),
      e("span", { className: "t" }, item.label),
      item.count != null && e("span", { className: "count" }, item.count));
  }

  function ClientShellDesktop({ app, children }) {
    const cur = SCREENS[app.screen];
    return e("div", { className: "shell" },
      e("aside", { className: "sidebar" },
        e("div", { className: "sb-brand" }, e(Mark, { size: 30 }),
          e("div", { className: "org" }, e("div", { className: "co" }, DATA.client.name), e("div", { className: "by" }, "via Meridian"))),
        e("nav", { className: "sb-nav" }, CLIENT_NAV.map(it => e(NavLink, { key: it.key, item: it, screen: app.screen, onNav: app.go }))),
        e("div", { className: "sb-foot" },
          e("div", { className: "userchip" }, e(Avatar, { name: DATA.user.name, size: "sm" }),
            e("div", { className: "who" }, e("div", { className: "nm" }, DATA.user.name), e("div", { className: "rl" }, "Client")),
            e(Icon, { name: "settings", size: 16, className: "gear" })))),
      e("div", { className: "main" },
        e("div", { className: "topline" },
          e("div", { className: "crumb" }, DATA.client.name, " ", e("span", { style: { color: "var(--ink-4)", margin: "0 8px" } }, "/"), " ", e("b", null, cur.label)),
          e("div", { className: "actions" },
            e("button", { className: "iconbtn", title: "Search" }, e(Icon, { name: "search", size: 18 })),
            e("button", { className: "btn btn-sm", onClick: () => app.go("login") }, e(Icon, { name: "logout", size: 14, className: "ico" }), "Sign out"))),
        e("div", { className: "content" }, e("div", { className: "content-inner" }, children))));
  }

  function ClientShellMobile({ app, children }) {
    return e("div", { className: "mshell" },
      e("div", { className: "mtop" },
        e(Mark, { size: 28 }),
        e("div", { className: "org" }, e("div", { className: "co" }, DATA.client.name), e("div", { className: "by" }, "via Meridian")),
        e("div", { className: "mt-actions" }, e("button", { className: "iconbtn" }, e(Icon, { name: "search", size: 18 })))),
      e("div", { className: "mcontent" }, children),
      e("nav", { className: "mbottomnav" },
        CLIENT_NAV.map(it => e("button", { className: "mnav-item", key: it.key, "aria-current": it.key === app.screen, onClick: () => app.go(it.key) },
          e("span", { className: it.count ? "badge-dot" : "" }, e(Icon, { name: it.icon, size: 22 })),
          e("span", { className: "ml" }, it.label)))));
  }

  function AdminShellDesktop({ app, children }) {
    const cur = SCREENS[app.screen];
    return e("div", { className: "shell" },
      e("aside", { className: "sidebar" },
        e("div", { className: "sb-brand", style: { paddingBottom: 14 } }, e(Mark, { size: 30 }),
          e("div", { className: "org" }, e("div", { className: "co" }, "Meridian"), e("div", { className: "by" }, "Admin console"))),
        e("div", { style: { padding: "0 4px 8px" } }, e(TenantSwitcher, null)),
        e("nav", { className: "sb-nav" },
          e("div", { className: "sb-sectlabel" }, "Across all clients"),
          ADMIN_NAV.map(it => e(NavLink, { key: it.key, item: it, screen: app.screen, onNav: app.go }))),
        e("div", { className: "sb-foot" },
          e("div", { className: "userchip" }, e(Avatar, { name: DATA.admin.name, accent: true, size: "sm" }),
            e("div", { className: "who" }, e("div", { className: "nm" }, "David"), e("div", { className: "rl" }, "Principal")),
            e(Icon, { name: "settings", size: 16, className: "gear" })))),
      e("div", { className: "main" },
        e("div", { className: "topline" },
          e("div", { className: "crumb" }, "Admin", " ", e("span", { style: { color: "var(--ink-4)", margin: "0 8px" } }, "/"), " ", e("b", null, cur.label)),
          e("div", { className: "actions" },
            e("button", { className: "btn btn-sm", onClick: () => app.go("plan") }, e(Icon, { name: "eye", size: 14, className: "ico" }), "View as client"),
            e("button", { className: "iconbtn", title: "Sign out", onClick: () => app.go("login") }, e(Icon, { name: "logout", size: 18 })))),
        e("div", { className: "content" }, e("div", { className: "content-inner" }, children))));
  }

  function AdminShellMobile({ app, children }) {
    return e("div", { className: "mshell" },
      e("div", { className: "mtop", style: { paddingBottom: 10 } },
        e(Mark, { size: 28 }),
        e("div", { className: "org" }, e("div", { className: "co" }, "Meridian"), e("div", { className: "by" }, "Admin console"))),
      e("div", { style: { padding: "10px 18px 0" } }, e(TenantSwitcher, { mobile: true })),
      e("div", { className: "mcontent", style: { paddingTop: 16 } }, children),
      e("nav", { className: "mbottomnav" },
        ADMIN_NAV.map(it => e("button", { className: "mnav-item", key: it.key, "aria-current": it.key === app.screen, onClick: () => app.go(it.key) },
          e("span", { className: it.count ? "badge-dot" : "" }, e(Icon, { name: it.icon, size: 22 })),
          e("span", { className: "ml" }, it.label)))));
  }

  /* ---------------- viewport frames ---------------- */
  function Rect(p) { return e("rect", p); }
  function StatusBar() {
    const signal = e("svg", { viewBox: "0 0 18 12", fill: "none" },
      Rect({ x: 0.5, y: 2, width: 3, height: 8, rx: 1, fill: "currentColor" }),
      Rect({ x: 5, y: 0.5, width: 3, height: 9.5, rx: 1, fill: "currentColor" }),
      Rect({ x: 9.5, y: 4, width: 3, height: 6, rx: 1, fill: "currentColor", opacity: 0.9 }),
      Rect({ x: 14, y: 6, width: 3, height: 4, rx: 1, fill: "currentColor", opacity: 0.4 }));
    const battery = e("svg", { viewBox: "0 0 24 12", fill: "none" },
      Rect({ x: 1, y: 1, width: 20, height: 10, rx: 3, stroke: "currentColor", opacity: 0.5 }),
      Rect({ x: 2.5, y: 2.5, width: 14, height: 7, rx: 1.5, fill: "currentColor" }),
      Rect({ x: 22, y: 4, width: 1.5, height: 4, rx: 1, fill: "currentColor", opacity: 0.5 }));
    return e("div", { className: "statusbar" },
      e("span", null, "9:41"),
      e("span", { className: "sb-right" }, signal, battery));
  }

  function DesktopFrame({ path, children }) {
    return e("div", { className: "viewport-desktop grain" },
      e("div", { className: "winbar" },
        e("div", { className: "dots" }, e("i"), e("i"), e("i")),
        e("div", { className: "addr" }, e(Icon, { name: "lock", size: 11, className: "lock" }), "portal.meridian.example", e("span", { style: { color: "var(--ink-4)" } }, path))),
      e("div", { className: "portal" }, children));
  }
  function MobileFrame({ children }) {
    return e("div", { className: "viewport-mobile" },
      e("div", { className: "device-screen grain" },
        e("div", { className: "device-notch" }),
        e(StatusBar),
        e("div", { className: "portal is-mobile" }, children)));
  }

  /* ---------------- Toast ---------------- */
  function Toast({ msg }) {
    if (!msg) return null;
    return e("div", { className: "toast", key: msg.id }, e(Icon, { name: "checkCircle", size: 18, className: "ic" }), msg.text);
  }

  /* ---------------- root ---------------- */
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "dark",
    "density": "comfortable",
    "accent": "#e36a2c",
    "grain": true,
    "heroLayout": "status"
  }/*EDITMODE-END*/;

  function App() {
    const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
    const [screen, setScreen] = useState("plan");
    const [vp, setVp] = useState("desktop");
    const [dataState, setDataState] = useState("ready");
    const [toast, setToast] = useState(null);
    const rootRef = useRef(null);

    const isMobile = vp === "mobile";
    const cur = SCREENS[screen];

    // apply presentation tweaks
    useEffect(() => {
      const r = rootRef.current; if (!r) return;
      r.setAttribute("data-theme", t.theme);
      r.setAttribute("data-density", t.density);
      r.setAttribute("data-grain", t.grain ? "on" : "off");
      r.style.setProperty("--accent", t.accent);
      r.style.setProperty("--accent-soft", hexA(t.accent, t.theme === "light" ? 0.12 : 0.14));
      r.style.setProperty("--accent-line", hexA(t.accent, t.theme === "light" ? 0.30 : 0.34));
    }, [t.theme, t.density, t.grain, t.accent]);

    function showToast(text) {
      const m = { id: Date.now(), text };
      setToast(m);
      setTimeout(() => setToast(c => (c && c.id === m.id ? null : c)), 2600);
    }
    function go(key) { setScreen(key); setDataState("ready"); }
    function retry() { setDataState("loading"); setTimeout(() => setDataState("ready"), 1100); }

    const app = { screen, isMobile, vp, dataState, tweaks: t, setTweak, go, toast: showToast, retry };

    // build the active screen body
    const body = e(cur.comp, { app });
    let framedInner;
    if (cur.shell === "auth") {
      framedInner = e("div", { className: "portal-scroll", style: { overflow: "hidden", height: "100%" } }, body);
    } else if (cur.shell === "admin") {
      framedInner = isMobile ? e(AdminShellMobile, { app }, body) : e(AdminShellDesktop, { app }, body);
    } else {
      framedInner = isMobile ? e(ClientShellMobile, { app }, body) : e(ClientShellDesktop, { app }, body);
    }
    framedInner = e(React.Fragment, null, framedInner, e(Toast, { msg: toast }));

    const frame = isMobile ? e(MobileFrame, null, framedInner) : e(DesktopFrame, { path: cur.path }, framedInner);

    return e("div", { className: "harness", ref: rootRef, "data-theme": t.theme, "data-density": t.density },
      e("div", { className: "bar" },
        e("div", { className: "bar-brand" }, e(Mark, { size: 26 }),
          e("span", { className: "name" }, "Meridian"),
          e("span", { className: "tag" }, "Client Portal · Prototype")),
        e("div", { className: "bar-spacer" }),
        e(ScreenPicker, { screen, onPick: go }),
        e(StatePicker, { value: dataState, onChange: setDataState }),
        e("div", { className: "bar-sep" }),
        e("button", { className: "iconbtn", title: "Toggle theme", onClick: () => setTweak("theme", t.theme === "dark" ? "light" : "dark") },
          e(Icon, { name: t.theme === "dark" ? "sun" : "moon", size: 18 })),
        e("div", { className: "seg", role: "group", "aria-label": "Viewport" },
          e("button", { "aria-pressed": vp === "desktop", onClick: () => setVp("desktop") }, e(Icon, { name: "desktop", size: 14 }), "Desktop"),
          e("button", { "aria-pressed": vp === "mobile", onClick: () => setVp("mobile") }, e(Icon, { name: "mobile", size: 14 }), "Mobile"))),
      e("div", { className: "stage " + (isMobile ? "vp-mobile" : "vp-desktop") },
        e("div", { className: "frame-label" },
          e("span", null, cur.group, " · ", cur.label),
          e("span", { className: "ln" }),
          e("span", null, isMobile ? "390 × 800" : "1180 × 760")),
        frame),
      // Tweaks panel (host-toggled)
      e(window.TweaksPanel, { title: "Tweaks" },
        e(window.TweakSection, { label: "Theme" }),
        e(window.TweakRadio, { label: "Mode", value: t.theme, options: ["dark", "light"], onChange: v => setTweak("theme", v) }),
        e(window.TweakColor, { label: "Accent", value: t.accent,
          options: ["#e36a2c", "#c4561d", "#b8451a", "#9a7b3f"], onChange: v => setTweak("accent", v) }),
        e(window.TweakToggle, { label: "Paper grain", value: t.grain, onChange: v => setTweak("grain", v) }),
        e(window.TweakSection, { label: "Layout" }),
        e(window.TweakRadio, { label: "Density", value: t.density, options: ["comfortable", "compact"], onChange: v => setTweak("density", v) }),
        e(window.TweakRadio, { label: "Plan hero", value: t.heroLayout, options: ["status", "timeline"], onChange: v => setTweak("heroLayout", v) })));
  }

  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  ReactDOM.createRoot(document.getElementById("root")).render(e(App));
})();
