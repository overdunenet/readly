---
title: "Apply Design Thinking"
description: Use the design thinking workflow to create human-centered solutions
---

Use the `design-thinking` workflow to create solutions deeply rooted in user needs through empathy, ideation, and rapid prototyping.

## When to Use This

- Designing products or features for people
- Solving problems where user experience matters
- Starting from user research or empathy work
- Need to move from insights to testable prototypes
- Reimagining an existing experience

## When to Skip This

- Pure technical problems without user interaction
- Infrastructure or backend-only concerns
- Timeframes don't allow for user validation

:::note[Prerequisites]
- **BMad Method with CIS installed** — Maya is part of the Creative Intelligence Suite
- **A design challenge** — A problem or opportunity to explore
- **User context** — Existing research or stakeholder info (optional but helpful)
:::

## Steps

### 1. Load Maya

Start a fresh chat and load the Design Thinking Coach:

```
/cis-design-thinking
```

### 2. Define Your Challenge

Maya will ask for your design challenge. Frame it around user needs:

**Good challenges:**
- "How might we help users feel more confident starting a new project?"
- "Redesign the checkout experience for mobile shoppers"
- "Help small business owners understand their cash flow"

**Less effective:**
- "Build a new dashboard" (solution-first)
- "Fix the slow API" (technical, not user-centered)

### 3. Journey Through the Five Phases

Maya guides you through the complete design thinking process:

| Phase | Goal | What You Do |
| ----- | ---- | ---- |
| **Empathize** | Understand users | Share insights, create personas, map empathy |
| **Define** | Frame the problem | Craft POV statements, ask "How Might We" |
| **Ideate** | Generate solutions | Diverge wildly, then converge on promising concepts |
| **Prototype** | Make it tangible | Create rough artifacts that convey the idea |
| **Test** | Validate with users | Plan how to get real feedback |

:::tip[Diverge Before Converging]
Maya emphasizes expanding options before narrowing. Don't jump to solutions—let the process unfold.
:::

### 4. Apply Design Methods

At each phase, Maya selects appropriate methods from her design-methods library:

- **Empathize**: User interviews, empathy mapping, journey maps
- **Define**: POV madlibs, "How Might We" framing, problem statements
- **Ideate**: Brainstorming, sketching, storyboarding
- **Prototype**: Paper prototypes, role-play, Wizard of Oz
- **Test**: Usability testing plans, feedback capture templates

## What You Get

Output saved to `_bmad-output/design-thinking-{date}.md`:

| Section | Contents |
| ------- | -------- |
| **Design Challenge** | Your framed opportunity |
| **Point of View** | User-centered problem statement |
| **User Insights** | Empathy findings and personas |
| **How Might We Questions** | Reframed problem as opportunity |
| **Solution Concepts** | Generated ideas with rationales |
| **Prototype Designs** | Testable artifacts and mockups |
| **Test Plan** | How to validate with real users |
| **Iteration Roadmap** | Next steps based on learning |

## Example

```text
You: /cis-design-thinking
Maya: 🎨 Tell me about your design challenge, friend.
     Who are the humans we're designing with?
You: We need to redesign onboarding for our analytics tool.
     Users are dropping out during setup.
Maya: Ah, first impressions! Let's start with empathy.
     What do we know about these humans?
You: [Share user research, pain points]
Maya: [Guides through empathy mapping]
     Now let's craft our Point of View...
     "New analysts need to feel capable, not confused"
     [Frames How Might We questions]
     [Generates solution concepts]
     [Creates low-fidelity prototype]
     [Plans validation approach]
```

## Tips

:::tip[Best Practices]
- **Bring user data** — Even informal insights help ground the work
- **Prototype rough** — Sketches and role-plays beat pixels at this stage
- **Embrace failure** — Negative test results are valuable learning
:::

:::caution[Avoid Common Mistakes]
- Don't solve before empathizing — Maya will redirect you
- Don't fall in love with your first idea — divergence creates better options
- Don't skip prototyping — thinking something works doesn't make it true
:::

## Next Steps

After design thinking:

- Use **storytelling** (`/cis-storytelling`) to craft user narratives
- Apply **innovation strategy** (`/cis-innovation-strategy`) to assess business viability
- Run **brainstorming** (`/cis-brainstorm`) if you need more solution options

## Providing Context

For best results, provide user research via the `--data` flag:

```bash
workflow cis-design-thinking --data /path/to/user-research.md
```

Maya will use this context to ground the empathy and definition phases in real user insights.
