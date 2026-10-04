import fs from "node:fs";
const en = {
  linear: {
    title: "Build a route",
    topicLabel: "Lines & slope",
    stem: "The line is y = {m}x + {b}. What is y when x = {x}?",
    meaning:
      "Slope is the change in height for each step to the right. The y-intercept sets the starting height.",
    mediation: [
      "Find the starting height on the y-axis.",
      "Picture two steps to the right. Each adds the slope.",
      "Connect the height in the picture to substitution in the equation.",
    ],
  },
  quadratic: {
    title: "Move the valley",
    topicLabel: "Parabolas & shifts",
    stem: "For y = {a}(x − {h})² + {k}, what is the x-coordinate of the vertex?",
    meaning:
      "The vertex is where the squared expression is zero. The vertical shift changes its height.",
    mediation: [
      "Picture the turning point of the curve.",
      "Which x makes the expression inside the brackets zero?",
      "Check that a vertical shift does not change the vertex x-coordinate.",
    ],
  },
  intersection: {
    title: "Where do they meet?",
    topicLabel: "Equations & intersections",
    stem: "The lines are y = {m}x + {b} and y = {n}x + {c}. At which x do they meet?",
    meaning:
      "At an intersection both lines have the same height, so their expressions are equal.",
    mediation: [
      "Follow each line separately.",
      "Picture the location where their heights match.",
      "Turn that visual match into an equation with one unknown.",
    ],
  },
  triangle: {
    title: "Find the shortcut",
    topicLabel: "Triangles & Pythagoras",
    stem: "A right triangle has legs of length {a} and {b}. How long is the hypotenuse?",
    meaning:
      "The hypotenuse connects the ends of the two legs. Pythagoras relates the squared lengths.",
    mediation: [
      "Locate the right angle and the side opposite it.",
      "Picture a square on each side. Which area equals the other two added together?",
      "Find the square of the hypotenuse, then its length.",
    ],
  },
  probability: {
    title: "What are the chances?",
    topicLabel: "Probability",
    stem: "A bag has {red} pink balls and {blue} blue balls. What is the probability of drawing pink? Fractions are accepted.",
    meaning:
      "Each ball is an equally likely outcome. Compare successful outcomes with all possible outcomes.",
    mediation: [
      "Picture just the outcomes that count as success.",
      "Count every outcome, including those that are not a success.",
      "Translate the visual proportion into a fraction between 0 and 1.",
    ],
  },
  derivative: {
    title: "Read the direction",
    topicLabel: "Tangents & derivatives",
    stem: "For f(x) = {a}x² + {b}x + {c}, what is the tangent slope at x = {x}?",
    meaning:
      "The derivative describes local slope. A tangent shows the direction at that point.",
    mediation: [
      "Look near the point rather than at the whole graph.",
      "Picture a ruler resting against the curve at the point.",
      "Connect the ruler slope to the derivative value.",
    ],
  },
};
const bank = JSON.parse(fs.readFileSync("content/learning-bank.json"));
for (const a of bank) {
  a.en = {
    ...en[a.kind],
    title: en[a.kind].title + (a.level > 1 ? " · Challenge" : ""),
    summary: en[a.kind].meaning,
    rule:
      a.kind === "quadratic"
        ? "Vertex: (h, k)"
        : a.kind === "probability"
          ? "P = successful outcomes / all outcomes"
          : a.rule,
  };
  const i = Number(a.id.slice(-2)) - 1;
  if (a.kind === "linear")
    a.en.prediction = {
      question: "For one step to the right, how much does the height change?",
      options: [
        `Up by ${a.params.m}`,
        i ? "No change" : "Up by 1",
        `Down by ${a.params.m}`,
      ],
      correct: 0,
    };
  if (a.kind === "quadratic")
    a.en.prediction = i
      ? {
          question: `When the squared coefficient is ${a.params.a}, the parabola opens…`,
          options: ["Upward", "Downward", "Sideways"],
          correct: a.params.a > 0 ? 0 : 1,
        }
      : {
          question: "In (x − 2)², which way does the vertex shift from x²?",
          options: ["Left", "Right", "No shift"],
          correct: 1,
        };
  if (a.kind === "intersection")
    a.en.prediction = {
      question:
        "One line rises and the other falls. How many intersections are there?",
      options: ["None", "One", "Two"],
      correct: 1,
    };
  if (a.kind === "triangle")
    a.en.prediction = {
      question: "The hypotenuse is opposite the right angle. It is…",
      options: [
        "Shorter than either leg",
        "Always equal to a leg",
        "Longer than either leg",
      ],
      correct: 2,
    };
  if (a.kind === "probability")
    a.en.prediction = {
      question: "With more blue balls than pink balls, the chance of pink is…",
      options: ["Less than a half", "Exactly a half", "More than a half"],
      correct: 0,
    };
  if (a.kind === "derivative")
    a.en.prediction = {
      question: "For x², to the right of its vertex the tangent…",
      options: ["Is always horizontal", "Falls", "Rises"],
      correct: 2,
    };
  a.transfer.en = {
    stem: a.en.stem,
    meaning:
      "Same idea, different numbers. Picture the model before revealing it.",
  };
}
fs.writeFileSync(
  "content/learning-bank.json",
  JSON.stringify(bank, null, 2) + "\n",
);
fs.writeFileSync(
  "public/learning-bank.json",
  JSON.stringify(
    bank.map((a) =>
      a.tier === "free"
        ? a
        : {
            id: a.id,
            title: a.title,
            grade: a.grade,
            topic: a.topic,
            topicLabel: a.topicLabel,
            summary: a.summary,
            tier: a.tier,
            minutes: a.minutes,
            level: a.level,
            en: {
              title: a.en.title,
              summary: a.en.summary,
              topicLabel: a.en.topicLabel,
            },
          },
    ),
    null,
    2,
  ) + "\n",
);
