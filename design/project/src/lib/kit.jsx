/* ============================================================
   Meridian Portal — Icons + demo data + shared atoms
   exposes: window.MK = { Icon, Mark, Wordmark, Avatar, Badge,
            Empty, Loading*, Error*, DATA, fmt }
   ============================================================ */
(function () {
  const e = React.createElement;

  /* ---------- icons (stroke, currentColor) ---------- */
  const P = {
    plan: "M3 5h7M3 10h12M3 15h9M3 20h6 M18 13l2.5 2.5M14 19l4-1 3-3-3-3-3 3z",
    tickets: "M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.7-.8L3 21l1.8-5.3A8.5 8.5 0 1 1 21 11.5z",
    docs: "M14 3v5h5 M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    dashboard: "M4 13h7V4H4zM13 9h7V4h-7zM13 20h7v-9h-7zM4 20h7v-5H4z",
    clients: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z",
    upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    paperclip: "M21.4 11.05 12.25 20.2a5 5 0 0 1-7.07-7.07l9.19-9.19a3.33 3.33 0 1 1 4.71 4.71l-9.2 9.19a1.67 1.67 0 1 1-2.36-2.36l8.49-8.48",
    send: "M22 2 11 13 M22 2l-7 20-4-9-9-4z",
    check: "M20 6 9 17l-5-5",
    checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3",
    chevR: "M9 18l6-6-6-6",
    chevD: "M6 9l6 6 6-6",
    chevUD: "M8 9l4-4 4 4 M16 15l-4 4-4-4",
    arrowL: "M19 12H5 M12 19l-7-7 7-7",
    plus: "M12 5v14M5 12h14",
    search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3",
    lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
    mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 7l-10 6L2 7",
    alert: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01",
    inbox: "M22 12h-6l-2 3h-4l-2-3H2 M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z",
    link: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5",
    x: "M18 6 6 18M6 6l12 12",
    menu: "M3 12h18M3 6h18M3 18h18",
    sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
    moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
    desktop: "M2 3h20v14H2z M8 21h8M12 17v4",
    mobile: "M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M11 18h2",
    clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
    file: "M14 3v5h5 M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
    dot: "M12 12h.01",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
    refresh: "M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5",
    trash: "M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7",
  };
  const FILL = { dot: true };

  function Icon({ name, size, style, className }) {
    const d = P[name];
    if (!d) return null;
    return e("svg", { width: size || 20, height: size || 20, viewBox: "0 0 24 24", fill: "none", className, style,
      stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" },
      d.split(" M").map((seg, i) => e("path", { key: i, d: (i ? "M" : "") + seg, fill: FILL[name] ? "currentColor" : "none", strokeWidth: name === "dot" ? 3 : undefined })));
  }

  /* ---------- logomark: meridian line + sun at apex ---------- */
  function Mark({ size = 26, accent }) {
    const s = size;
    return e("svg", { width: s, height: s, viewBox: "0 0 40 40", fill: "none", "aria-hidden": true, style: { display: "block" } },
      e("rect", { x: 0.6, y: 0.6, width: 38.8, height: 38.8, rx: 7, stroke: "var(--rule-strong)", strokeWidth: 1.2 }),
      e("line", { x1: 20, y1: 8, x2: 20, y2: 32, stroke: "var(--ink-2)", strokeWidth: 1.2 }),
      e("circle", { cx: 20, cy: 16.5, r: 5.4, fill: accent || "var(--accent)" })
    );
  }
  function Wordmark({ size = 18 }) {
    return e("div", { className: "bar-brand", style: { gap: 11 } },
      e(Mark, { size: size + 8 }),
      e("span", { className: "name", style: { fontSize: size } }, "Meridian"));
  }

  function Avatar({ name = "", accent, size }) {
    const cls = "avatar" + (size ? " " + size : "") + (accent ? " accent" : "");
    const init = name.split(" ").map(w => w[0]).slice(0, 2).join("");
    return e("div", { className: cls }, init || "·");
  }

  /* ---------- status badge ---------- */
  const STATUS = {
    open:       { cls: "is-wait",   label: "Open" },
    in_progress:{ cls: "is-active", label: "In progress" },
    resolved:   { cls: "is-done",   label: "Resolved" },
    waiting:    { cls: "is-active", label: "Awaiting David" },
    done:       { cls: "is-done",   label: "Done" },
    active:     { cls: "is-active", label: "In flight" },
    next:       { cls: "is-wait",   label: "Next" },
    blocked:    { cls: "is-danger", label: "Blocked" },
  };
  function Badge({ status, children }) {
    const s = STATUS[status] || { cls: "is-wait", label: status };
    return e("span", { className: "badge " + s.cls }, e("span", { className: "lab" }, children || s.label));
  }

  /* ---------- state blocks ---------- */
  function Empty({ icon = "inbox", title, children, action }) {
    return e("div", { className: "empty reveal-up" },
      e("div", { className: "ic" }, e(Icon, { name: icon, size: 26 })),
      e("h3", null, title),
      e("p", null, children),
      action && e("div", { className: "act" }, action));
  }
  function ErrorState({ title, children, code, onRetry }) {
    return e("div", { className: "errstate reveal-up" },
      e("div", { className: "ic" }, e(Icon, { name: "alert", size: 26 })),
      e("h3", null, title || "Something went sideways"),
      e("p", null, children || "We couldn't load this just now. It's not you — give it another try in a moment."),
      onRetry && e("button", { className: "btn", onClick: onRetry }, e(Icon, { name: "refresh", size: 15, className: "ico" }), "Try again"),
      code && e("div", { className: "code" }, code));
  }
  function SkeletonRows({ n = 4 }) {
    return e("div", null, Array.from({ length: n }).map((_, i) =>
      e("div", { className: "sk-row", key: i },
        e("div", { className: "sk", style: { width: 16, height: 16, borderRadius: 99 } }),
        e("div", { style: { display: "grid", gap: 8 } },
          e("div", { className: "sk sk-line", style: { width: (60 + (i * 13) % 30) + "%" } }),
          e("div", { className: "sk sk-line", style: { width: "30%", height: 9 } })),
        e("div", { className: "sk", style: { width: 70, height: 22, borderRadius: 99 } }))));
  }

  /* ---------- formatters ---------- */
  const fmt = {
    rel(d) { return d; },
  };

  /* =====================================================================
     DEMO DATA — generic / placeholder-y (per brief)
     ===================================================================== */
  const DATA = {
    client: { name: "Northwind Labs", code: "NWL", engagement: "Operations infrastructure", since: "Feb 2026" },
    user: { name: "Dana Reyes", email: "dana@northwind.example", role: "Client" },
    admin: { name: "David", email: "david@meridian.example", role: "Principal" },

    plan: {
      pct: 58,
      phases: [
        { id: "PH-1", name: "Discovery & systems audit", when: "Feb — Mar", status: "done",
          desc: "Mapped the current stack, data flows, and the manual handoffs costing the most time.",
          items: [
            { id: "NWL-4", title: "Stakeholder interviews & access", status: "done", est: "1w" },
            { id: "NWL-7", title: "Tooling & data-flow inventory", status: "done", est: "1w" },
            { id: "NWL-9", title: "Findings memo & roadmap", status: "done", est: "3d" },
          ] },
        { id: "PH-2", name: "Foundations", when: "Mar — Apr", status: "done",
          desc: "Stood up the durable rails: warehouse, identity, and the integration backbone.",
          items: [
            { id: "NWL-14", title: "Warehouse + ingestion baseline", status: "done", est: "2w" },
            { id: "NWL-19", title: "Identity & access model", status: "done", est: "1w" },
          ] },
        { id: "PH-3", name: "Workflow automation", when: "Apr — Jun", status: "active",
          desc: "Replacing the highest-friction manual handoffs with observable, documented workflows.",
          items: [
            { id: "NWL-23", title: "Order-to-fulfilment automation", status: "active", est: "2w" },
            { id: "NWL-27", title: "Exception alerting & dashboards", status: "active", est: "1w" },
            { id: "NWL-31", title: "Vendor sync reconciliation", status: "next", est: "1w" },
          ] },
        { id: "PH-4", name: "Handover & enablement", when: "Jun — Jul", status: "next",
          desc: "Documentation, runbooks, and the walkthroughs that make it yours to operate.",
          items: [
            { id: "NWL-36", title: "Runbooks & operating docs", status: "next", est: "1w" },
            { id: "NWL-40", title: "Team enablement sessions", status: "next", est: "3d" },
          ] },
      ],
    },

    tickets: [
      { id: "REQ-128", title: "Add weekly fulfilment summary to the ops dashboard", status: "in_progress", opened: "2 days ago", by: "Dana Reyes", replies: 3,
        thread: [
          { who: "Dana Reyes", role: "Client", them: false, when: "2 days ago", text: "Could we get a weekly rollup of fulfilment volume on the main dashboard? The team checks it every Monday and right now they're exporting by hand." },
          { who: "David", role: "Meridian", them: true, when: "1 day ago", text: "Absolutely — that's a quick one given the warehouse work is already in. I'll add a 7-day rollup card with week-over-week delta. Want it scoped to all warehouses or split by site?" , att: null},
          { who: "Dana Reyes", role: "Client", them: false, when: "22 hours ago", text: "Split by site would be ideal." },
          { who: "David", role: "Meridian", them: true, when: "4 hours ago", text: "On it. I'll have a preview up by Thursday.", att: "fulfilment-mock-v2.png" },
        ] },
      { id: "REQ-126", title: "Vendor sync is double-counting returns", status: "in_progress", opened: "4 days ago", by: "Marcus Lee", replies: 5, thread: [] },
      { id: "REQ-121", title: "Can we export the exception log as CSV?", status: "resolved", opened: "1 week ago", by: "Dana Reyes", replies: 2, thread: [] },
      { id: "REQ-118", title: "Access for our new ops analyst", status: "resolved", opened: "2 weeks ago", by: "Dana Reyes", replies: 4, thread: [] },
    ],

    docs: [
      { name: "Systems audit & roadmap", kind: "PDF", who: "David", side: "Meridian", when: "Mar 14", size: "2.4 MB" },
      { name: "Data-flow inventory", kind: "XLSX", who: "David", side: "Meridian", when: "Mar 9", size: "812 KB" },
      { name: "Identity & access model", kind: "PDF", who: "David", side: "Meridian", when: "Apr 2", size: "1.1 MB" },
      { name: "Q2 priorities (our notes)", kind: "DOCX", who: "Dana Reyes", side: "Northwind", when: "Apr 18", size: "96 KB" },
      { name: "Warehouse credentials", kind: "TXT", who: "Marcus Lee", side: "Northwind", when: "Mar 1", size: "2 KB" },
    ],

    /* admin */
    clients: [
      { name: "Northwind Labs", code: "NWL", phase: "Workflow automation", pct: 58, open: 2, status: "active", since: "Feb 2026" },
      { name: "Atlas Freight", code: "ATL", phase: "Foundations", pct: 32, open: 1, status: "active", since: "Mar 2026" },
      { name: "Brightline Health", code: "BRT", phase: "Discovery", pct: 12, open: 0, status: "active", since: "May 2026" },
      { name: "Cedar & Co.", code: "CDR", phase: "Handover", pct: 94, open: 0, status: "active", since: "Nov 2025" },
      { name: "Driftwood Studio", code: "DFT", phase: "Discovery", pct: 4, open: 3, status: "active", since: "Jun 2026" },
    ],
    queue: [
      { id: "REQ-126", title: "Vendor sync is double-counting returns", tenant: "Northwind", when: "4d", status: "in_progress" },
      { id: "REQ-131", title: "Set up SSO for the warehouse team", tenant: "Atlas", when: "1d", status: "open" },
      { id: "REQ-133", title: "Dashboard loads slowly on mobile", tenant: "Driftwood", when: "6h", status: "open" },
      { id: "REQ-134", title: "Request: monthly cost breakdown export", tenant: "Driftwood", when: "3h", status: "open" },
      { id: "REQ-128", title: "Add weekly fulfilment summary card", tenant: "Northwind", when: "2d", status: "in_progress" },
    ],
    activity: [
      { accent: true, when: "4h", text: "Dana Reyes opened REQ-128 — Weekly fulfilment summary", t: "Northwind" },
      { accent: false, when: "6h", text: "You uploaded Identity & access model to Atlas Freight", t: "Atlas" },
      { accent: false, when: "1d", text: "Marcus Lee replied on REQ-126", t: "Northwind" },
      { accent: false, when: "2d", text: "Cedar & Co. marked Handover phase complete", t: "Cedar" },
      { accent: true, when: "3d", text: "Driftwood Studio engagement created", t: "Driftwood" },
    ],
    access: [
      { name: "Dana Reyes", email: "dana@northwind.example", role: "Owner", status: "active" },
      { name: "Marcus Lee", email: "marcus@northwind.example", role: "Member", status: "active" },
      { name: "Priya Nair", email: "priya@northwind.example", role: "Member", status: "pending" },
    ],
  };

  window.MK = { e, Icon, Mark, Wordmark, Avatar, Badge, Empty, ErrorState, SkeletonRows, fmt, DATA, STATUS };
})();
