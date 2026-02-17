---
title: "Solve Complex Problems"
description: Use the problem-solving workflow to diagnose root causes and find solutions
---

Use the `problem-solving` workflow to systematically diagnose problems, identify root causes, and develop effective solutions using proven analytical frameworks.

## When to Use This

- Facing a complex, persistent challenge
- Need to understand root causes before fixing symptoms
- Multiple solution options exist and you need to choose
- Problems recur despite previous attempts to fix them
- Issues span multiple systems or components

## When to Skip This

- Well-understood problems with obvious solutions
- Simple, isolated bugs or issues
- Time-critical situations requiring immediate action

:::note[Prerequisites]
- **BMad Method with CIS installed** — Dr. Quinn is part of the Creative Intelligence Suite
- **A defined problem** — Something you want to solve
- **Patience for analysis** — Root cause exploration takes time
:::

## Steps

### 1. Load Dr. Quinn

Start a fresh chat and load the Problem Solver:

```
/cis-problem-solving
```

### 2. Describe Your Problem

Dr. Quinn will ask about your challenge. Be specific about symptoms:

**Good problem descriptions:**
- "Users abandon checkout after entering payment info 40% of the time"
- "The database query takes 30 seconds when user count exceeds 1000"
- "Customer support tickets increased 300% after the last release"

**Less effective:**
- "Fix performance" (too vague)
- "The app is slow" (no specifics)

### 3. Diagnose the Problem

Dr. Quinn treats problems like puzzles and guides you through:

| Diagnostic Step | Goal |
| --------------- | ---- |
| **Symptom analysis** | Separate what you see from what's causing it |
| **Boundary definition** | Understand where the problem lives and doesn't |
| **History review** | What changed, when, and what was attempted |

### 4. Apply Analytical Frameworks

Dr. Quinn selects from his solving-methods library:

| Framework | Best For |
| --------- | -------- |
| **Five Whys** | Quick root cause drilling |
| **TRIZ** | Technical contradictions and inventive solutions |
| **Theory of Constraints** | System bottlenecks and flow |
| **Systems Thinking** | Interconnected, recurring issues |
| **Root Cause Analysis** | Comprehensive causal mapping |

:::tip[Dr. Quinn's Style]
Dr. Quinn speaks like Sherlock Holmes meets a playful scientist—deductive, curious, punctuates breakthroughs with "Aha!" moments.
:::

### 5. Generate and Evaluate Solutions

Once root causes are identified:

1. **Diverge** — Generate multiple solution approaches
2. **Evaluate** — Assess pros, cons, and trade-offs
3. **Select** — Choose based on effectiveness and feasibility
4. **Plan** — Create implementation steps with risk mitigation

## What You Get

Output saved to `_bmad-output/problem-solution-{date}.md`:

| Section | Contents |
| ------- | -------- |
| **Problem Statement** | Clearly defined challenge with symptoms |
| **Diagnosis** | Root cause analysis using selected frameworks |
| **Solution Options** | Multiple approaches with pros/cons |
| **Recommended Solution** | Best option with rationale |
| **Implementation Plan** | Actionable steps and timeline |
| **Risk Mitigation** | What could go wrong and how to prevent it |
| **Success Metrics** | How to measure effectiveness |

## Example

```text
You: /cis-problem-solving
Dr. Quinn: What puzzle are we solving today?
You: User engagement dropped 50% after our last release.
Dr. Quinn: Fascinating symptom. Let's drill down.
       [Applies Five Whys]
       Why did engagement drop?
You: Users aren't opening the app.
Dr. Quinn: Why aren't they opening it?
You: Push notifications stopped working.
Dr. Quinn: Why did notifications stop?
You: The API changed and we didn't update.
Dr. Quinn: Aha! Root cause: Missing API integration.
       But why wasn't this caught in testing?
       [Drills deeper into process issues]
       [Identifies multiple root causes]
       [Generates solution options]
       [Creates implementation plan with safeguards]
```

## Tips

:::tip[Best Practices]
- **Separate symptoms from causes** — What you see isn't the problem
- **Question assumptions** — "Obvious" causes are often wrong
- **Think in systems** — Problems often have multiple interconnected causes
:::

:::caution[Avoid Common Mistakes]
- Don't jump to solutions — Dr. Quinn will slow you down
- Don't accept first answers — Keep drilling
- Don't ignore human factors — Process and people problems cause technical symptoms
:::

## Next Steps

After problem-solving:

- Use **brainstorming** (`/cis-brainstorm`) to generate creative solutions
- Apply **innovation strategy** (`/cis-innovation-strategy`) if the problem requires strategic pivots
- Use **design thinking** (`/cis-design-thinking`) if users are experiencing the problem

## Providing Context

For best results, provide problem context via the `--data` flag:

```bash
workflow cis-problem-solving --data /path/to/problem-brief.md
```

Dr. Quinn will use this context to accelerate the diagnostic phase.
