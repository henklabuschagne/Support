# UI Style Specification Document

> Use this document as the authoritative reference when building any application that should look and feel consistent with the Pulse Dashboard system. It covers every visual and behavioral aspect: color palette, typography, spacing, component anatomy, layout patterns, interaction states, and composition rules.

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3.x |
| Styling | Tailwind CSS | v4.x (uses `@theme inline` and CSS custom properties, NOT `tailwind.config.js`) |
| CSS Architecture | CSS custom properties in `:root`, mapped to Tailwind via `@theme inline` |
| Component Primitives | Radix UI (Dialog, Select, Tabs, Tooltip, Switch, Dropdown, etc.) |
| Icons | lucide-react | 0.487.x |
| Charts | Recharts | 2.15.x |
| Class Utility | `cn()` from `clsx` + `tailwind-merge` |
| Animations | `tw-animate-css` (Tailwind animation utilities) |
| Toasts | Sonner |

---

## 2. Color System

### 2.1 Brand Palette (Primary Identity)

These are the core brand colors used across all UI chrome. They are defined as Tailwind custom colors via `@theme inline`.

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-main` | `#092E50` | Primary text, sidebar background, headings, strongest emphasis |
| `brand-primary` | `#456E92` | Primary buttons, active sidebar items, links, interactive accents |
| `brand-secondary` | `#7AA2C0` | Secondary accents, ring/focus color, softer interactive elements |
| `brand-success` | `#5F966C` | Positive indicators, success states, upward trends, resolved statuses |
| `brand-warning` | `#CEA569` | Warning indicators, in-progress states, caution badges |
| `brand-error` | `#AB5A5C` | Error states, destructive actions, critical badges, negative trends |

### 2.2 Tinted Backgrounds (Light Variants)

Used for icon containers, background tints on cards, subtle status indicators, and sidebar active states.

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-main-light` | `#0D3A63` | Sidebar accent (hover/active on dark bg) |
| `brand-primary-light` | `#E8F0F6` | Active nav item background, info callout backgrounds |
| `brand-secondary-light` | `#EFF5F9` | Light secondary backgrounds |
| `brand-success-light` | `#EDF5EF` | Success badge backgrounds, positive stat tints |
| `brand-warning-light` | `#FBF5EB` | Warning badge backgrounds, caution stat tints |
| `brand-error-light` | `#F7EDEE` | Error badge backgrounds, critical stat tints |

### 2.3 Mid-Tone Variants

Used for borders on colored badges and status indicators that need more contrast than `-light` but less than the full color.

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-success-mid` | `#D1E7D5` | Success badge borders |
| `brand-warning-mid` | `#F0DFC3` | Warning badge borders |
| `brand-error-mid` | `#E4C4C5` | Error badge borders |

### 2.4 Semantic UI Colors (CSS Variables)

These map to shadcn/ui conventions and control the overall surface/text system.

| Variable | Light Mode Value | Purpose |
|----------|-----------------|---------|
| `--background` | `#ffffff` | Page background |
| `--foreground` | `#092E50` | Default text color (= brand-main) |
| `--card` | `#ffffff` | Card surface |
| `--card-foreground` | `#092E50` | Card text |
| `--popover` | `#ffffff` | Popover/dropdown surface |
| `--popover-foreground` | `#092E50` | Popover text |
| `--primary` | `#456E92` | Primary action color (= brand-primary) |
| `--primary-foreground` | `#ffffff` | Text on primary color |
| `--secondary` | `#EBF1F6` | Secondary surface (very light blue-gray) |
| `--secondary-foreground` | `#092E50` | Text on secondary surface |
| `--muted` | `#E8EEF3` | Muted backgrounds (disabled, subtle fills) |
| `--muted-foreground` | `#5A7A96` | De-emphasized text, labels, descriptions |
| `--accent` | `#DCE7F0` | Hover backgrounds, accent fills |
| `--accent-foreground` | `#092E50` | Text on accent surfaces |
| `--destructive` | `#AB5A5C` | Destructive action color (= brand-error) |
| `--destructive-foreground` | `#ffffff` | Text on destructive |
| `--border` | `rgba(9, 46, 80, 0.12)` | All borders (translucent navy) |
| `--input` | `transparent` | Input border color |
| `--input-background` | `#F0F4F8` | Input fill background |
| `--switch-background` | `#A8BFCF` | Unchecked switch track |
| `--ring` | `#7AA2C0` | Focus ring color (= brand-secondary) |

### 2.5 Chart Colors

| Token | Value (oklch) | Approximate Hex |
|-------|--------------|----------------|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | Warm orange-red |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | Teal |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | Dark blue-gray |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | Golden yellow |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | Orange |

### 2.6 Sidebar Colors

| Variable | Value | Purpose |
|----------|-------|---------|
| `--sidebar` | `#092E50` | Sidebar background (= brand-main) |
| `--sidebar-foreground` | `#E8EEF3` | Sidebar text |
| `--sidebar-primary` | `#7AA2C0` | Sidebar active accent |
| `--sidebar-accent` | `#0D3A63` | Sidebar hover background |
| `--sidebar-border` | `rgba(122, 162, 192, 0.2)` | Sidebar dividers |

