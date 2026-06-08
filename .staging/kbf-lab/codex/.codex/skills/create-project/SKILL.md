# Create project

The roadmap becomes a tracked project: milestones and sub-issues a non-programmer can see, follow, and steer. This is where the plan becomes a thing with state — where Eric watches the build progress without reading code.

## When to use

- A roadmap is confirmed and you are ready to make the work trackable.

## When NOT to use

- The roadmap isn't confirmed.
- You are implementing a sub-issue — that's `implement-milestone`.

## Inputs

- The confirmed roadmap (milestones, sub-issues, dependencies, gates).
- The project tracker available in the host/ecosystem (e.g., a Linear-style project surface). If the tracking surface isn't provisioned, ask the platform (`consult-theory-mcp`) rather than inventing one.

## Procedure

1. **Create the project** with a plain-language name and goal Eric recognizes.
2. **Create milestones** from the roadmap — bounded, a handful, kept under nine so the whole shape is holdable.
3. **Create sub-issues** under each milestone — each one focused change, each described in plain language plus the technical specifics needed to build it.
4. **Encode dependencies** between milestones/sub-issues so the build order is explicit.
5. **Mark the gates** — sub-issues that require validation, and the deploy step that requires Eric's informed consent.
6. **Bound it.** If a milestone is sprouting many sub-issues, it's too big — split the milestone. Legibility is the constraint.

## Output

- A project with bounded milestones and sub-issues, dependencies and gates encoded, legible to Eric.
- A plain-language summary of the project shape for Eric (`report-status-to-eric`).

## Red flags

- Milestones with dozens of sub-issues — re-bound.
- Sub-issues written only in code terms Eric can't follow — add the plain-language layer.
- Creating the project before the roadmap is confirmed.

## After completing

- Walk Eric through the project shape.
- Begin building with `implement-milestone` (and `design-keybank-solution` / `make-submodule` / `create-submodule-agent` as the design calls for).