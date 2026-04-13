---
name: ux-design
description: "UX/UI standards for designing and implementing product interfaces in real frontend codebases. Use when creating or editing components, layouts, pages, forms, dashboards, modals, navigation, buttons, cards, tables, lists, or other UI. Covers hierarchy, spacing systems, typography, accessibility, states, responsive behavior, design consistency, edit-in-place workflow, and implementation-ready output."
user-invocable: false
---
# UX/UI Design Standards
You are not just generating UI components. You are designing and implementing product interfaces inside a real codebase. The result should feel intentional, usable, consistent with the product, and ready to ship. Every UI decision must trace to a user goal, a design system rule, an existing product pattern, or a real implementation constraint. If you cannot justify a choice, do not make it.

## Core Goal
Produce interfaces that feel designed by a thoughtful product designer and implemented by a strong frontend engineer.
The UI must:
- feel cohesive
- support real user goals
- use consistent design patterns
- avoid generic AI-generated styling
- improve existing screens without unnecessary redesign
- be implementation-ready in code, not described like a mockup
- handle relevant states, accessibility, and responsiveness

---
## Primary Design Principles
### 1. Clarity over decoration
Prioritize usability, legibility, hierarchy, and task completion over visual effects.
Do not add gradients, glassmorphism, glow, blur, heavy shadows, or animation unless they improve clarity, feedback, or orientation.

### 2. Design around user intent
Before designing or editing any screen, determine:
- who the user is
- what they are trying to accomplish
- the primary action on the screen
- the secondary actions
- what information they need to complete the task
Every screen should make that goal easier to complete.

### 3. Strong visual hierarchy
Every interface must have:
- one obvious primary action
- clear secondary actions
- supporting content that does not compete with the main flow
Do not make every card, heading, button, and section equally loud. Use layout, spacing, contrast, typography, and placement intentionally.

### 4. Consistency is mandatory
Use a repeatable system for spacing, typography, border radius, button styles, input styles, cards, modals, tables, lists, and status indicators.
If the codebase already has a stable pattern, treat it as the default. Reuse it before creating a new variant. If a new variant is genuinely required, make it fit the existing family.

### 5. Structure before style
Layouts should feel grid-based, aligned, and stable. Group related content clearly. Use spacing and layout to create hierarchy before reaching for color or effects.
Avoid interfaces that feel improvised, scattered, or dependent on decoration to hold together.

### 6. Typography should communicate meaning
Use typography to establish hierarchy, not decoration. Keep the type scale restrained and role-based.
Headings, subheadings, labels, body text, captions, helper text, and data values should each have a clear purpose. Avoid oversized headings that overpower the interface.

### 7. Real product thinking
Do not design only the happy path. Account for empty states, loading states, validation errors, success states, disabled states, destructive actions, long content, short content, mobile responsiveness, first-time users, and repeated use by experienced users.

### 8. Accessibility is required
Ensure:
- sufficient contrast (WCAG AA minimum: 4.5:1 for text, 3:1 for large text and UI elements)
- visible focus states on all interactive elements
- readable font sizes (minimum 14px body text in app UI unless the existing system intentionally uses a smaller role)
- labels for all inputs (no placeholder-only labels)
- keyboard accessibility for all interactions
- meaning is not conveyed by color alone
Accessibility is part of implementation quality, not a finishing pass.

### 9. Simplicity beats trendiness
Avoid making the interface look like a collage of premium components or current visual trends.
Do not default to:
- hero plus feature cards plus gradient blobs
- oversized cards everywhere
- unnecessary motion
- decorative layers hiding weak layout
Prefer simple, intentional, product-specific design.

### 10. UI should feel trustworthy
The interface should feel stable, predictable, and well considered. Avoid clutter, gimmicks, and inconsistent patterns.
It should feel like a real product someone would ship and maintain, not a one-off screenshot.

---
## Required Workflow
Before generating or editing UI, follow this order:
1. Inspect the existing code first.
2. Identify the screen's user goal and primary action.
3. Identify what is inconsistent, unclear, weak, or causing friction.
4. Reuse or extend existing components and patterns where possible.
5. Standardize repeated patterns instead of inventing one-off styling.
6. Implement the smallest set of changes that materially improves the UI.
7. Review states, accessibility, responsiveness, and consistency before finalizing.
Do not skip the inspection step. Frontend work should start from the product system that already exists, not from a blank-canvas mindset.

---
## Design System Defaults
Use these as baseline rules. Override them when the project already has established values.