---

## 3. Typography

### 3.1 Base Settings

- **Base font size**: `16px` (set on `<html>`)
- **Font family**: System default (no custom font imported)
- **Line height**: `1.5` for all base elements

### 3.2 Heading Hierarchy

| Element | Size Token | Weight | Usage |
|---------|-----------|--------|-------|
| `h1` | `--text-2xl` (~1.5rem/24px) | 500 (medium) | Page titles: `"Support Dashboard"`, `"Admin Settings"` |
| `h2` | `--text-xl` (~1.25rem/20px) | 500 (medium) | Section headers |
| `h3` | `--text-lg` (~1.125rem/18px) | 500 (medium) | Card titles, subsection headers |
| `h4` | `--text-base` (~1rem/16px) | 500 (medium) | Card title default (used by `<CardTitle>`) |

### 3.3 Body Text Scale

| Class/Context | Effective Size | Usage |
|--------------|---------------|-------|
| Default body | 16px (1rem) | General content |
| `text-sm` | 14px (0.875rem) | Labels, nav items, table cells, badge text, secondary info |
| `text-xs` | 12px (0.75rem) | Metric sublabels, timestamps, badge text, chart axis labels |
| `text-2xl` | 24px (1.5rem) | Large metric values in KPI cards |
| `text-3xl` | 30px (1.875rem) | Page title headings |
| `text-4xl` | 36px (2.25rem) | Login/splash screen title |
| `text-lg` | 18px (1.125rem) | Card titles in detailed views, currency reference grid values |

### 3.4 Font Weight Conventions

| Weight | Token | Usage |
|--------|-------|-------|
| 400 | `--font-weight-normal` | Body text, input values, descriptions |
| 500 | `--font-weight-medium` | Labels, buttons, headings, nav items, badges |
| 600 (semibold) | Applied via `font-semibold` class | KPI values, emphasis text, sidebar brand title |
| 700 (bold) | Applied via `font-bold` class | Large metric numbers (`text-2xl font-bold`, `text-3xl font-bold`) |

### 3.5 Text Colors

| Color Class | Resolved Value | Usage |
|------------|---------------|-------|
| `text-foreground` | `#092E50` | Default text, headings |
| `text-foreground/80` | `#092E50` at 80% opacity | Nav items (inactive), secondary content |
| `text-muted-foreground` | `#5A7A96` | Descriptions, sublabels, timestamps, placeholders |
| `text-brand-primary` | `#456E92` | Active nav items, links, primary accents |
| `text-brand-success` | `#5F966C` | Positive trends, success messages |
| `text-brand-warning` | `#CEA569` | Warning indicators |
| `text-brand-error` | `#AB5A5C` | Error states, critical indicators |
| `text-brand-main` | `#092E50` | Strongest emphasis text, sidebar title |
| `text-white` / `text-primary-foreground` | `#ffffff` | Text on colored backgrounds |

---

## 4. Spacing System

### 4.1 Core Spacing Scale

All spacing uses Tailwind's default scale (multiples of 4px).

| Token | Value | Common Usage |
|-------|-------|-------------|
| `p-1` / `gap-1` | 4px | Tight inner spacing (TabsList padding) |
| `p-2` | 8px | Table cell padding, small inner elements |
| `p-3` | 12px | Icon containers, compact card sections, list item padding |
| `p-4` | 16px | Sidebar nav padding, card inner sections, insight panels |
| `p-6` | 24px | Card body padding (CardHeader, CardContent, CardFooter), form sections |
| `p-8` | 32px | Main content area padding |
| `gap-2` | 8px | Inline element spacing (icon + text, badge groups) |
| `gap-3` | 12px | Nav icon + label spacing, small grid gaps |
| `gap-4` | 16px | Grid cell gaps (compact), form field spacing |
| `gap-6` | 24px | Primary grid gaps, section vertical spacing |

### 4.2 Layout Spacing Patterns

| Context | Spacing | Class |
|---------|---------|-------|
| Page sections (vertical) | 24px | `space-y-6` |
| KPI card grid | 24px gap | `gap-6` |
| Chart grid | 24px gap | `gap-6` |
| Nav item vertical spacing | 4px | `space-y-1` |
| Section separators | 16px margin | `my-4` |
| Form fields | 16px spacing | `space-y-4` |
| Insight card internal sections | 16px spacing | `space-y-4` |

---

## 5. Border Radius System

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` (base) | `0.625rem` (10px) | Base radius |
| `--radius-sm` | `calc(--radius - 4px)` = 6px | Small buttons, tags |
| `--radius-md` | `calc(--radius - 2px)` = 8px | Inputs, select triggers, dropdown items |
| `--radius-lg` | `= --radius` = 10px | Cards, dialogs |
| `--radius-xl` | `calc(--radius + 4px)` = 14px | Large containers |
| `rounded-full` | 9999px | Avatars, circular icon containers, switch tracks, progress bars |
| `rounded-lg` | 8px | Cards (`rounded-xl` on Card component), nav items, icon containers |
| `rounded-md` | 6px | Buttons, inputs, selects, badges, dropdown menus |
| `rounded-sm` | 4px | Tab triggers, select items |

---

## 6. Component Specifications

### 6.1 Button

**Base**: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all`

