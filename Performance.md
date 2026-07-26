# PERFORMANCE.md

# Learnify Performance Standards

This document defines the performance requirements for the Learnify Learning Management System.

All features must follow these rules.

If a requested implementation conflicts with this document, stop and explain the conflict before generating code.

---

# Core Performance Goals

Learnify must feel:

- Fast
- Smooth
- Responsive
- Lightweight
- Predictable

Performance is part of the product experience.

Do not add code that makes the application feel heavy or slow.

---

# General Principles

Prefer simple implementations over unnecessary complexity.

Avoid expensive work during initial render.

Avoid repeated work that can be cached or reused.

Do not optimize blindly.

Only optimize when there is a clear benefit.

---

# Frontend Performance

The frontend must:

- Load quickly
- Render smoothly
- Avoid unnecessary re-renders
- Avoid large blocking operations
- Use efficient component structure

Do not place heavy logic inside render paths.

Do not fetch the same data repeatedly from multiple components.

---

# Component Performance

Components must be:

- Small
- Focused
- Reusable
- Efficient

Avoid deeply nested component trees when a simpler structure will do.

Use memoization only when it solves a real performance problem.

Do not use premature optimization.

---

# Rendering Rules

Avoid unnecessary state updates.

Avoid re-rendering large sections of the UI for small local changes.

Keep state as local as possible.

Only lift state when needed.

Prefer stable props and stable callbacks where appropriate.

---

# Data Fetching

Use a clean data-fetching layer.

Do not duplicate API calls across components.

Cache data when appropriate.

Avoid refetching data unnecessarily.

Load only the data required for the current page or view.

---

# Code Splitting

Split code by route and feature where appropriate.

Load large views lazily when they are not immediately needed.

Use dynamic imports for heavy or infrequently used features.

Do not bundle unused code into the initial load.

---

# Image Performance

Optimize images for size and delivery.

Use appropriately sized images.

Do not load unnecessarily large images.

Use lazy loading where appropriate.

Use modern image formats when supported.

Keep cover images and thumbnails efficient.

---

# Video Performance

Video is one of the heaviest parts of the product.

Always use efficient video delivery.

Do not load video data before it is needed.

Do not autoplay heavy media unnecessarily.

Use placeholders and loading states before playback starts.

Do not block the rest of the page while video initializes.

---

# Dashboard Performance

The Learning Dashboard must remain responsive even with:

- Video
- Playlist
- Resources
- Progress
- Next lecture information

Keep dashboard updates targeted.

Do not refresh the entire dashboard when only one lecture changes.

---

# List and Grid Performance

Course lists, lecture lists, and resource lists must remain smooth.

Use pagination or incremental loading when lists can grow large.

Do not render huge collections all at once if it can be avoided.

Avoid expensive computations inside list render loops.

---

# Search Performance

Search must feel responsive.

Debounce search where appropriate.

Do not trigger unnecessary requests on every keystroke.

Return focused results.

Do not overload the UI with too many results at once.

---

# Animation Performance

Animations must be subtle and efficient.

Use Framer Motion only when it improves the experience.

Use:

- Fade
- Slide
- Scale
- Opacity transitions

Keep durations short.

Avoid:

- Excessive motion
- Long animation chains
- Heavy layout thrashing
- Unnecessary bounce or elastic effects

Do not animate everything.

---

# Responsive Performance

The application must remain efficient across:

- Mobile
- Tablet
- Desktop
- Large desktop

Avoid layouts that force horizontal scrolling.

Avoid heavy desktop-only patterns that break smaller screens.

Do not ship components that become slow on lower-end devices.

---

# API Performance

Backend APIs must be efficient.

Avoid unnecessary database queries.

Avoid N+1 query patterns.

Return only the data needed for the current view.

Use pagination for large result sets.

Use indexes where appropriate.

Keep response payloads small and focused.

---

# Database Performance

Use MongoDB efficiently.

Design queries carefully.

Use indexes for frequently filtered or sorted fields.

Avoid fetching large unneeded documents.

Avoid repeated reads when a single query is enough.

Do not overuse population when a leaner query works better.

---

# Loading States

Every async experience must have a loading state.

Loading states must be lightweight and clear.

Do not block the page without feedback.

Use skeletons, loaders, or placeholders where appropriate.

Loading states should not cause layout jumps.

---

# Empty States

Empty states must render quickly and clearly.

Do not replace empty states with unnecessary heavy UI.

Keep empty states simple and helpful.

---

# Error Handling Performance

Do not retry failed actions endlessly.

Do not create repeated error loops.

Show a stable error state.

Avoid repeated expensive recovery attempts.

---

# Memory and Resource Use

Do not leak event listeners.

Do not create unnecessary timers.

Do not keep unused subscriptions alive.

Clean up side effects when components unmount.

Avoid background work that continues after the user leaves a page.

---

# Accessibility and Performance

Accessibility must not make the app heavy.

Keep semantic HTML simple and efficient.

Use accessible patterns without adding unnecessary complexity.

Performance and accessibility must both be preserved.

---

# Third-Party Dependencies

Do not add packages unless they solve a real need.

Prefer lightweight dependencies.

Avoid duplicate libraries that solve the same problem.

Avoid large packages for small tasks.

Every dependency should be justified.

---

# Build Size

Keep the initial bundle lean.

Do not introduce unnecessary global imports.

Avoid large shared utilities that pull in too much code.

Use tree-shakeable imports where possible.

---

# Monitoring Mindset

If a feature becomes slow, identify the bottleneck before changing code.

Do not guess.

Measure the issue first.

Then fix the real problem.

---

# AI Development Rules

Claude must:

- Avoid unnecessary re-renders
- Avoid duplicate fetching
- Avoid heavy logic in render
- Prefer lazy loading when appropriate
- Prefer efficient list rendering
- Avoid large bundle growth
- Preserve smooth interactions

If a requested implementation is likely to hurt performance:

Stop.

Explain why.

Suggest a more efficient implementation.

---

# Definition of Done

A feature is complete only when:

- It feels fast
- It renders smoothly
- It does not introduce unnecessary re-renders
- It does not duplicate API calls
- It uses loading states appropriately
- It remains responsive
- It avoids unnecessary bundle growth
- It follows the Learnify architecture
- It preserves user experience