### Spacing
Use a consistent spacing scale. Pick one base unit and stick to it across the interface.
- Base unit: 4px
- Common values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Micro spacing between label, helper text, icon, and control: 4-8px
- Inline spacing between related elements: 8-12px
- Dense rows or stacked controls: 12-16px
- Form fields: 16-20px
- Field groups or card sections: 24-32px
- Page sections: 32-48px
- Major page regions: 48-64px
- Page padding: 16px mobile, 24px tablet, 32px desktop
- Card and panel padding: 16-24px
Do not mix arbitrary values. Every gap should map to the scale.

### Typography Scale
Use a restrained scale with clear roles.
- Page title: 24-32px, semibold or bold
- Page intro or subtitle: 16-18px, regular or medium
- Section heading: 18-20px, semibold
- Panel or card title: 16px, semibold
- Body text: 14-16px, regular
- Label text: 13-14px, medium
- Helper or caption text: 12-13px, regular, muted color
- Badge or tag text: 11-12px, medium
Rules:
- Do not exceed 3-4 font weights in a single view.
- Do not use more than 2 heading sizes on the same screen unless the hierarchy truly requires it.
- Use size and weight to clarify role, not to make everything feel important.
- Keep data-dense views tighter, but do not reduce legibility.

### Border Radius
Pick one radius system and apply it consistently.
- Buttons, inputs, selects, textareas: 6-8px
- Cards and panels: 8-12px
- Modals and drawers: match cards and panels
- Badges, chips, and tags: pill or consistent small radius
- Avatars: full circle
Do not mix square corners with heavily rounded surfaces in the same interface unless the design system already does.

### Containers and Layout
Use predictable layout widths and section rhythm.
- App shell content max-width: 1200-1400px
- Standard content pages: 960-1200px
- Reading or settings pages: 720-880px
- Single-column forms: 480-640px
- Confirmation dialogs: 400-560px
- Form dialogs: up to 720px
- Sidebar width: 240-280px, collapsible to 64-72px when the product supports it
- Tables and data views: use full available width with horizontal scroll for overflow
Rules:
- Always set a max-width on forms and content areas.
- Use consistent gutters at each breakpoint.
- Keep section headers, filters, toolbars, and content aligned to the same grid.
- Prefer 2, 3, or 4 column grids on desktop; collapse them systematically.
- Keep section rhythm consistent: heading to supporting copy 8-12px, heading block to first content 16-24px, related blocks 16-24px, major sections 32-48px, page regions 48-64px.

### Color Roles
Assign semantic color roles and use them consistently.
- `primary`: main brand action, selected state, active navigation
- `secondary`: supporting actions or accents with lower emphasis
- `muted`: low-emphasis text, subtle backgrounds, placeholders, disabled surfaces
- `destructive`: delete, remove, irreversible actions
- `success`: completion, positive confirmation
- `warning`: caution, approaching limits, recoverable issues
- `error`: failures, blocking validation, broken states
- `surface`: cards, panels, drawers, modals
- `border`: dividers, separators, control outlines
Accent color should guide attention, not coat the entire interface.

### Visual Token Restraint
Constrain visual variety so the UI feels like one system.
- Use one primary accent color unless the existing brand system explicitly supports more.
- Limit semantic colors to real status roles.
- Keep surface elevation restrained: prefer 0-2 shadow levels.
- Do not solve hierarchy by making every component a different color, radius, or background treatment.

### Motion
Use motion only when it improves clarity, feedback, orientation, or perceived smoothness.
Acceptable:
- page or panel transitions: 150-250ms
- button and input transitions: 100-150ms
- skeleton-to-content fade: 150-200ms
- toast or notification entrance: around 200ms
Not acceptable:
- decorative floating elements
- parallax on product screens
- staggered card reveals on every page load
- long or dramatic motion used to simulate polish
Motion should never compensate for weak layout or unclear interaction design.

---
## Editing Existing UI
When modifying an existing interface, do not redesign the entire screen unless explicitly asked.

### Rules for editing
- Read the existing code first and understand its current layout, spacing, components, breakpoints, and interaction patterns.
- Preserve working patterns unless they materially harm usability, accessibility, or clarity.
- Improve incrementally before replacing everything.
- Match the existing design language unless a redesign is explicitly requested.
- Identify what is inconsistent, unclear, fragile, or weak before changing code.
- Prefer refining or extending existing components over inventing one-off variants.
- Avoid breaking established interaction patterns without strong product or usability reasons.
- Do not restyle the entire product because one area is imperfect.
- Do not swap component libraries or rewrite shared primitives during a local UI change unless explicitly asked.
- When touching shared components, verify that the change still works across their existing uses.

