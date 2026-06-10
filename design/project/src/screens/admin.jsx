/* ============================================================
   Admin (David, cross-tenant) — dashboard · clients · tickets · docs
   window.Screens.AdminDash / AdminClients / AdminTickets / AdminDocs
   ============================================================ */
(function () {
  const { e, Icon, Badge, Avatar, Empty, ErrorState, SkeletonRows, DATA } = window.MK;
  const { PageHead } = window.Screens;
  const { useState } = React;
  window.Screens = window.Screens || {};

  /* ---------------- DASHBOARD ---------------- */
  window.Screens.AdminDash = function AdminDash({ app }) {
    const head = e(PageHead, { app,
      eyebrow: "Admin · across all clients",
      title: app.isMobile ? "Overview" : e(React.Fragment, null, "The ", e("em", null, "whole table")),
      sub: app.isMobile ? null : "Every engagement at a glance — what's moving, and what's waiting on you." });

    if (app.dataState === "loading") return e("div", null, head, e(SkeletonRows, { n: 5 }));
    if (app.dataState === "error") return e("div", null, head, e(ErrorState, { onRetry: app.retry }));

    const totalOpen = DATA.queue.length;
    const active = DATA.clients.length;
    return e("div", { className: "reveal-up" }, head,
      e("div", { className: "kpi-grid" },
        e(Kpi, { k: "Active clients", n: active, d: "engagements in flight" }),
        e(Kpi, { k: "Waiting on you", n: totalOpen, accent: true, d: "open across all clients" }),
        e(Kpi, { k: "Avg. progress", n: "40%", d: "weighted across plans" }),
        e(Kpi, { k: "This week", n: 9, d: "replies & uploads" })),
      e("div", { className: "admin-cols" },
        e("div", null,
          e("div", { className: "section-head", style: { marginBottom: 14 } },
            e("h2", null, "Waiting on you"),
            e("span", { className: "count" }, totalOpen),
            e("span", { className: "ln" }),
            e("button", { className: "btn btn-sm", onClick: () => app.go("admintickets") }, "Full queue")),
          DATA.queue.slice(0, 5).map(q => e(QueueItem, { key: q.id, q, onOpen: () => app.go("admintickets") }))),
        e("div", null,
          e("div", { className: "section-head", style: { marginBottom: 14 } }, e("h2", null, "Recent activity"), e("span", { className: "ln" })),
          e("div", { className: "card card-pad" },
            e("div", { className: "activity" },
              DATA.activity.map((a, i) => e("div", { className: "act-item", key: i },
                e("span", { className: "ad" + (a.accent ? " accent" : "") }),
                e("div", { className: "at" }, a.text),
                e("span", { className: "aw" }, a.when))))))));
  };

  function Kpi({ k, n, d, accent }) {
    return e("div", { className: "kpi" },
      e("div", { className: "k" }, k),
      e("div", { className: "n" }, accent ? e("em", null, n) : n),
      e("div", { className: "d" }, d));
  }
  function QueueItem({ q, onOpen }) {
    return e("button", { className: "queue-item", onClick: onOpen },
      e("div", { style: { minWidth: 0 } },
        e("div", { className: "ti" }, q.title),
        e("div", { className: "meta" },
          e("span", { className: "tnt" }, q.tenant),
          e("span", null, q.id),
          e("span", null, q.when, " ago"))),
      e(Badge, { status: q.status }));
  }

  /* ---------------- CLIENTS (management) ---------------- */
  window.Screens.AdminClients = function AdminClients({ app }) {
    const [creating, setCreating] = useState(false);
    if (creating) return e(NewClient, { app, onDone: () => { setCreating(false); app.toast("Client workspace created"); } });

    const head = e(PageHead, { app,
      eyebrow: "Admin · client management",
      title: app.isMobile ? "Clients" : e(React.Fragment, null, "Every ", e("em", null, "client")),
      sub: app.isMobile ? null : "Create workspaces, link Linear projects, and manage who has access.",
      action: app.isMobile ? null : e("button", { className: "btn btn-primary", onClick: () => setCreating(true) }, e(Icon, { name: "plus", size: 15, className: "ico" }), "New client") });

    if (app.dataState === "loading") return e("div", null, head, e(SkeletonRows, { n: 5 }));
    if (app.dataState === "error") return e("div", null, head, e(ErrorState, { onRetry: app.retry }));
    if (app.dataState === "empty") return e("div", null, head,
      e(Empty, { icon: "clients", title: "No clients yet", children: "Create your first client workspace to start an engagement — link their Linear project and invite their team.",
        action: e("button", { className: "btn btn-primary", onClick: () => setCreating(true) }, e(Icon, { name: "plus", size: 15, className: "ico" }), "New client") }));

    return e("div", { className: "reveal-up" }, head,
      app.isMobile && e("button", { className: "btn btn-primary btn-block", style: { marginBottom: 16 }, onClick: () => setCreating(true) }, e(Icon, { name: "plus", size: 15, className: "ico" }), "New client"),
      DATA.clients.map(c => e("button", { className: "clientrow", key: c.code, onClick: () => app.toast("Opening " + c.name + " — switch tenants from the sidebar") },
        e(Avatar, { name: c.name }),
        e("div", { className: "info" },
          e("div", { className: "nm" }, c.name),
          e("div", { className: "meta" }, c.code, " · ", c.phase, " · since ", c.since)),
        e("div", { className: "prog" },
          e("div", { className: "pl" }, e("span", null, "Progress"), e("span", null, c.pct + "%")),
          e("div", { className: "meter" }, e("i", { style: { width: c.pct + "%" } }))),
        c.open > 0 ? e(Badge, { status: "waiting" }, c.open + " open") : e("span", { className: "pill" }, "Clear"))));
  };

  function NewClient({ app, onDone }) {
    const [name, setName] = useState("");
    const [linked, setLinked] = useState(false);
    return e("div", { className: "reveal-up" },
      e("div", { className: "thread-head" },
        e("button", { className: "back", onClick: onDone }, e(Icon, { name: "arrowL", size: 14 }), "All clients"),
        e("h1", null, "New ", e("em", { style: { fontStyle: "italic", color: "var(--accent)" } }, "client")),
        e("p", { className: "muted", style: { marginTop: 6 } }, "Set up the workspace, link their Linear project, and invite their team.")),
      e("div", { className: "formcard" },
        e("div", { className: "field" }, e("label", null, "Company name"),
          e("input", { className: "input", placeholder: "e.g. Northwind Labs", value: name, onChange: ev => setName(ev.target.value) })),
        e("div", { className: "grid2" },
          e("div", { className: "field" }, e("label", null, "Short code"),
            e("input", { className: "input", placeholder: "NWL" })),
          e("div", { className: "field" }, e("label", null, "Engagement"),
            e("input", { className: "input", placeholder: "Operations infrastructure" }))),
        e("div", { className: "field" }, e("label", null, "Linear project"),
          linked
            ? e("div", { className: "linkrow" },
                e("div", { className: "logo" }, e(Icon, { name: "link", size: 16, style: { color: "var(--accent)" } })),
                e("div", { className: "det" }, e("div", { className: "nm" }, name || "Northwind Labs"), e("div", { className: "meta" }, "Linked · 18 issues · syncing read-only")),
                e("button", { className: "btn btn-sm", onClick: () => setLinked(false) }, "Unlink"))
            : e("button", { className: "btn", onClick: () => setLinked(true) }, e(Icon, { name: "link", size: 15, className: "ico" }), "Link a Linear project")),
        e("div", { className: "field" }, e("label", null, "Invite their team — optional"),
          e("input", { className: "input", placeholder: "name@company.com, name@company.com" })),
        e("div", { className: "form-actions" },
          e("button", { className: "btn", onClick: onDone }, "Cancel"),
          e("button", { className: "btn btn-primary", disabled: !name.trim(), onClick: onDone }, "Create workspace"))));
  }

  /* ---------------- ADMIN TICKETS (cross-client queue) ---------------- */
  window.Screens.AdminTickets = function AdminTickets({ app }) {
    const [active, setActive] = useState(null);
    if (active) return e(AdminThread, { app, q: active, onBack: () => setActive(null) });

    const head = e(PageHead, { app,
      eyebrow: "Admin · cross-client queue",
      title: app.isMobile ? "Queue" : e(React.Fragment, null, "What's ", e("em", null, "waiting")),
      sub: app.isMobile ? null : "Every open request across all clients, oldest pressure first." });

    if (app.dataState === "loading") return e("div", null, head, e(SkeletonRows, { n: 5 }));
    if (app.dataState === "error") return e("div", null, head, e(ErrorState, { onRetry: app.retry }));
    if (app.dataState === "empty") return e("div", null, head,
      e(Empty, { icon: "checkCircle", title: "Inbox zero", children: "Nothing is waiting on you right now across any client. Enjoy it." }));

    return e("div", { className: "reveal-up" }, head,
      DATA.queue.map(q => e("button", { className: "queue-item", key: q.id, onClick: () => setActive(q), style: { gridTemplateColumns: "auto 1fr auto" } },
        e(Avatar, { name: q.tenant, size: "sm" }),
        e("div", { style: { minWidth: 0 } },
          e("div", { className: "ti" }, q.title),
          e("div", { className: "meta" }, e("span", { className: "tnt" }, q.tenant), e("span", null, q.id), e("span", null, q.when, " ago"))),
        e(Badge, { status: q.status }))));
  };

  function AdminThread({ app, q, onBack }) {
    const [reply, setReply] = useState("");
    const [status, setStatus] = useState(q.status);
    return e("div", { className: "reveal-up" },
      e("div", { className: "thread-head" },
        e("button", { className: "back", onClick: onBack }, e(Icon, { name: "arrowL", size: 14 }), "Queue"),
        e("h1", null, q.title),
        e("div", { className: "meta" },
          e("span", { className: "tnt", style: { color: "var(--accent)" } }, q.tenant),
          e("span", null, q.id), e("span", null, "Opened ", q.when, " ago"))),
      e("div", { className: "thread" },
        e("div", { className: "msg me" },
          e(Avatar, { name: q.tenant, size: "sm" }),
          e("div", { className: "bubble" },
            e("div", { className: "bhead" }, e("span", { className: "who" }, "Client"), e("span", { className: "role" }, q.tenant), e("span", { className: "when" }, q.when, " ago")),
            e("div", { className: "btext" }, e("p", null, "Original request from the client's portal. Reply here and it threads straight back to them."))))),
      e("div", { className: "reply-box" },
        e("textarea", { className: "textarea", placeholder: "Reply to " + q.tenant + "…", value: reply, onChange: ev => setReply(ev.target.value), style: { minHeight: 80 } }),
        e("div", { className: "tools" },
          e("select", { className: "select", style: { width: "auto", height: "calc(var(--control-h) - 8px)" }, value: status, onChange: ev => { setStatus(ev.target.value); app.toast("Status → " + ev.target.value.replace("_", " ")); } },
            e("option", { value: "open" }, "Open"),
            e("option", { value: "in_progress" }, "In progress"),
            e("option", { value: "resolved" }, "Resolved")),
          e("span", { className: "spacer" }),
          e("button", { className: "btn btn-primary", disabled: !reply.trim(), onClick: () => { setReply(""); app.toast("Reply sent to " + q.tenant); } },
            e(Icon, { name: "send", size: 15, className: "ico" }), "Send reply"))));
  }

  /* ---------------- ADMIN DOCS ---------------- */
  window.Screens.AdminDocs = function AdminDocs({ app }) {
    const head = e(PageHead, { app,
      eyebrow: "Admin · documents",
      title: app.isMobile ? "Documents" : e(React.Fragment, null, "Files, ", e("em", null, "any client")),
      sub: app.isMobile ? null : "Upload deliverables straight into a client's area. They'll see them instantly." });

    if (app.dataState === "loading") return e("div", null, head, e(SkeletonRows, { n: 4 }));
    if (app.dataState === "error") return e("div", null, head, e(ErrorState, { onRetry: app.retry }));

    return e("div", { className: "reveal-up" }, head,
      e("div", { className: "card card-pad", style: { marginBottom: "var(--space)" } },
        e("div", { className: "field" }, e("label", null, "Upload into"),
          e("select", { className: "select" }, DATA.clients.map(c => e("option", { key: c.code }, c.name))))),
      e("div", { className: "bigdrop", onClick: () => app.toast("Uploaded to " + DATA.clients[0].name) },
        e("div", { className: "ic" }, e(Icon, { name: "upload", size: 20 })),
        e("h3", null, "Drop deliverables here"),
        e("p", null, "goes straight to the selected client")),
      e("div", { className: "section", style: { marginTop: "var(--space-lg)" } },
        e("div", { className: "section-head" }, e("h2", null, "Recent uploads"), e("span", { className: "ln" })),
        e("div", { className: "filecards" },
          DATA.docs.filter(d => d.side === "Meridian").map((d, i) => e("div", { className: "filecard", key: i },
            e("div", { className: "ficon" }, e(Icon, { name: "file", size: 17 })),
            e("div", { className: "body" }, e("div", { className: "t" }, d.name), e("div", { className: "meta" }, "Northwind Labs · ", d.when, " · ", d.size)),
            e("button", { className: "iconbtn dl" }, e(Icon, { name: "download", size: 18 })))))));
  };
})();
