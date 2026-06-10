/* ============================================================
   Client — Project Plan (hero)
   layouts: grouped-by-status (default) · timeline
   window.Screens.ClientPlan
   ============================================================ */
(function () {
  const { e, Icon, Badge, Empty, ErrorState, SkeletonRows, DATA } = window.MK;
  window.Screens = window.Screens || {};

  function PageHead({ app, eyebrow, title, sub, action }) {
    if (app.isMobile) {
      return e("div", { className: "mpagehead" },
        e("div", { className: "eyebrow", style: { marginBottom: 9 } }, eyebrow),
        e("h1", null, title),
        sub && e("p", { className: "sub" }, sub));
    }
    return e("div", { className: "pagehead" + (action ? " with-action" : "") },
      e("div", null,
        e("div", { className: "eyebrow" }, eyebrow),
        e("h1", null, title),
        sub && e("p", { className: "sub" }, sub)),
      action);
  }
  window.Screens.PageHead = PageHead;

  function WorkItem({ it, phase, mobile }) {
    return e("div", { className: "workitem " + it.status },
      e("div", { className: "marker" }, e("div", { className: "ring" })),
      e("div", { className: "body" },
        e("div", { className: "ti" }, it.title),
        e("div", { className: "meta" },
          e("span", { className: "id" }, it.id),
          e("span", null, phase))),
      e("div", { className: "right" },
        it.est && e("span", { className: "est" }, it.est),
        e(Badge, { status: it.status })));
  }

  function GroupedView({ app }) {
    const phases = DATA.plan.phases;
    const all = [];
    phases.forEach(p => p.items.forEach(it => all.push({ ...it, phase: p.name })));
    const groups = [
      { key: "done", label: "Done", cls: "done", items: all.filter(i => i.status === "done") },
      { key: "active", label: "In flight", cls: "active", items: all.filter(i => i.status === "active") },
      { key: "next", label: "Next up", cls: "next", items: all.filter(i => i.status === "next") },
    ];
    return e("div", null,
      e("div", { className: "plan-summary" },
        e("div", { className: "psum done" },
          e("div", { className: "k" }, "Done"),
          e("div", { className: "n" }, groups[0].items.length),
          e("div", { className: "lab" }, "work items shipped")),
        e("div", { className: "psum active" },
          e("div", { className: "k" }, "In flight"),
          e("div", { className: "n" }, groups[1].items.length),
          e("div", { className: "lab" }, "moving this phase")),
        e("div", { className: "psum next" },
          e("div", { className: "k" }, "Next up"),
          e("div", { className: "n" }, groups[2].items.length),
          e("div", { className: "lab" }, "queued, not started"))),
      groups.map(g => e("div", { className: "statusgroup", key: g.key },
        e("div", { className: "sg-head " + g.cls },
          e("span", { className: "dot" }),
          e("h3", null, g.label),
          e("span", { className: "c" }, g.items.length),
          e("span", { className: "ln" })),
        g.items.length
          ? g.items.map(it => e(WorkItem, { key: it.id, it, phase: it.phase, mobile: app.isMobile }))
          : e("div", { className: "faint", style: { fontSize: 13, padding: "4px 2px", fontFamily: "var(--mono)", letterSpacing: ".06em" } }, "— nothing here yet"))));
  }

  function TimelineView({ app }) {
    return e("div", { className: "timeline" },
      DATA.plan.phases.map(p => e("div", { className: "tl-phase " + p.status, key: p.id },
        e("div", { className: "tl-phead" },
          e("h3", null, p.name),
          e("span", { className: "when" }, p.when),
          e(Badge, { status: p.status })),
        e("p", { className: "tl-desc" }, p.desc),
        e("div", { className: "tl-items" },
          p.items.map(it => e("div", { className: "tl-item " + it.status, key: it.id },
            e(Icon, { name: it.status === "done" ? "checkCircle" : it.status === "active" ? "clock" : "dot", size: 15, className: "tic" }),
            e("span", { className: "tt" }, it.title),
            e("span", { className: "tid" }, it.id)))))));
  }

  function ProgressBanner() {
    const p = DATA.plan;
    const done = p.phases.filter(x => x.status === "done").length;
    return e("div", { className: "card card-pad", style: { marginBottom: "var(--space-lg)" } },
      e("div", { className: "spread", style: { gap: 16, marginBottom: 14, flexWrap: "wrap" } },
        e("div", { style: { display: "grid", gap: 4 } },
          e("div", { className: "eyebrow" }, "Engagement progress"),
          e("div", { style: { fontFamily: "var(--serif)", fontWeight: 300, fontSize: 19, letterSpacing: "-.01em" } },
            "Phase ", done + 1, " of ", p.phases.length, " — ",
            e("span", { style: { fontStyle: "italic", color: "var(--accent)" } }, "Workflow automation"))),
        e("div", { style: { fontFamily: "var(--mono)", fontSize: 22, color: "var(--accent)", letterSpacing: "-.02em" } }, p.pct + "%")),
      e("div", { className: "meter" }, e("i", { style: { width: p.pct + "%" } })));
  }

  window.Screens.ClientPlan = function ClientPlan({ app }) {
    const head = e(PageHead, { app,
      eyebrow: "Project plan · mirrored from Linear",
      title: app.isMobile ? e(React.Fragment, null, "Where things ", e("em", null, "stand")) : e(React.Fragment, null, "Where your engagement ", e("em", null, "stands")),
      sub: app.isMobile ? null : "A read-only view of your roadmap — what's done, what's in flight, and what's next. Updated as we ship.",
      action: app.isMobile ? null : e("div", { className: "seg", role: "group", "aria-label": "Plan layout" },
        e("button", { "aria-pressed": app.tweaks.heroLayout === "status", onClick: () => app.setTweak("heroLayout", "status") }, "By status"),
        e("button", { "aria-pressed": app.tweaks.heroLayout === "timeline", onClick: () => app.setTweak("heroLayout", "timeline") }, "Timeline")) });

    if (app.dataState === "loading") {
      return e("div", { className: "reveal-up" }, head,
        e("div", { className: "sk-card", style: { marginBottom: "var(--space-lg)" } },
          e("div", { className: "sk sk-line", style: { width: "40%" } }),
          e("div", { className: "sk", style: { height: 5, borderRadius: 99 } })),
        e(SkeletonRows, { n: 5 }));
    }
    if (app.dataState === "error") {
      return e("div", null, head, e(ErrorState, { onRetry: app.retry,
        title: "Couldn't reach the project plan",
        children: "We sync this read-only from Linear. The connection hiccuped — your data is safe.",
        code: "ERR_LINEAR_SYNC · retry in a moment" }));
    }
    if (app.dataState === "empty") {
      return e("div", null, head, e(Empty, { icon: "plan",
        title: "Your plan is being set up",
        children: "David is putting together the roadmap for this engagement. Once milestones are in, they'll appear here automatically." }));
    }

    const mobileToggle = app.isMobile && e("div", { className: "seg", role: "group", style: { marginBottom: 18, width: "100%" } },
      e("button", { style: { flex: 1, justifyContent: "center" }, "aria-pressed": app.tweaks.heroLayout === "status", onClick: () => app.setTweak("heroLayout", "status") }, "By status"),
      e("button", { style: { flex: 1, justifyContent: "center" }, "aria-pressed": app.tweaks.heroLayout === "timeline", onClick: () => app.setTweak("heroLayout", "timeline") }, "Timeline"));

    return e("div", { className: "reveal-up" }, head, mobileToggle,
      e(ProgressBanner, null),
      app.tweaks.heroLayout === "timeline" ? e(TimelineView, { app }) : e(GroupedView, { app }));
  };
})();
