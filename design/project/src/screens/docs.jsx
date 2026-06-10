/* ============================================================
   Client — Documents  (file area, two-way upload/download)
   window.Screens.ClientDocs
   ============================================================ */
(function () {
  const { e, Icon, Avatar, Empty, ErrorState, DATA } = window.MK;
  const { PageHead } = window.Screens;
  const { useState, useRef } = React;
  window.Screens = window.Screens || {};

  const KIND_LABEL = { PDF: "PDF document", XLSX: "Spreadsheet", DOCX: "Document", TXT: "Text file", PNG: "Image" };

  function BigDrop({ drag, onPick }) {
    return e("div", { className: "bigdrop" + (drag ? " drag" : ""), onClick: onPick },
      e("div", { className: "ic" }, e(Icon, { name: "upload", size: 20 })),
      e("h3", null, drag ? "Drop to upload" : "Drag files here to share with David"),
      e("p", null, "or click to browse — both directions, anytime"));
  }

  function FileRow({ d }) {
    return e("div", { className: "filerow" },
      e("div", { className: "nm" },
        e("div", { className: "ficon" }, e(Icon, { name: d.kind === "PNG" ? "eye" : "file", size: 16 })),
        e("div", { className: "t" }, d.name, e("small", null, d.kind))),
      e("div", { className: "who" }, e(Avatar, { name: d.who, size: "sm" }), e("span", null, d.who)),
      e("div", { className: "when" }, d.when),
      e("div", { className: "size" }, d.size),
      e("button", { className: "iconbtn dl", title: "Download" }, e(Icon, { name: "download", size: 17 })));
  }
  function FileCard({ d }) {
    return e("div", { className: "filecard" },
      e("div", { className: "ficon" }, e(Icon, { name: d.kind === "PNG" ? "eye" : "file", size: 17 })),
      e("div", { className: "body" },
        e("div", { className: "t" }, d.name),
        e("div", { className: "meta" }, d.kind, " · ", d.who, " · ", d.when, " · ", d.size)),
      e("button", { className: "iconbtn dl" }, e(Icon, { name: "download", size: 18 })));
  }

  window.Screens.ClientDocs = function ClientDocs({ app }) {
    const [drag, setDrag] = useState(false);
    const [uploading, setUploading] = useState(null);
    const timer = useRef(null);

    function simulateUpload(name) {
      setUploading({ name: name || "northwind-q2-notes.pdf", pct: 0 });
      let p = 0;
      clearInterval(timer.current);
      timer.current = setInterval(() => {
        p += 12 + Math.random() * 16;
        if (p >= 100) { clearInterval(timer.current); setUploading(null); app.toast("Uploaded — David can see it now"); }
        else setUploading(u => ({ ...u, pct: Math.round(p) }));
      }, 180);
    }

    const head = e(PageHead, { app,
      eyebrow: "Documents · shared both ways",
      title: app.isMobile ? "Documents" : e(React.Fragment, null, "Shared ", e("em", null, "documents")),
      sub: app.isMobile ? null : "Deliverables from David and anything you send back — in one clean, searchable place." });

    if (app.dataState === "loading") return e("div", null, head,
      e("div", { className: "sk-card" }, Array.from({ length: 5 }).map((_, i) =>
        e("div", { key: i, className: "sk sk-line", style: { width: (50 + (i * 11) % 40) + "%" } }))));
    if (app.dataState === "error") return e("div", null, head, e(ErrorState, { onRetry: app.retry }));
    if (app.dataState === "empty") return e("div", null, head,
      e(Empty, { icon: "folder", title: "No documents yet",
        children: "Deliverables and shared files will collect here. Drag a file in to send David something to start.",
        action: e("button", { className: "btn btn-primary", onClick: () => simulateUpload() }, e(Icon, { name: "upload", size: 15, className: "ico" }), "Upload a file") }),
      uploading && e("div", { className: "uprow", style: { maxWidth: 440, margin: "16px auto 0" } },
        e(Icon, { name: "file", size: 16 }), e("span", { className: "nm" }, uploading.name), e("span", { className: "pct" }, uploading.pct + "%")));

    const meridian = DATA.docs.filter(d => d.side === "Meridian");
    const yours = DATA.docs.filter(d => d.side !== "Meridian");

    return e("div", { className: "reveal-up",
        onDragOver: ev => { ev.preventDefault(); setDrag(true); },
        onDragLeave: () => setDrag(false),
        onDrop: ev => { ev.preventDefault(); setDrag(false); simulateUpload((ev.dataTransfer.files[0] || {}).name); } },
      head,
      e(BigDrop, { drag, onPick: () => simulateUpload() }),
      uploading && e("div", { className: "uprow" },
        e(Icon, { name: "file", size: 16 }),
        e("span", { className: "nm" }, uploading.name),
        e("div", { className: "meter", style: { width: 120 } }, e("i", { style: { width: uploading.pct + "%" } })),
        e("span", { className: "pct" }, uploading.pct + "%")),

      e(Section, { app, title: "From Meridian", docs: meridian }),
      e(Section, { app, title: "From your team", docs: yours }));
  };

  function Section({ app, title, docs }) {
    return e("div", { className: "section" },
      e("div", { className: "section-head" }, e("h2", null, title), e("span", { className: "count" }, docs.length)),
      app.isMobile
        ? e("div", { className: "filecards" }, docs.map((d, i) => e(FileCard, { key: i, d })))
        : e("div", { className: "filetable" },
            e("div", { className: "filehead" },
              e("span", null, "Name"), e("span", null, "Shared by"), e("span", null, "When"), e("span", null, "Size"), e("span", null, "")),
            docs.map((d, i) => e(FileRow, { key: i, d }))));
  }
})();
