Chart Color System
The core idea
Every chart color is pulled directly from the brand palette, not from a separate "chart palette." This means the charts feel like they belong to the same UI — they don't look like a third-party embed. The brand palette has 6 colors arranged by semantic role, and charts borrow from those roles based on what the data means, not just which series came first.

The 6 brand colors and what they signal
Role	Hex	Feeling / Signal
Main	#092E50	Authority, anchor, "the whole picture" — darkest value, used sparingly in charts for total/aggregate lines or the final slice in a large pie
Primary	#456E92	The default "this is the thing you should look at" — your go-to for a single-series bar chart, the most important line, the dominant pie slice
Secondary	#7AA2C0	A softer companion to Primary — used for a second related metric that shouldn't compete visually (e.g., "Unique Users" alongside "Total Activity")
Success	#5F966C	Positive outcome or growth — revenue, completions, uptime, "Site Access" — anything you want to go up
Warning	#CEA569	Caution or middle-ground — pending items, in-progress, moderate values, third-priority data
Error	#AB5A5C	Negative or critical — churn, failures, downtime, overdue — anything you want to draw corrective attention to
How to pick colors for a chart
Single-series charts (one bar, one line, one area)
Always use Primary (#456E92). This is neutral enough to not imply good/bad, and it's the brand's interactive accent. If the single metric is inherently positive (e.g., "Total Revenue"), you can use Success (#5F966C) instead.

Two-series charts
Use Primary + Secondary (#456E92 + #7AA2C0) when the two series are the same kind of thing (e.g., two time periods, two regions). They're from the same blue family so the chart reads as "comparing two views of one concept."

Use Primary + Success (#456E92 + #5F966C) when the two series are different concepts (e.g., "Total Activity" vs. "Site Access"). The hue shift makes them instantly distinguishable.

Three-series charts
The standard triplet is Primary → Success → Secondary (#456E92 → #5F966C → #7AA2C0). This is what the Activity Trends chart uses. The logic:

Primary for the aggregate/total metric (most important)
Success for the positive sub-metric (completions, access, growth)
Secondary for the softer sub-metric (unique users, secondary count)
This order creates a visual hierarchy: saturated blue → distinct green → lighter blue.

Pie charts and categorical palettes (4–8 slices)
Cycle through the brand colors in this order, which alternates between cool and warm to maximize contrast between adjacent slices:

#456E92  (Primary — cool blue)
#5F966C  (Success — green)
#CEA569  (Warning — warm gold)
#7AA2C0  (Secondary — light blue)
#AB5A5C  (Error — muted red)
#092E50  (Main — dark navy, only if 6+ slices)
#0D3A63  (Main-light — slightly lighter navy)
#E8F0F6  (Primary-light — pale blue, only for 8th slice)
The first 5 are the "working palette" — they have enough saturation and hue separation to be readable in any chart. Colors 6–8 are fallbacks for large datasets; if you have more than 8 categories, consider grouping the smallest into an "Other" slice.

Chart infrastructure colors (axes, grid, tooltips)
These are not from the brand palette. They're neutral grays that recede visually so the data colors can do their job:

Element	Hex	Why
CartesianGrid lines	#e2e8f0	Very light slate — visible enough to aid reading but doesn't compete with data
Axis lines & tick text	#64748b	Mid-slate — readable labels without being as dark as the data
Tick font size	12px	Matches text-xs from the type system
Grid style	strokeDasharray="3 3"	Dashed lines feel lighter than solid, reducing visual weight
Bar corner radius	radius={[8, 8, 0, 0]}	Rounded top corners match the rounded-everything design principle
Line stroke width	strokeWidth={2}	Thick enough to be readable, thin enough to not feel heavy
Decision flowchart for new charts
Is there only one data series?
  → Use Primary (#456E92)
  → Unless the metric is inherently "good" → use Success (#5F966C)

Are there 2–3 series?
  → Are they the same concept compared? → Primary + Secondary
  → Are they different concepts? → Primary + Success (+ Secondary for 3rd)
  → Does one represent a negative? → swap that series to Error (#AB5A5C)

Is it a categorical breakdown (pie, stacked bar, grouped bar)?
  → Use the 5-color cycle: Primary → Success → Warning → Secondary → Error
  → Need more? Add Main, Main-light, Primary-light

Does one series represent a target/baseline/threshold?
  → Use muted-foreground (#5A7A96) with a dashed line
  → This keeps it visually distinct from "real" data
Semantic overrides
Sometimes the data itself carries meaning. In those cases, override the positional color with the semantic one:

Data meaning	Color to use	Example
Revenue, profit, uptime, success rate	Success #5F966C	Revenue bar charts, uptime area fills
Churn, errors, downtime, cost	Error #AB5A5C	Error rate lines, churn pie slices
In-progress, pending, partial	Warning #CEA569	Pending invoices, in-progress tasks
Neutral count, default metric	Primary #456E92	Total clicks, page views, generic counts
Secondary/companion metric	Secondary #7AA2C0	Unique users alongside total, secondary axis
Aggregate/total encompassing all	Main #092E50	"All categories" total line overlaid on breakdowns
Quick-copy reference
// === SINGLE SERIES ===
<Bar dataKey="value" fill="#456E92" radius={[8, 8, 0, 0]} />
<Line type="monotone" dataKey="value" stroke="#456E92" strokeWidth={2} />

// === MULTI-SERIES (2-3 lines) ===
<Line dataKey="total"    stroke="#456E92" strokeWidth={2} />  {/* Primary: main metric */}
<Line dataKey="positive" stroke="#5F966C" strokeWidth={2} />  {/* Success: positive sub-metric */}
<Line dataKey="related"  stroke="#7AA2C0" strokeWidth={2} />  {/* Secondary: companion metric */}

// === CATEGORICAL PALETTE (pie/stacked) ===
const COLORS = ['#456E92', '#5F966C', '#CEA569', '#7AA2C0', '#AB5A5C'];
// Extended (6-8 slices):
const COLORS_EXTENDED = [...COLORS, '#092E50', '#0D3A63', '#E8F0F6'];

// === CHART INFRASTRUCTURE ===
<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
<XAxis tick={{ fontSize: 12 }} stroke="#64748b" />
<YAxis tick={{ fontSize: 12 }} stroke="#64748b" />

// === SEMANTIC OVERRIDES ===
// Revenue/positive: #5F966C | Errors/negative: #AB5A5C
// Pending/caution:  #CEA569 | Baseline/target:  #5A7A96 (dashed)