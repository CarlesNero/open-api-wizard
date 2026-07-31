# AGENTS.md

# Engineering Principles

## Mindset

Always deliver complete, production-ready solutions.

Understand the existing codebase before making changes.

Think before coding. Understand before modifying.

Choose the simplest solution that satisfies the requirements.

Avoid over-engineering.

Consistency with the existing project is more important than cleverness.

Prefer improving existing code over introducing new files.

---

## Existing Code First

Before writing any code:

1. Search the codebase for an existing implementation.
2. Reuse existing components, services, directives, pipes, utilities, models and types whenever possible.
3. Extend existing functionality instead of creating parallel implementations.
4. Follow the project's architecture, naming conventions and folder structure.
5. Prefer modifying existing files over creating new ones.
6. Create new files only when there is no suitable place for the implementation.
7. Do not duplicate functionality already present in the project.
8. If multiple patterns exist, follow the one most commonly used in the codebase.
9. Understand the surrounding code before making changes.
10. Preserve backwards compatibility unless explicitly requested otherwise.

---

## Code Quality

Write readable, maintainable and scalable code.

Follow SOLID principles where appropriate.

Keep functions, services and components focused on a single responsibility.

Prefer composition over inheritance.

Avoid duplicate logic.

Extract reusable utilities only after the second real use case.

Prefer immutable code.

Always remove dead code.

Always remove unused imports.

Never leave TODOs, placeholder implementations or commented-out code unless explicitly requested.

---

## Testing

Every bug fix should include a regression test whenever possible.

Every new feature should include tests when applicable.

Code must build successfully before considering a task complete.

---

## Performance

Prefer simple algorithms.

Avoid unnecessary allocations.

Avoid unnecessary dependencies.

Lazy load features whenever possible.

Optimize bundle size.

---

## Security

Never expose secrets.

Never hardcode credentials.

Never execute destructive operations automatically.

Do not bypass git hooks.

---

# Decision Making

Before making architectural decisions:

1. Inspect the existing codebase.
2. Follow existing conventions.
3. Reuse existing abstractions.
4. Prefer consistency over novelty.
5. Choose the solution that introduces the least complexity.
6. Ask for clarification instead of making architectural assumptions.

---

# TypeScript Guidelines

Use strict typing.

Prefer inferred types when obvious.

Never use `any` unless explicitly required by an external library.

Use `unknown` when the type is uncertain.

Prefer `readonly` whenever possible.

Prefer immutable updates.

Avoid unnecessary type assertions.

Prefer `const` over `let`.

Use the project's existing TypeScript conventions.

---

# Angular Guidelines

Use the latest stable Angular patterns.

Always use Standalone Components.

Never use NgModules.

Do not explicitly set `standalone: true`.

Do not explicitly set `ChangeDetectionStrategy.OnPush`.

Use the `inject()` function instead of constructor injection.

Prefer the `@Service` decorator for singleton services.

Use lazy-loaded routes.

Use `NgOptimizedImage` for static images.

Do not use `@HostBinding`.

Do not use `@HostListener`.

Use the `host` property inside decorators.

---

# Components

Components must have a single responsibility.

Keep components small and composable.

Prefer inline templates for small components.

Use:

- `input()`
- `output()`
- `model()`

Prefer:

- `signal()`
- `computed()`
- `linkedSignal()`
- `resource()`

Use `effect()` only for side effects.

Never use `effect()` to synchronize application state.

Prefer presentational components whenever possible.

Avoid large smart components.

---

# State Management

Signals are the only state management solution.

Never use RxJS for application state.

Never create Observable-based stores.

Never use:

- Subject
- BehaviorSubject
- ReplaySubject
- AsyncSubject

Never mutate Signals.

Always use:

- signal()
- computed()
- linkedSignal()
- resource()
- set()
- update()

Prefer derived state instead of duplicated state.

Use `computed()` instead of synchronizing multiple Signals manually.

State should remain immutable.

---

# RxJS Policy

RxJS is forbidden for application state and business logic.

Observables must only exist at framework boundaries.

Never expose Observables from application services.

Immediately convert Observables into Signals using `toSignal()` whenever possible.

Do not introduce:

- subscribe()
- pipe()
- map()
- switchMap()
- mergeMap()
- concatMap()
- exhaustMap()
- combineLatest()
- forkJoin()
- zip()

Observable sources are only acceptable when required by Angular or external libraries, such as:

- HttpClient
- Router
- ActivatedRoute
- WebSocket
- Third-party SDKs

Templates must consume Signals instead of Observables.

---

# Forms

Prefer Signal Forms.

When Signal Forms cannot be used, use Reactive Forms.

Never use Template Driven Forms.

Use schema validation whenever possible.

Keep validation strongly typed.

---

# Templates

Keep templates simple.

Never place business logic inside templates.

Use:

- `@if`
- `@for`
- `@switch`

Never use:

- `*ngIf`
- `*ngFor`
- `*ngSwitch`

Prefer `class` bindings over `ngClass`.

Prefer `style` bindings over `ngStyle`.

Read Signals directly.

Avoid the `async` pipe whenever possible.

Never perform expensive computations inside templates.

Move derived state into `computed()`.

Do not assume globals such as:

- `window`
- `document`
- `Math`
- `new Date()`

inside templates.

---

# Services

One responsibility per service.

Prefer stateless services.

Use dependency injection with `inject()`.

Avoid global mutable state.

Keep services framework-independent whenever possible.

---

# Accessibility

Every implementation must satisfy WCAG AA.

Every implementation must pass AXE validation.

Always provide:

- Keyboard navigation
- Focus management
- Semantic HTML
- Sufficient color contrast
- Correct ARIA attributes

Accessibility is never optional.

---

# Styling

Prefer CSS over unnecessary JavaScript.

Prefer CSS variables.

Keep spacing consistent.

Avoid inline styles unless necessary.

---

# Documentation

Document non-obvious decisions.

Prefer self-documenting code over comments.

Comments should explain **why**, not **what**.

---

# Before Finishing Any Task

Verify:

- Project builds successfully.
- No TypeScript errors.
- No lint errors.
- No unused imports.
- No dead code.
- Accessibility requirements are satisfied.
- Existing architecture is respected.
- No unnecessary dependencies were added.
- Generated code follows the project's formatting conventions.
- Code follows the project's naming conventions.

---

# Response Style

Be concise.

Be direct.

Reference files and functions when relevant.

Explain important design decisions and trade-offs only.

Do not explain obvious code.

Do not generate placeholder code.

Do not generate incomplete implementations.

Always prefer finished solutions over partial examples.

Inspect the existing codebase before making assumptions.

When requirements are ambiguous, ask before implementing.
