(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs = {}, text) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    if (text !== undefined) e.textContent = String(text);
    return e;
  }
  const colors = {
    lime: "#d9fa78",
    purple: "#a394ff",
    pink: "#ff93c3",
    blue: "#6fd6ff",
    grid: "#30384f",
    text: "#c2cae4",
  };
  function graph(svg, extent = 6) {
    const X = (x) => 210 + x * 20,
      unit = Math.max(1, Math.ceil(extent / 6)),
      scale = 120 / (unit * 6),
      Y = (y) => 160 - y * scale;
    for (let n = -10; n <= 10; n++)
      svg.append(
        el("line", {
          x1: X(n),
          y1: 20,
          x2: X(n),
          y2: 290,
          stroke: colors.grid,
          "stroke-width": 0.6,
        }),
      );
    for (let n = -6; n <= 6; n++)
      svg.append(
        el("line", {
          x1: 10,
          y1: Y(n * unit),
          x2: 410,
          y2: Y(n * unit),
          stroke: colors.grid,
          "stroke-width": 0.6,
        }),
      );
    svg.append(
      el("line", { x1: 10, y1: Y(0), x2: 410, y2: Y(0), stroke: "#69738f" }),
      el("line", { x1: X(0), y1: 10, x2: X(0), y2: 290, stroke: "#69738f" }),
    );
    for (let n = -8; n <= 8; n += 2) {
      if (n)
        svg.append(
          el(
            "text",
            {
              x: X(n),
              y: Y(0) + 17,
              fill: colors.text,
              "font-size": 11,
              "text-anchor": "middle",
            },
            n,
          ),
        );
    }
    for (let n = -4; n <= 6; n += 2)
      if (n)
        svg.append(
          el(
            "text",
            {
              x: 202,
              y: Y(n * unit) + 4,
              fill: colors.text,
              "font-size": 10,
              "text-anchor": "end",
            },
            n * unit,
          ),
        );
    svg.append(
      el("text", { x: 402, y: 153, fill: colors.text, "font-size": 12 }, "x"),
      el("text", { x: 220, y: 20, fill: colors.text, "font-size": 12 }, "y"),
    );
    return { X, Y };
  }
  function curve(svg, f, X, Y, color) {
    let d = "";
    for (let x = -10; x <= 10; x += 0.1) {
      let y = f(x);
      if (!Number.isFinite(y)) {
        d += " ";
        continue;
      }
      y = Math.max(-40, Math.min(40, y));
      d += (d ? "L" : "M") + X(x).toFixed(1) + "," + Y(y).toFixed(1) + " ";
    }
    svg.append(
      el("path", { d, stroke: color, "stroke-width": 3, fill: "none" }),
    );
  }
  function draw(kind, p, id = "model-svg", lang = "he") {
    const svg = el("svg", {
      viewBox: "0 0 420 300",
      role: "img",
      "aria-label":
        lang === "he"
          ? "המחשה מתמטית אינטראקטיבית"
          : "Interactive mathematical model",
      id,
    });
    svg.append(
      el(
        "title",
        {},
        lang === "he"
          ? "השתמשו בסליידר או גררו על הציור"
          : "Use the slider or drag the diagram",
      ),
    );
    if (kind === "triangle") {
      let scale = 205 / Math.max(p.a, p.b, 1),
        ax = 65,
        by = 245,
        bx = ax + p.b * scale,
        ay = by - p.a * scale;
      svg.append(
        el("polygon", {
          points: `${ax},${by} ${bx},${by} ${ax},${ay}`,
          fill: "#a394ff22",
          stroke: colors.purple,
          "stroke-width": 3,
        }),
        el("path", {
          d: `M${ax + 16} ${by}v-16h-16`,
          stroke: colors.text,
          fill: "none",
        }),
        el(
          "text",
          {
            x: ax + (bx - ax) / 2,
            y: by + 25,
            fill: colors.text,
            "font-size": 17,
            "text-anchor": "middle",
          },
          p.b,
        ),
        el(
          "text",
          {
            x: ax - 25,
            y: (by + ay) / 2,
            fill: colors.text,
            "font-size": 17,
            "text-anchor": "middle",
          },
          p.a,
        ),
        el(
          "text",
          {
            x: (ax + bx) / 2 + 24,
            y: (ay + by) / 2 - 12,
            fill: colors.lime,
            "font-size": 20,
          },
          "c = ?",
        ),
      );
      return svg;
    }
    if (kind === "probability") {
      let total = p.red + p.blue;
      for (let i = 0; i < total; i++)
        svg.append(
          el("circle", {
            cx: 70 + (i % 8) * 40,
            cy: 70 + Math.floor(i / 8) * 45,
            r: 14,
            fill: i < p.red ? colors.pink : colors.blue,
          }),
        );
      svg.append(
        el(
          "text",
          {
            x: 210,
            y: 272,
            fill: colors.text,
            "font-size": 16,
            "text-anchor": "middle",
          },
          lang === "he"
            ? `${p.red} ורודים מתוך ${total}`
            : `${p.red} pink out of ${total}`,
        ),
      );
      return svg;
    }
    let extent = 6;
    if (kind === "linear")
      extent = Math.max(
        6,
        Math.abs(p.m * p.x + p.b),
        Math.abs(p.m * (p.x + 1) + p.b),
      );
    if (kind === "quadratic") extent = Math.max(6, Math.abs(p.k));
    if (kind === "intersection") {
      const point = LearningCore.evaluateModel(kind, p).intersection;
      extent = Math.max(6, Math.abs(point?.[1] || 0));
    }
    if (kind === "derivative") {
      const m = LearningCore.evaluateModel(kind, p);
      extent = Math.max(6, Math.abs(m.value), Math.abs(m.value + m.slope));
    }
    const { X, Y } = graph(svg, extent);
    if (kind === "linear") {
      curve(svg, (x) => p.m * x + p.b, X, Y, colors.purple);
      let py = p.m * p.x + p.b;
      svg.append(
        el("path", {
          d: `M${X(p.x)} ${Y(py)}H${X(p.x + 1)}V${Y(py + p.m)}`,
          stroke: colors.lime,
          "stroke-width": 2,
          fill: "none",
          "stroke-dasharray": "4 3",
        }),
        el("circle", { cx: X(p.x), cy: Y(py), r: 7, fill: colors.lime }),
      );
    }
    if (kind === "quadratic") {
      curve(svg, (x) => p.a * (x - p.h) ** 2 + p.k, X, Y, colors.purple);
      svg.append(
        el("circle", { cx: X(p.h), cy: Y(p.k), r: 7, fill: colors.lime }),
        el(
          "text",
          {
            x: X(p.h) + 12,
            y: Y(p.k) - 12,
            fill: colors.lime,
            "font-size": 13,
          },
          `(${p.h}, ${p.k})`,
        ),
      );
    }
    if (kind === "intersection") {
      curve(svg, (x) => p.m * x + p.b, X, Y, colors.purple);
      curve(svg, (x) => p.n * x + p.c, X, Y, colors.pink);
      const m = LearningCore.evaluateModel(kind, p);
      if (m.intersection)
        svg.append(
          el("circle", {
            cx: X(m.intersection[0]),
            cy: Y(m.intersection[1]),
            r: 7,
            fill: colors.lime,
          }),
        );
    }
    if (kind === "derivative") {
      const f = (x) => p.a * x * x + p.b * x + p.c,
        m = LearningCore.evaluateModel(kind, p);
      curve(svg, f, X, Y, colors.purple);
      curve(svg, (x) => m.slope * (x - p.x) + m.value, X, Y, colors.lime);
      svg.append(
        el("circle", { cx: X(p.x), cy: Y(m.value), r: 7, fill: colors.lime }),
      );
    }
    return svg;
  }
  function renderVisual(container, a, p, onChange, lang = "he") {
    const cfg = {
      linear: ["x", -5, 5, 0.5],
      quadratic: ["h", -5, 5, 0.5],
      intersection: ["c", -5, 9, 0.5],
      triangle: ["a", 1, 15, 1],
      probability: ["red", 0, 12, 1],
      derivative: ["x", -4, 4, 0.5],
    }[a.kind];
    const [key, min, max, step] = cfg;
    container.replaceChildren();
    const svg = draw(a.kind, p, "model-svg", lang);
    container.append(svg);
    const controls = document.createElement("div");
    controls.className = "model-controls";
    const label = document.createElement("label");
    label.htmlFor = "model-range";
    const name = document.createElement("span");
    name.textContent = (lang === "he" ? "חוקרים עם " : "Explore with ") + key;
    const value = document.createElement("b");
    value.className = "math";
    value.textContent = p[key];
    label.append(name, value);
    const slider = document.createElement("input");
    Object.assign(slider, {
      id: "model-range",
      type: "range",
      min: String(min),
      max: String(max),
      step: String(step),
      value: String(p[key]),
    });
    controls.append(label, slider);
    container.append(controls);
    const change = (v) => {
      p[key] = v;
      const next = draw(a.kind, p, "model-svg", lang);
      svg.replaceChildren(...Array.from(next.childNodes));
      value.textContent = v;
      slider.value = String(v);
      onChange?.(p);
    };
    slider.addEventListener("input", () => change(Number(slider.value)));
    function bind(s) {
      s.addEventListener("pointerdown", (e) => {
        s.setPointerCapture(e.pointerId);
        drag(e, s);
      });
      s.addEventListener("pointermove", (e) => {
        if (s.hasPointerCapture(e.pointerId)) drag(e, s);
      });
    }
    function drag(e, s) {
      const r = s.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      change(
        Math.round((min + (max - min) * Math.max(0, Math.min(1, x))) / step) *
          step,
      );
    }
    bind(svg);
    const cap = document.createElement("div");
    cap.className = "model-caption";
    cap.textContent =
      lang === "he"
        ? "שנו, התבוננו, ואז חזרו לנתוני השאלה."
        : "Explore a change, then return to the question values.";
    container.append(cap);
  }
  function avatar(type = "orbit", color = colors.purple) {
    const svg = el("svg", { viewBox: "0 0 64 64", "aria-hidden": true });
    svg.append(el("circle", { cx: 32, cy: 32, r: 29, fill: color }));
    if (type === "bot") {
      svg.append(
        el("rect", {
          x: 15,
          y: 18,
          width: 34,
          height: 29,
          rx: 9,
          fill: "#161e36",
        }),
        el("line", {
          x1: 32,
          y1: 18,
          x2: 32,
          y2: 9,
          stroke: "#161e36",
          "stroke-width": 3,
        }),
        el("circle", { cx: 32, cy: 9, r: 3, fill: colors.lime }),
      );
    } else if (type === "fox") {
      svg.append(
        el("path", {
          d: "M14 17L24 22L32 17L40 22L50 17L44 44L32 51L20 44Z",
          fill: "#161e36",
        }),
      );
    } else
      svg.append(
        el("ellipse", { cx: 32, cy: 31, rx: 22, ry: 16, fill: "#161e36" }),
      );
    svg.append(
      el("circle", { cx: 25, cy: 30, r: 3, fill: "#f5f5ff" }),
      el("circle", { cx: 39, cy: 30, r: 3, fill: "#f5f5ff" }),
      el("path", {
        d: "M25 39Q32 44 39 39",
        stroke: colors.lime,
        "stroke-width": 2,
        fill: "none",
      }),
    );
    return svg;
  }
  function miniature(kind) {
    return draw(
      kind,
      { m: 1, b: 0, x: 2, a: 1, h: 1, k: -2, n: -1, c: 3, red: 3, blue: 5 },
      "",
      "en",
    );
  }
  window.LearningVisuals = { renderVisual, draw, avatar, miniature, el };
})();