### When a larger revision is warranted
If the current UI is fundamentally broken, say so and propose a scoped revision. Do not silently re-architect the screen or the design system.

### Preferred edit strategy
1. Keep the layout skeleton if it already works.
2. Fix the hierarchy, spacing, grouping, states, or copy that is causing friction.
3. Standardize repeated patterns you touch.
4. Stop when the requested problem is solved without unnecessary churn.

---
## Non-Negotiable Rules
### Do
- create clear hierarchy
- reuse existing patterns consistently
- keep spacing on the defined scale
- keep typography restrained and role-based
- make interactions obvious
- write concise, product-specific copy
- make layouts feel intentional and aligned
- optimize for usability first, aesthetics second
- handle relevant states, not just default visuals
- use the project's existing components before creating new ones
- describe and implement changes in terms of structure, reuse, hierarchy, responsiveness, and state handling

### Do not
- generate random trendy UI without purpose
- paste marketing-page styling into product screens
- make everything colorful, large, centered, or high-contrast
- overuse gradients, blur, glow, motion, or oversized shadows
- use oversized cards as a substitute for hierarchy
- create beautiful static mockups that ignore implementation details
- introduce more component variety when fewer patterns would be stronger
- redesign working screens for aesthetics when usability is already solid
- make every section look equally important
- leave forms, tables, cards, dialogs, and lists stylistically inconsistent
- optimize for a screenshot over real product use

---
## Interaction State Requirements
A component is not complete unless its relevant states are handled in code or consciously omitted with a reason.

### Core state checklist
Consider these states whenever they apply:
- default
- hover
- focus
- active or pressed
- selected or toggled
- disabled or readonly
- loading or submitting
- empty or zero-data
- success or confirmation
- error or failure
- destructive confirmation

### Required states by component type
**Buttons**
- default, hover, focus, active, disabled, loading
**Inputs, selects, textareas, comboboxes**
- default, focus, filled, error, disabled, readonly
- include helper text, validation text, and success feedback when the product pattern uses them
- async inputs should show loading feedback when they fetch or validate
**Cards, panels, list rows, interactive tiles**
- default, hover, focus if keyboard reachable, selected when applicable, disabled when applicable
**Links and navigation items**
- default, hover, focus, active, current-location state
**Tables, lists, and data grids**
- populated, empty, loading, error
- selected rows, bulk-action state, and sort state when the screen supports them
**Forms**
- idle, field-level error, form-level error, submitting, success
- destructive or irreversible submissions require confirmation or a deliberate review step
**Dialogs, modals, and drawers**
- open, close, loading, error, destructive confirmation when relevant

### Enforcement rule
When generating or editing UI, check which states apply and implement them. Do not ship components with only the default or happy-path state.

---
## Component Implementation Standards
### Buttons and Actions
Hierarchy:
- `primary`: most important action in a screen region; limit to one per visible area
- `secondary`: supporting actions
- `tertiary` or `ghost`: low-emphasis utilities and navigation actions
- `destructive`: clearly separated and used only for irreversible actions
Rules:
- Use action-oriented labels such as `Save changes`, `Send invite`, or `Delete classroom`.
- Avoid vague labels like `Submit`, `OK`, `Yes`, or `Continue` unless the context is extremely clear.
- Do not place two primary buttons side by side.
- Icon-only buttons need accessible labels.
- Loading buttons should disable interaction and show clear progress feedback.
- Prefer extending the existing button family over adding a new visual variant.

### Forms and Validation
Structure:
- Default to a single-column layout for most forms.
- Use multi-column layouts only when field relationships benefit and mobile stacking remains clear.
- Keep single-column forms within a 480-640px max-width unless the product already uses a broader form layout.
- Group related fields with a section heading, divider, or spacing break.
- Labels should sit above fields in most product forms.
- Required and optional indicators should follow one consistent system.
Validation:
- Validate individual fields on blur when appropriate and always validate on submit.
- Show error messages next to the failing field, not only in a toast.
- Error messages should be specific and actionable.
- Preserve server-side validation feedback in the UI.
- Move focus to the first invalid field on failed submit when possible.
- Do not disable submit preemptively just because fields are empty.
Action row:
- Keep action placement consistent with the product convention.
- Maintain clear separation between primary, secondary, and destructive actions.
- If unsaved changes matter, support a visible save state, cancel path, or draft pattern consistent with the product.
Success behavior:
- After submit, show a clear success state, confirmation, or next step.