| Variant | Background | Text | Hover | Border |
|---------|-----------|------|-------|--------|
| `default` | `bg-primary` (#456E92) | White | `bg-primary/90` | None |
| `destructive` | `bg-destructive` (#AB5A5C) | White | `bg-destructive/90` | None |
| `outline` | `bg-background` (white) | `text-foreground` | `bg-accent` | 1px border |
| `secondary` | `bg-secondary` (#EBF1F6) | `text-secondary-foreground` | `bg-secondary/80` | None |
| `ghost` | Transparent | Inherits | `bg-accent` | None |
| `link` | Transparent | `text-primary` | Underline | None |

| Size | Height | Padding |
|------|--------|---------|
| `default` | `h-9` (36px) | `px-4 py-2` |
| `sm` | `h-8` (32px) | `px-3` |
| `lg` | `h-10` (40px) | `px-6` |
| `icon` | `size-9` (36x36) | None |

**Focus**: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
**Disabled**: `disabled:pointer-events-none disabled:opacity-50`

### 6.2 Card

**Container**: `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border`

- Background: White (`#ffffff`)
- Border: 1px solid `rgba(9, 46, 80, 0.12)`
- Corner radius: `rounded-xl` (~14px via --radius-xl)
- Internal gap between header/content/footer: `gap-6` (24px)

**Card subcomponents**:

| Part | Padding | Notes |
|------|---------|-------|
| `CardHeader` | `px-6 pt-6` | Grid layout with auto rows |
| `CardContent` | `px-6`, last-child gets `pb-6` | Main body |
| `CardFooter` | `px-6 pb-6` | Flex row |
| `CardTitle` | Inherits h4 styles | `leading-none` |
| `CardDescription` | N/A | `text-muted-foreground` |

**Common card patterns**:
- **KPI card with icon**: `CardContent` with `p-6`, contains flex row with icon container + metric
- **Chart card**: `CardHeader` with title + `CardContent` with `ResponsiveContainer`
- **Color-accented card**: `border-l-4 border-l-{color}` for left-edge color strips
- **Compact metric card inside dialogs**: `CardContent` with `p-4`

### 6.3 Badge

**Base**: `inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium`

| Variant | Style |
|---------|-------|
| `default` | `bg-primary text-primary-foreground border-transparent` |
| `secondary` | `bg-secondary text-secondary-foreground border-transparent` |
| `destructive` | `bg-destructive text-white border-transparent` |
| `outline` | `text-foreground` with visible border |

**Custom badge patterns used in the app**:
- Status badges with tinted backgrounds: `bg-brand-success-light text-brand-success border-0`
- Active indicator: `text-brand-success border-brand-success-mid bg-brand-success-light`
- Trend badges: `bg-brand-success-light text-brand-success` or `bg-brand-error-light text-brand-error`

### 6.4 Tabs

**TabsList**: `inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground`
- Background: `#E8EEF3` (muted)

**TabsTrigger**: `rounded-sm px-3 py-1.5 text-sm font-medium`
- **Active state**: `data-[state=active]:bg-white data-[state=active]:text-brand-main data-[state=active]:shadow-sm`
- **Focus**: `focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2`

**TabsContent**: `mt-2` with focus ring on keyboard navigation

### 6.5 Select (Dropdown)

**Trigger**: `border-input bg-input-background rounded-md h-9 px-3 py-2 text-sm`
- Background: `#F0F4F8`
- Chevron icon at right, opacity 50%
- Focus: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`

**Content**: `bg-popover text-popover-foreground rounded-md border shadow-md`
- Animated: fade-in + zoom-in-95 on open
- Position: popper (follows trigger)

**Item**: `rounded-sm py-1.5 pr-8 pl-2 text-sm`
- Focus: `focus:bg-accent focus:text-accent-foreground`
- Check icon positioned absolutely at right

### 6.6 Input

- Height: `h-9` (36px)
- Background: `bg-input-background` (#F0F4F8)
- Border: `border-input` (transparent by default)
- Corner radius: `rounded-md`
- Focus: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Placeholder: `placeholder:text-muted-foreground`
- Selection: `selection:bg-primary selection:text-primary-foreground`

### 6.7 Switch

- Track: `h-[1.15rem] w-8 rounded-full`
- Unchecked: `bg-switch-background` (#A8BFCF)
- Checked: `bg-primary` (#456E92)
- Thumb: `size-4 rounded-full bg-card` (white circle)
- Transition: slides horizontally

### 6.8 Dialog (Modal)

**Overlay**: `bg-black/60 backdrop-blur-sm fixed inset-0`
**Content**: `bg-background rounded-lg border p-6 shadow-lg`
- Max width: `sm:max-w-lg` (default), can be overridden to `max-w-2xl`
- Centered: `fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`
- Close button: absolute `top-4 right-4`, X icon, opacity 70% -> 100% on hover
- Animation: `fade-in-0 zoom-in-95` on open, reverse on close

**DialogHeader**: `flex flex-col gap-2 text-center sm:text-left`
**DialogFooter**: `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`
**DialogTitle**: `text-lg leading-none font-semibold`
**DialogDescription**: `text-muted-foreground text-sm`

### 6.9 Table

**Container**: `relative w-full overflow-x-auto` wrapper around `<table>`
**Table**: `w-full caption-bottom text-sm`
**TableHead (th)**: `h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground`
**TableCell (td)**: `p-2 align-middle whitespace-nowrap`
**TableRow**: `border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted`

### 6.10 Tooltip

**Content**: `bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs`
- Has arrow indicator
- Animated: fade + zoom + slide
- Delay: 0ms (instant)

### 6.11 Dropdown Menu

**Content**: `bg-popover text-popover-foreground rounded-md border p-1 shadow-md`
**Item**: `rounded-sm px-2 py-1.5 text-sm cursor-default`
- Focus: `focus:bg-accent focus:text-accent-foreground`
- Destructive variant: `text-destructive focus:bg-destructive/10`
**Separator**: `bg-border h-px -mx-1 my-1`
**Label**: `px-2 py-1.5 text-sm font-medium`

### 6.12 Progress Bar

**Track**: `h-4 w-full overflow-hidden rounded-full bg-muted`
**Indicator**: `h-full bg-brand-primary transition-all`
- Animated via translateX transform

### 6.13 Alert

**Container**: `rounded-lg border p-4`
- Default: `bg-background text-foreground`
- Destructive: `border-destructive/50 text-destructive`
**AlertTitle**: `font-medium leading-none tracking-tight mb-1`
**AlertDescription**: `text-sm`

### 6.14 Label

`flex items-center gap-2 text-sm leading-none font-medium select-none`
- Disabled state: `opacity-50 pointer-events-none`

---

## 7. Layout Architecture

### 7.1 App Shell

```
+-------+----------------------------------+
|       |                                  |
| Side  |         Main Content             |
| bar   |         (scrollable)             |
| 256px |         p-8 (32px padding)       |
|       |                                  |
| fixed |                                  |
| full  |                                  |
| height|                                  |
+-------+----------------------------------+
```

- **Container**: `flex h-screen bg-background`
- **Sidebar**: `w-64` (256px), `bg-white`, `h-screen`, `flex flex-col`, `border-r border-border`
- **Main**: `flex-1 overflow-y-auto`
- **Content wrapper**: `p-8` (32px padding on all sides)

### 7.2 Sidebar Structure

```
+------------------+
| Brand Header     |  p-6, border-b
| - App Name       |  text-xl, text-brand-main, font-semibold
| - User Name      |  text-sm, text-muted-foreground
| - Role Badge     |  Badge component
+------------------+
| Navigation       |  flex-1, p-4, overflow-y-auto
| [Section Label]  |  text-xs, uppercase, tracking-wider, px-4 py-2
|   Nav Item       |  px-4 py-3, rounded-lg, text-sm
|   Nav Item       |
| [Separator]      |  my-4, border-t
| [Section Label]  |
|   Nav Item       |
+------------------+
| Logout Button    |  p-4, border-t
+------------------+
```

**Nav item states**:
- **Default**: `text-foreground/80 hover:bg-muted hover:text-foreground`
- **Active**: `bg-brand-primary-light text-brand-primary font-medium`
- **Icon default**: `w-5 h-5 text-muted-foreground`
- **Icon active**: `w-5 h-5 text-brand-primary`
- **With badge**: Notification count in `Badge variant="destructive"` floated right

**Section labels**: `text-xs text-muted-foreground px-4 py-2 uppercase tracking-wider font-medium`
**Section separators**: `my-4 border-t border-border`

### 7.3 Dashboard Page Layout

Every dashboard page follows this vertical structure:

```
[Page Header]           space-y-6 between all sections
  h1 (text-3xl)
  p (text-muted-foreground description)

[KPI Metric Cards]      grid cols-1 md:cols-4, gap-6
  Card > CardContent p-6
    icon-container + metric

[Charts Row]            grid cols-1 lg:cols-2, gap-6
  Card > CardHeader (title) + CardContent (chart)

[Detail Section]        Card with table or detailed content

[Optional Widget]       TeamGoalsWidget or similar
```

### 7.4 KPI Metric Card Patterns

**Pattern A - Icon Left with Colored Container**:
```
Card > CardContent p-6
  flex items-center gap-4
    div.p-3.bg-{brand-*-light}.rounded-lg
      Icon.w-6.h-6.text-{brand-*}
    div
      p.text-sm.text-muted-foreground  "Label"
      p.text-2xl                        "Value"
```

**Pattern B - Header with Small Icon Right**:
```
Card
  CardHeader.flex.flex-row.items-center.justify-between.space-y-0.pb-2
    CardTitle.text-sm.font-medium       "Label"
    Icon.h-4.w-4.text-{color}
  CardContent
    div.text-2xl.font-bold              "Value"
    p.text-xs.text-muted-foreground     "Subtext with trend"
```

**Pattern C - Colored Left Border**:
```
Card.border-l-4.border-l-{color}
  CardContent.p-6
    flex.items-center.justify-between.mb-2
      p.text-sm.text-muted-foreground   "Label"
      Icon.h-5.w-5.text-{brand-*}
    div.flex.items-end.gap-2
      p.text-3xl.font-bold              "Value"
      span.text-sm.text-muted-foreground "unit"
    p.text-xs.text-muted-foreground.mt-1 "Subtext"
```

### 7.5 Grid Patterns

| Pattern | Classes | Use Case |
|---------|---------|----------|
| 4-column KPI row | `grid grid-cols-1 md:grid-cols-4 gap-6` | Top-level metrics |
| 2-column chart row | `grid grid-cols-1 lg:grid-cols-2 gap-6` | Side-by-side charts |
| 2-column settings | `grid grid-cols-1 lg:grid-cols-2 gap-6` | Settings panels |
| 5-column grid | `grid grid-cols-2 md:grid-cols-5 gap-3` | Currency reference, small cards |
| 4-column stats | `grid grid-cols-2 md:grid-cols-4 gap-4` | Priority distribution |
| 3-column summary | `grid grid-cols-3 gap-4` | Dialog metric summaries |
| Auth card grid | `grid md:grid-cols-2 gap-6 max-w-3xl mx-auto` | Role selection cards |

---

## 8. Recharts (Chart) Styling

### 8.1 Standard Chart Configuration

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

### 8.2 Chart Heights

| Context | Height |
|---------|--------|
| Standard chart in card | `300px` |
| Cross-team trend chart | `350px` |
| Wide/detailed chart | `350-400px` |

### 8.3 Chart Color Conventions

| Data Type | Color | Hex |
|-----------|-------|-----|
| Primary metric | Blue | `#3b82f6` |
| Success/positive | Green | `#10b981` |
| Warning | Amber | `#f59e0b` |
| Error/negative | Red | `#ef4444` |
| Secondary metric | Cyan | `#06b6d4` |
| Tertiary metric | Purple | `#8b5cf6` |
| Pink accent | Pink | `#ec4899` |
| Target/baseline | Slate | `#cbd5e1` |

### 8.4 Bar Chart Styling

- Border radius on top: `radius={[8, 8, 0, 0]}` (rounded top corners)
- CartesianGrid: `strokeDasharray="3 3"` with stroke `#e2e8f0`

### 8.5 Key Rule for Recharts

Always provide unique `key` props on dynamically rendered `<Cell>` elements:
```tsx
{data.map((entry, index) => (
  <Cell key={`cell-${index}`} fill={entry.color} />
))}
```

---

## 9. Interaction & State Patterns

### 9.1 Hover States

| Element | Hover Effect |
|---------|-------------|
| Nav items | `hover:bg-muted hover:text-foreground` |
| Cards (clickable) | `hover:shadow-lg transition-shadow` + optional `hover:border-brand-primary` |
| Buttons (default) | `hover:bg-primary/90` (10% lighter) |
| Buttons (ghost) | `hover:bg-accent hover:text-accent-foreground` |
| Table rows | `hover:bg-muted/50` |
| Currency grid items | `hover:bg-muted/80` with `cursor-pointer` and `transition-colors` |
| Logout button | `hover:text-foreground hover:bg-muted` |

### 9.2 Active/Selected States

| Element | Active State |
|---------|-------------|
| Sidebar nav item | `bg-brand-primary-light text-brand-primary font-medium` |
| Tab trigger | `bg-white text-brand-main shadow-sm` (pops out of muted background) |
| Currency grid (selected) | `bg-brand-primary-light border-brand-primary text-brand-primary` |
| Table row (selected) | `data-[state=selected]:bg-muted` |

### 9.3 Focus States

All interactive elements use a consistent focus ring:
- **Ring**: `focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- **Border**: `focus-visible:border-ring`
- Ring color resolves to `#7AA2C0` at 50% opacity
- 3px ring width

### 9.4 Disabled States

- `disabled:pointer-events-none disabled:opacity-50`
- Applied to buttons, inputs, switches, select triggers

### 9.5 Transition Patterns

- **Colors**: `transition-colors` (nav items, buttons)
- **All properties**: `transition-all` (buttons, switches)
- **Shadow**: `transition-shadow` (hoverable cards)
- **Box shadow**: `transition-[color,box-shadow]` (inputs, selects, badges)

### 9.6 Animation Patterns

**Dialog/Popover/Dropdown open**:
- `animate-in fade-in-0 zoom-in-95`
- Directional slide: `slide-in-from-top-2` / `slide-in-from-bottom-2` etc.

**Dialog/Popover/Dropdown close**:
- `animate-out fade-out-0 zoom-out-95`

**Dialog overlay**: `fade-in-0` on open, `fade-out-0` on close

---

## 10. Status & Severity Color System

### 10.1 Status Badge Patterns

| Status | Background | Text | Usage |
|--------|-----------|------|-------|
| Open / Active | `bg-brand-primary-light` | `text-brand-primary` | Tickets, tasks |
| In Progress | `bg-brand-warning-light` | `text-brand-warning` | Ongoing items |
| Resolved / Complete | `bg-brand-success-light` | `text-brand-success` | Completed items |
| Closed / Inactive | `bg-gray-100` | `text-gray-800` | Archived items |

### 10.2 Severity Indicators

| Severity | Background | Border | Text |
|----------|-----------|--------|------|
| Critical | `bg-red-50` | `border-red-200` | `text-red-700` |
| High | `bg-orange-50` | `border-orange-200` | `text-orange-700` |
| Medium | `bg-yellow-50` | `border-yellow-200` | `text-yellow-700` |
| Low | `bg-green-50` | `border-green-200` | `text-green-700` |

### 10.3 Insight Type Colors

| Type | Icon Color | Background |
|------|-----------|-----------|
| Bottleneck | `text-red-600` | `bg-red-50` |
| Correlation | `text-brand-primary` | `bg-brand-primary-light` |
| Cascade | `text-brand-warning` | `bg-brand-warning-light` |
| Opportunity | `text-brand-success` | `bg-brand-success-light` |

### 10.4 Trend Indicators

- **Positive**: `text-brand-success` with `ArrowUpRight` icon or `↑` character
- **Negative**: `text-brand-error` with `ArrowDownRight` icon or `↓` character
- **Trend badges**: `bg-brand-success-light text-brand-success border-0` or `bg-brand-error-light text-brand-error border-0`

---

## 11. Icon Patterns

### 11.1 Icon Library

All icons from `lucide-react`. Common icons used:

| Category | Icons |
|----------|-------|
| Navigation | `LayoutDashboard, Activity, Headphones, Briefcase, Users, Code, CheckCircle2, Settings, LogOut, Calendar, TrendingUp, Megaphone, Rocket, BarChart3, DollarSign, Upload, Network` |
| Metrics | `TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Target, Award, DollarSign` |
| Status | `AlertTriangle, CheckCircle2, Clock, AlertCircle, XCircle` |
| Actions | `RotateCcw, Check, Trash2, ArrowRight, Lightbulb, Zap` |
| Content | `Shield, UserCog, Eye, Globe, Bell, Palette, Settings` |

### 11.2 Icon Sizing

| Context | Size Class | Pixel Size |
|---------|-----------|------------|
| Nav icons | `w-5 h-5` | 20x20 |
| KPI card icons (large) | `w-6 h-6` | 24x24 |
| KPI card icons (small) | `h-4 w-4` | 16x16 |
| Section header icons | `h-5 w-5` | 20x20 |
| Inline with text | `h-4 w-4` | 16x16 |
| Auth screen role icons | `w-8 h-8` | 32x32 |
| Key finding icons | `h-8 w-8` | 32x32 |

### 11.3 Icon Container Pattern

Icons in KPI cards often sit inside a colored container:
```
div.p-3.bg-{brand-*-light}.rounded-lg
  Icon.w-6.h-6.text-{brand-*}
```

Smaller variant:
```
div.p-2.rounded-lg.{type-color-bg}
  Icon.h-5.w-5
```

Auth screen large container:
```
div.mx-auto.mb-4.w-16.h-16.bg-{brand-*-light}.rounded-full.flex.items-center.justify-center
  Icon.w-8.h-8.text-{brand-*}
```

---

## 12. Page-Level Patterns

### 12.1 Page Header

```tsx
<div>
  <h1 className="text-3xl mb-2">Page Title</h1>
  <p className="text-muted-foreground">Description text</p>
</div>
```

Variant with icon and team color:
```tsx
<div className="flex items-center gap-3">
  <div className="w-12 h-12 rounded-lg flex items-center justify-center"
       style={{ backgroundColor: TEAM_COLOR + '20' }}>
    <Icon className="h-6 w-6" style={{ color: TEAM_COLOR }} />
  </div>
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
    <p className="text-gray-600">Description</p>
  </div>
</div>
```

Variant with action button:
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl mb-2">Page Title</h1>
    <p className="text-muted-foreground">Description</p>
  </div>
  <Button variant="outline" onClick={handleAction}>
    <Icon className="h-4 w-4 mr-2" />
    Action Label
  </Button>
</div>
```

### 12.2 Information Callout Boxes

Used for insights, recommendations, and contextual information:

```tsx
{/* Root cause / neutral info */}
<div className="bg-muted p-4 rounded-lg">
  <div className="flex items-start gap-2">
    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
    <div>
      <p className="text-sm font-medium text-foreground/80 mb-1">Label:</p>
      <p className="text-sm text-muted-foreground">Content text</p>
    </div>
  </div>
</div>

{/* Warning / impact */}
<div className="bg-orange-50 p-4 rounded-lg">
  <div className="flex items-start gap-2">
    <Target className="h-5 w-5 text-orange-600 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-orange-700 mb-1">Business Impact:</p>
      <p className="text-sm text-orange-600">Impact description</p>
    </div>
  </div>
</div>

{/* Action / recommendation */}
<div className="bg-blue-50 p-4 rounded-lg">
  ...text-blue-600, text-blue-700...
</div>

{/* Preventative */}
<div className="bg-amber-50 p-4 rounded-lg">
  ...text-amber-800, text-amber-900...
</div>

{/* Positive outcome */}
<div className="bg-green-50 p-4 rounded-lg">
  ...text-green-600, text-green-700...
</div>
```

### 12.3 Test Credentials / Info Box

```tsx
<div className="p-4 bg-brand-primary-light rounded-lg border border-brand-secondary">
  <p className="text-sm font-medium text-brand-main mb-2">Title:</p>
  <div className="text-xs text-brand-primary space-y-1">
    <p>Detail line 1</p>
    <p>Detail line 2</p>
  </div>
</div>
```

### 12.4 Empty State

```tsx
<div className="text-center py-8 text-muted-foreground">
  No items found
</div>
```

---

## 13. Auth / Login Screen

### 13.1 Background

`bg-gradient-to-br from-brand-primary-light to-brand-secondary-light`

This is a diagonal gradient from `#E8F0F6` to `#EFF5F9` creating a subtle cool-toned wash.

### 13.2 Layout

- Centered: `min-h-screen flex items-center justify-center p-4`
- Role selection: `max-w-5xl w-full` container, 2-column grid at `md` breakpoint
- Email login: Single card at `max-w-md`

### 13.3 Role Selection Card

```tsx
<Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-brand-primary">
  <CardHeader className="text-center">
    {/* Circular icon container */}
    <div className="mx-auto mb-4 w-16 h-16 bg-brand-primary-light rounded-full flex items-center justify-center">
      <Icon className="w-8 h-8 text-brand-primary" />
    </div>
    <CardTitle>Role Name</CardTitle>
    <CardDescription>Role description</CardDescription>
  </CardHeader>
  <CardContent>
    <ul className="text-sm text-muted-foreground space-y-2">
      <li>* Permission 1</li>
    </ul>
    <Button className="w-full mt-6">Login as Role</Button>
  </CardContent>
</Card>
```

---

## 14. Toast Notifications (Sonner)

- Position: Bottom-right (default)
- Styling: Uses popover colors
  - Background: `var(--popover)` (white)
  - Text: `var(--popover-foreground)` (#092E50)
  - Border: `var(--border)`
- Called via: `toast.success('message')`, `toast.error('message')`

---

## 15. Floating Action Button (DevApiPanel)

```tsx
<button className="fixed bottom-4 right-4 z-50 p-3 bg-brand-main text-white rounded-full shadow-lg hover:bg-brand-main-light transition-colors">
  <Settings className="w-5 h-5" />
</button>
```

- Position: Fixed bottom-right
- Size: 44px (p-3 + 20px icon)
- Background: `#092E50`
- Hover: `#0D3A63`
- Shadow: `shadow-lg`
- z-index: 50

---

## 16. Custom Component: TeamBadge

Three visual variants for team identification:

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `solid` | Team color | White | Team color |
| `outline` | Transparent | Team color | Team color |
| `subtle` (default) | Team color at 12.5% opacity (`+ '20'`) | Team color | Team color at 25% opacity (`+ '40'`) |

---

## 17. Responsive Breakpoints

Standard Tailwind breakpoints used:

| Breakpoint | Min-width | Common Usage |
|-----------|-----------|-------------|
| `sm` | 640px | Dialog footer layout |
| `md` | 768px | Grid column changes (1 -> 2 or 4), text size adjustments |
| `lg` | 1024px | Chart grid (1 -> 2 columns), settings layout |

---

## 18. Custom Progress / Bar Indicators

### 18.1 Utilization Bar (Custom)

```tsx
<div className="w-full bg-muted rounded-full h-2 relative">
  <div
    className="absolute top-0 left-0 h-2 rounded-full transition-all bg-{color}"
    style={{ width: `${percentage}%` }}
  />
</div>
```

### 18.2 Correlation Strength Bar

```tsx
<div className="w-32 bg-muted rounded-full h-2">
  <div
    className={`h-2 rounded-full ${
      value > 0.8 ? 'bg-red-500' :
      value > 0.6 ? 'bg-orange-500' :
      'bg-yellow-500'
    }`}
    style={{ width: `${value * 100}%` }}
  />
</div>
```

---

## 19. Settings Page Patterns

### 19.1 Settings Card with Left Accent

```tsx
<Card className="border-l-4 border-l-brand-primary">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-brand-primary" />
      Section Title
    </CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Content */}
  </CardContent>
</Card>
```

### 19.2 Toggle Setting Row

```tsx
<div className="flex items-center justify-between p-3 border rounded-lg">
  <div>
    <p className="font-medium text-sm">Setting Name</p>
    <p className="text-xs text-muted-foreground">Setting description</p>
  </div>
  <Switch checked={value} onCheckedChange={handler} />
</div>
```

### 19.3 Current Value Display

```tsx
<div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
  <Icon className="h-5 w-5 text-muted-foreground" />
  <div className="flex-1">
    <p className="text-sm text-muted-foreground">Label</p>
    <p className="font-semibold">Current Value</p>
  </div>
  <Badge variant="outline" className="text-brand-success border-brand-success-mid bg-brand-success-light">
    Active
  </Badge>
</div>
```

### 19.4 Preview Panel

```tsx
<div className="p-4 border border-dashed rounded-lg space-y-2">
  <p className="text-xs text-muted-foreground mb-3">Preview description:</p>
  <div className="grid grid-cols-2 gap-3">
    {items.map(item => (
      <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
        <span className="text-xs text-muted-foreground">{item.label}</span>
        <span className="text-sm font-semibold">{item.value}</span>
      </div>
    ))}
  </div>
</div>
```

---

## 20. Insight / Recommendation Card Pattern

Used in DirectorInsights and BusinessInsights for detailed analysis cards:

```tsx
<Card className="border-l-4 border-l-{severity-color}">
  <CardHeader>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg {type-bg-color}">
            <TypeIcon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Insight Title</CardTitle>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-xs">SEVERITY</Badge>
              <Badge variant="outline" className="text-xs capitalize">type</Badge>
            </div>
          </div>
        </div>
        <CardDescription className="text-base">Description</CardDescription>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <TrendIcon className="h-5 w-5 text-{trend-color}" />
        <div className="text-right">
          <div className="text-2xl font-bold">{score}</div>
          <div className="text-xs text-muted-foreground">vs {target} target</div>
        </div>
      </div>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Teams Affected: flex-wrap badges */}
    {/* Root Cause: bg-muted callout */}
    {/* Impact: bg-orange-50 callout */}
    {/* Recommendation: bg-blue-50 callout */}
  </CardContent>
</Card>
```

---

## 21. Numbered Action List

```tsx
<ul className="space-y-2">
  {actions.map((action, idx) => (
    <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
      <div className="flex items-center justify-center w-5 h-5 bg-amber-200 rounded-full text-xs font-medium mt-0.5">
        {idx + 1}
      </div>
      {action}
    </li>
  ))}
</ul>
```

---

## 22. Correlation Matrix Table

Color-coded table cells based on value ranges:

```tsx
<div className={`inline-block px-3 py-1 rounded ${
  value >= 80 ? 'bg-green-100 text-green-700' :
  value >= 60 ? 'bg-yellow-100 text-yellow-700' :
  'bg-red-100 text-red-700'
}`}>
  {value}
</div>
```

Legend uses small colored squares:
```tsx
<div className="flex items-center gap-2">
  <div className="w-4 h-4 bg-green-100 rounded" />
  <span className="text-muted-foreground">Strong (80+)</span>
</div>
```

---

## 23. Quick Reference: Most Common Class Combinations

```
// Page wrapper
"space-y-6"

// KPI grid
"grid grid-cols-1 md:grid-cols-4 gap-6"

// Chart grid
"grid grid-cols-1 lg:grid-cols-2 gap-6"

// Card with accent
"border-l-4 border-l-brand-{color}"

// Metric label
"text-sm text-muted-foreground"

// Large metric value
"text-2xl font-bold" or "text-3xl font-bold"

// Subtle stat sublabel
"text-xs text-muted-foreground mt-1"

// Icon in colored container
"p-3 bg-brand-{color}-light rounded-lg" + "w-6 h-6 text-brand-{color}"

// Active nav item
"bg-brand-primary-light text-brand-primary font-medium"

// Status chip
"px-2 py-1 rounded-full text-xs bg-brand-{status}-light text-brand-{status}"

// Section label
"text-xs text-muted-foreground uppercase tracking-wider font-medium"

// Empty state
"text-center py-8 text-muted-foreground"

// Callout box
"p-4 bg-{color}-50 rounded-lg"

// Inline trend
"text-brand-success" with arrow character or icon
```

---

## 24. Design Principles Summary

1. **Navy-anchored palette**: All text and UI chrome derives from a navy (#092E50) base, creating a professional, enterprise feel.
2. **Muted backgrounds**: Cards sit on white, with `#E8EEF3` (muted) and `#F0F4F8` (input-background) providing subtle depth.
3. **Left-border accents**: Cards use 4px left borders in brand colors to create visual hierarchy and categorization.
4. **Consistent icon containers**: Icons always sit in a light-tinted rounded container matching their semantic color.
5. **Status through color, not shape**: Status is communicated via background/text color combinations (light bg + saturated text), never via different shapes.
6. **Dense but readable**: `text-sm` (14px) is the workhorse size. `text-xs` (12px) for metadata. Large metrics use `text-2xl` or `text-3xl`.
7. **Generous but consistent spacing**: `gap-6` (24px) between major sections, `gap-4` (16px) within sections, `gap-2` (8px) for inline elements.
8. **Rounded everything**: All containers use rounded corners. Buttons and badges use `rounded-md` (6px). Cards use `rounded-xl` (~14px). Avatars and progress bars use `rounded-full`.
9. **Subtle borders**: Border color is translucent navy (`rgba(9,46,80,0.12)`), keeping the interface light and airy.
10. **Focus accessibility**: All interactive elements have visible 3px focus rings using `--ring` (#7AA2C0 at 50% opacity).
