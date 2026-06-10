/* ============================================================
   Client — Tickets  (list · submit request · threaded detail)
   window.Screens.ClientTickets
   ============================================================ */
(function () {
  const { e, Icon, Badge, Avatar, Empty, ErrorState, SkeletonRows, DATA } = window.MK;
  const { PageHead } = window.Screens;
  const { useState } = React;
  window.Screens = window.Screens || {};

  function TicketRow({ t, onOpen }) {
    return e("button", { className: "ticketrow", onClick: () => onOpen(t) },
      e("div", { className: "marker" }, e(Badge, { status: t.status })),
      e("div", { className: "body" },
        e("div", { className: "ti" }, t.title),
        e("div", { className: "meta" },
          e("span", { className: "id" }, t.id),
          e("span", null, "Opened ", t.opened),
          e("span", null, "by ", t.by))),
      e("div", { className: "right" },
        e("span", { className: "reply-c" }, e(Icon, { name: "tickets", size: 13 }), t.replies),
        e(Icon, { name: "chevR", size: 16, className: "chev" })));
  }

  function Thread({ app, t, onBack }) {
    const [reply, setReply] = useState("");
    const msgs = t.thread && t.thread.length ? t.thread : [
      { who: t.by, role: "Client", them: false, when: t.opened, text: "—" },
    ];
    return e("div", { className: "reveal-up" },
      e("div", { className: "thread-head" },
        e("button", { className: "back", onClick: onBack }, e(Icon, { name: "arrowL", size: 14 }), "All requests"),
        e("h1", null, t.title),
        e("div", { className: "meta" },
          e(Badge, { status: t.status }),
          e("span", { className: "id", style: { color: "var(--ink-4)" } }, t.id),
          e("span", null, "Opened ", t.opened),
          e("span", null, t.replies, " replies"))),
      e("div", { className: "thread" },
        msgs.map((m, i) => e("div", { className: "msg " + (m.them ? "them" : "me"), key: i },
          e(Avatar, { name: m.who, accent: m.them, size: "sm" }),
          e("div", { className: "bubble" },
            e("div", { className: "bhead" },
              e("span", { className: "who" }, m.who),
              e("span", { className: "role" }, m.role),
              e("span", { className: "when" }, m.when)),
            e("div", { className: "btext" }, e("p", null, m.text)),
            m.att && e("span", { className: "att" }, e(Icon, { name: "paperclip", size: 14 }), m.att))))),
      t.status !== "resolved" && e("div", { className: "reply-box" },
        e("textarea", { className: "textarea", placeholder: "Write a reply to David…", value: reply,
          onChange: ev => setReply(ev.target.value), style: { minHeight: 80 } }),
        e("div", { className: "tools" },
          e("button", { className: "iconbtn" }, e(Icon, { name: "paperclip", size: 17 })),
          e("span", { className: "spacer" }),
          e("button", { className: "btn btn-primary", disabled: !reply.trim(),
            onClick: () => { setReply(""); app.toast("Reply sent to David"); } },
            e(Icon, { name: "send", size: 15, className: "ico" }), "Send reply"))));
  }

  function RequestForm({ app, onCancel, onSubmit }) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [drag, setDrag] = useState(false);
    const [file, setFile] = useState(null);
    return e("div", { className: "reveal-up" },
      e("div", { className: "thread-head" },
        e("button", { className: "back", onClick: onCancel }, e(Icon, { name: "arrowL", size: 14 }), "All requests"),
        e("h1", null, "Submit a ", e("em", { style: { fontStyle: "italic", color: "var(--accent)" } }, "request")),
        e("p", { className: "muted", style: { maxWidth: "52ch", marginTop: 6 } }, "Tell David what you need. Be as brief or detailed as you like — he'll pick it up and reply in the thread.")),
      e("div", { className: "formcard" },
        e("div", { className: "field" },
          e("label", null, "Title"),
          e("input", { className: "input", placeholder: "Short summary of the request", value: title, onChange: ev => setTitle(ev.target.value) })),
        e("div", { className: "field" },
          e("label", null, "Description"),
          e("textarea", { className: "textarea", placeholder: "What do you need, and any context that helps…", value: desc, onChange: ev => setDesc(ev.target.value) })),
        e("div", { className: "field" },
          e("label", null, "Attachment — optional"),
          e("div", { className: "dropzone" + (drag ? " drag" : ""),
            onDragOver: ev => { ev.preventDefault(); setDrag(true); },
            onDragLeave: () => setDrag(false),
            onDrop: ev => { ev.preventDefault(); setDrag(false); setFile((ev.dataTransfer.files[0] || {}).name || "document.pdf"); },
            onClick: () => setFile("screenshot.png") },
            e(Icon, { name: "upload", size: 26 }),
            e("div", { className: "big" }, file ? file : "Drop a file here, or click to browse"),
            e("div", { className: "small" }, file ? "Attached · click to replace" : "PDF · PNG · DOCX · up to 25MB"))),
        e("div", { className: "form-actions" },
          e("button", { className: "btn", onClick: onCancel }, "Cancel"),
          e("button", { className: "btn btn-primary", disabled: !title.trim(),
            onClick: () => onSubmit() }, e(Icon, { name: "send", size: 15, className: "ico" }), "Submit request"))));
  }

  window.Screens.ClientTickets = function ClientTickets({ app }) {
    const [view, setView] = useState("list");   // list | detail | new
    const [active, setActive] = useState(null);

    const newBtn = e("button", { className: "btn btn-primary", onClick: () => setView("new") },
      e(Icon, { name: "plus", size: 15, className: "ico" }), "Submit a request");

    if (view === "detail" && active) return e(Thread, { app, t: active, onBack: () => setView("list") });
    if (view === "new") return e(RequestForm, { app, onCancel: () => setView("list"),
      onSubmit: () => { setView("list"); app.toast("Request submitted — David will be in touch"); } });

    const head = e(PageHead, { app,
      eyebrow: "Tickets · your requests",
      title: app.isMobile ? "Requests" : e(React.Fragment, null, "Your ", e("em", null, "requests")),
      sub: app.isMobile ? null : "Anything you need from David — features, fixes, questions. Each becomes a thread you can follow.",
      action: app.isMobile ? null : newBtn });

    if (app.dataState === "loading") return e("div", null, head, e(SkeletonRows, { n: 4 }));
    if (app.dataState === "error") return e("div", null, head, e(ErrorState, { onRetry: app.retry }));
    if (app.dataState === "empty") return e("div", null, head,
      e(Empty, { icon: "tickets", title: "No requests yet",
        children: "When you need something from David, submit a request and it'll show up here as a thread you can track.",
        action: newBtn }));

    const open = DATA.tickets.filter(t => t.status !== "resolved");
    const resolved = DATA.tickets.filter(t => t.status === "resolved");
    const onOpen = t => { setActive(t); setView("detail"); };

    return e("div", { className: "reveal-up" }, head,
      app.isMobile && e("div", { style: { marginBottom: 18 } }, e("button", { className: "btn btn-primary btn-block", onClick: () => setView("new") }, e(Icon, { name: "plus", size: 15, className: "ico" }), "Submit a request")),
      e("div", { className: "section" },
        e("div", { className: "section-head" }, e("h2", null, "Open"), e("span", { className: "count" }, open.length)),
        e("div", { className: "ticketlist" }, open.map(t => e(TicketRow, { key: t.id, t, onOpen })))),
      resolved.length > 0 && e("div", { className: "section" },
        e("div", { className: "section-head" }, e("h2", null, "Resolved"), e("span", { className: "count" }, resolved.length)),
        e("div", { className: "ticketlist" }, resolved.map(t => e(TicketRow, { key: t.id, t, onOpen })))));
  };
})();