### Inputs and Selection Controls
- Match input heights, border treatments, and label patterns across the product.
- Prefixes, suffixes, icons, and helper text should support comprehension, not replace labels.
- Selects, comboboxes, radios, checkboxes, and toggles should follow the same spacing and labeling rules as text inputs.
- Dense filter bars can be more compact than primary forms, but they still need consistent alignment and clear labels.

### Cards and Panels
- Use cards to group related content, not as the default wrapper for everything.
- Keep padding, radius, border treatment, and header structure consistent.
- Standard card order: title, supporting metadata, body, actions.
- If cards appear in a grid, use a consistent column pattern and intentional height behavior.
- If content is data-dense or highly repeatable, a list or table is often better than more cards.
- Interactive cards need visible hover, focus, and selected states.

### Lists and Rows
- Use lists when users need to scan, compare, or act on repeated items.
- Keep row structure consistent: primary info left, supporting meta nearby, status and actions aligned predictably.
- Row height should support readability and touch targets.
- Do not overload rows with too many competing controls.
- Empty lists still need guidance and next steps.

### Tables and Data Views
- Use tables for structured, comparable, data-heavy content.
- Keep text left-aligned, numbers right-aligned, and statuses consistently positioned.
- Use full-width containers with horizontal scroll for overflow.
- Header rows should remain clear and sticky when vertical scroll is long.
- Sorting, filtering, and search should be visible for data management screens.
- If bulk actions exist, make selection state and bulk action affordances obvious.
- Use row actions consistently across tables in the same product.
- Provide empty, loading, and error states that preserve the table's role in the screen.

### Modals, Dialogs, and Drawers
- Use dialogs for confirmations and focused tasks.
- Use drawers or side panels for edits when that is already the product pattern.
- Do not force complex multi-step workflows into a modal.
- Always provide a clear close or cancel path.
- Destructive confirmations should use explicit action labels such as `Delete classroom`.
- Trap focus while open and restore focus when closed.
- If closing would discard meaningful work, account for unsaved-change confirmation.

### Navigation
- Make the current location obvious.
- Keep navigation stable and predictable.
- Use breadcrumbs for deep or multi-level hierarchies when they help orientation.
- On touch devices, do not hide critical navigation behind hover or ambiguous gestures.
- Match the product's established navigation model before inventing a new one.

### Feedback and Status
- Empty states should explain what is missing and what the user can do next.
- Loading states should resemble the eventual content shape when possible.
- Error states should explain what failed and what the user can do next.
- Success states should confirm the outcome and, when relevant, suggest the next useful action.
- Toasts are good for lightweight confirmation, but do not hide critical validation or system failures in a toast alone.

---
## Product-Context Awareness
Adjust density, hierarchy, and visual expression based on the type of screen being built.

### Dashboards
- Lead with the most important metric, status, or exception.
- Group related information by the user's mental model, not by arbitrary component type.
- Use moderate density that supports scanning without turning the screen into a gallery of oversized cards.
- Keep quick actions visible for common tasks.
- Make time range and data freshness obvious.

### Admin Tools
- Optimize for speed, scanability, and operational efficiency.
- Prefer tables, lists, and filters over decorative card layouts.
- Keep controls close to the data they affect.
- Visual polish matters, but efficiency matters more.

### Forms and Task Flows
- Reduce friction by asking only for what is needed.
- Break complex work into sections or steps with clear progress.
- Keep the primary action obvious at each step.
- Preserve user input when possible.

### Settings Pages
- Group settings into clear sections with descriptive headings.
- Show the current state before asking users to change it.
- Place destructive settings in a clearly separated area near the bottom.

### Data-Heavy Views
- Favor tables and lists over card mosaics.
- Put summaries, filters, and search above the detail.
- Use dense but readable spacing.
- Do not hide essential columns or actions simply to make the layout look cleaner.

### Consumer-Facing App Screens
- Prioritize clarity, reassurance, and touch-friendly interaction.
- Use more whitespace than admin tools, but keep hierarchy strong.
- Make progress, next steps, and support paths easy to find.

### Marketing Pages
- This is the context with the most visual freedom, but hierarchy and readability still come first.
- Strong visuals should support the message, not distract from it.
- Do not let marketing conventions leak into authenticated product screens unless explicitly asked.

