---
title: "Develop an Innovation Strategy"
description: Use the innovation strategy workflow to find disruption opportunities
---

Use the `innovation-strategy` workflow to identify disruption opportunities and architect business model innovation using proven strategic frameworks.

## When to Use This

- Exploring new market opportunities or pivots
- Analyzing competitive threats and disruption potential
- Designing business models for new ventures
- Seeking sustainable competitive advantage
- Evaluating whether an idea has strategic merit

## When to Skip This

- Incremental feature improvements (use brainstorming instead)
- Purely technical optimizations
- Well-established markets with clear rules

:::note[Prerequisites]
- **BMad Method with CIS installed** — Victor is part of the Creative Intelligence Suite
- **Market context** — Industry, competitors, or opportunity area
- **Strategic mindset** — Willingness to question assumptions
:::

## Steps

### 1. Load Victor

Start a fresh chat and load the Innovation Strategist:

```
/cis-innovation-strategy
```

### 2. Define Your Strategic Question

Victor will ask about your innovation challenge. Frame it strategically:

**Good strategic questions:**
- "Where are the disruption opportunities in our market?"
- "What business models could work for this idea?"
- "How can we create uncontested market space?"
- "What's our sustainable competitive advantage?"

**Less effective:**
- "What features should we build?" (product strategy, not innovation strategy)
- "How do we beat competitor X?" (tactical, not strategic)

### 3. Analyze the Market Landscape

Victor guides you through:

| Analysis Area | What You'll Explore |
| ------------- | ------------------- |
| **Market forces** | Trends, shifts, emerging customer needs |
| **Competitive dynamics** | Who's winning, why, and where gaps exist |
| **Value chain** | Where value is created and captured |
| **Assumptions** | Industry "rules" that might be broken |

### 4. Apply Strategic Frameworks

Victor draws from his innovation-frameworks library:

| Framework | Purpose |
| --------- | ------- |
| **Jobs-to-be-Done** | Understand what customers actually hire products to do |
| **Blue Ocean Strategy** | Find uncontested market space |
| **Disruptive Innovation** | Identify low-end or new-market opportunities |
| **Business Model Canvas** | Design or reinvent your business model |
| **Value Chain Analysis** | Find where to capture value |

:::tip[Victor's Approach]
Victor speaks like a chess grandmaster—bold declarations, strategic silences, devastatingly simple questions that cut through complexity.
:::

### 5. Define Your Strategic Position

Based on analysis, Victor helps you articulate:

- **Innovation thesis** — Your core strategic bet
- **Business model** — How you'll create and capture value
- **Moats** — Sustainable competitive advantages
- **Execution priorities** — What matters most

## What You Get

Output saved to `_bmad-output/innovation-strategy-{date}.md`:

| Section | Contents |
| ------- | -------- |
| **Strategic Question** | Your innovation challenge |
| **Market Analysis** | Forces, trends, competitive landscape |
| **Jobs-to-be-Done** | Unmet customer needs |
| **Blue Ocean Opportunities** | Uncontested market spaces |
| **Business Model** | Value proposition and capture mechanisms |
| **Competitive Advantages** | Defensible moats |
| **Strategic Roadmap** | Priorities and execution path |

## Example

```text
You: /cis-innovation-strategy
Victor: What strategic opportunity are we exploring?
You: We want to disrupt the home security market.
Victor: Interesting. Let me ask: What job are people hiring
       home security to do?
You: [Discuss customer needs, fears, motivations]
Victor: [Applies Jobs-to-be-Done analysis]
       I see. The industry competes on features and price.
       But the real job is "peace of mind, not surveillance."
       What if we competed on reassurance instead?
You: [Explore blue ocean opportunities]
Victor: [Guides business model design]
       Here's your advantage: You don't sell alarms.
       You sell sleep. That's a different business model.
```

## Tips

:::tip[Best Practices]
- **Challenge industry assumptions** — "Rules" are often habits
- **Focus on business model, not features** — Innovation lives in how value is created
- **Think long-term** — Sustainable advantage beats quick wins
:::

:::caution[Avoid Common Mistakes]
- Don't confuse strategy with tactics — Victor will redirect
- Don't ignore business model — Product alone isn't innovation
- Don't assume the incumbent's advantage — Disruption comes from the edges
:::

## Next Steps

After innovation strategy:

- Use **brainstorming** (`/cis-brainstorm`) to generate execution ideas
- Apply **design thinking** (`/cis-design-thinking`) to shape user experience
- Run **storytelling** (`/cis-storytelling`) to craft your strategic narrative

## Providing Context

For best results, provide market analysis via the `--data` flag:

```bash
workflow cis-innovation-strategy --data /path/to/market-analysis.md
```

Victor will use this context to ground the strategic analysis in your market reality.