---
## Anti-Pattern Protection: Not Vibe Coded
### The design must not feel like
- random premium components stitched together without a system
- a landing page template pasted into a dashboard
- styling without UX reasoning
- a decorative redesign of a screen that already worked
- visual noise standing in for product logic

### Specific anti-patterns to avoid
- **Marketing in app screens:** Do not use heroes, gradient blobs, or feature-grid composition inside task-oriented product layouts.
- **Oversized cards as hierarchy:** Large cards are not a substitute for real grouping, alignment, typography, or information order.
- **Centered everything:** Centered layouts are for marketing sections, confirmations, and empty states. Task screens usually need left-aligned, scan-friendly structure.
- **Effects hiding weak structure:** If a section only works because it has blur, shadow, tint, and a gradient, the layout is probably weak. Fix the structure first.
- **Motion before fundamentals:** Do not add animation until layout, hierarchy, copy, spacing, and states are already solid.
- **More variety instead of more system:** Do not solve a weak screen by introducing more component types, more card styles, or more button variants.
- **App screens turned into marketing layouts:** Do not trade density and clarity for empty space and presentation styling when the screen exists to help users complete work.
- **Random restyling during edits:** Improving one component does not justify changing the entire screen's visual language.

### The design should feel
intentional, structured, cohesive, product-aware, realistic to build, trustworthy, and efficient to use.

---
## Implementation Consistency
### Reuse before creating
- Check the codebase for existing components, patterns, and tokens before building new UI.
- Extend existing patterns before introducing a new one.
- If a new variant is necessary, define its role clearly and keep it aligned with the existing component family.

### Constrain values
- Keep spacing, typography, radius, shadow, and color usage on a disciplined scale.
- Prefer existing tokens, variants, and utility patterns over local one-off overrides.

### Reuse interaction behavior
- Keep save flows, edit flows, selection behavior, filters, and destructive actions consistent across screens.
- If the product uses drawers for editing, do not switch to modal editing for a similar task without a reason.
- If the product uses inline validation or bottom action rows, preserve that pattern unless it is causing real friction.

### Keep the product feeling unified
- Components should look and behave like they belong to one product system, not a collection of locally designed sections.
- Shared components should be updated at the source when a true systemic fix is needed.
- Name components by role and behavior, not by styling details.

---
## Responsive Behavior
### Rules
- Every layout must work at desktop, tablet, and mobile sizes used by the project.
- Use the project's existing breakpoints; do not introduce new ones casually.
- Card grids should collapse systematically, such as 4 to 2 to 1 or 3 to 2 to 1.
- Forms should stack to a single column on small screens unless the existing design system intentionally supports another pattern.
- Toolbars and action rows should wrap cleanly rather than overflow.
- Tables should scroll horizontally on small screens rather than silently dropping important information.
- Keep touch targets at least 44x44px when used on touch devices.
- Do not hide critical actions behind hover-only interactions.
- Test long labels, long values, empty states, and error text at smaller widths.
- Match the project's existing responsive approach, whether it is mobile-first or desktop-first.
- Preserve the screen's primary task at smaller sizes.

---
## Required Self-Review Before Final Output
Before finalizing UI work, check every item:
- [ ] Is the user goal obvious from the layout?
- [ ] Is the primary action obvious?
- [ ] Is the hierarchy clear in under 3 seconds?
- [ ] Is spacing consistent and on the defined scale?
- [ ] Is typography consistent and role-based?
- [ ] Are existing codebase patterns reused?
- [ ] Did I improve the requested area without unnecessary redesign?
- [ ] Are all relevant states handled, not just the default state?
- [ ] Are empty, loading, error, and success states implemented where needed?
- [ ] Are destructive actions confirmed or otherwise safely handled?
- [ ] Is the layout responsive at the project's real breakpoints?
- [ ] Is anything decorative but unnecessary?
- [ ] Does this feel like one coherent product system rather than AI-generated styling?
If the answer to any of these is no, revise before finalizing.

---
## Output Expectations
When generating or editing UI:
1. State the user goal in one sentence.
2. Note only the key decisions that materially affect hierarchy, reuse, state handling, consistency, or responsiveness.
3. Mention any important trade-off or deliberate non-change.
4. Then produce implementation-ready frontend code or precise edits.
Keep rationale short and practical. Explain only the decisions that matter. Do not write essays before code. Do not output vague mockup language. Translate reasoning into structure, reusable patterns, concrete UI decisions, and buildable code.
