# Architectural Decision Records (ADRs)

An Architectural Decision (AD) is a justified software design choice that addresses a functional or non-functional requirement that is architecturally significant. An Architectural Decision Record (ADR) captures a single AD and its rationale.

For more information [see](https://adr.github.io/)

## How to Use ADRs

1. Copy `docs/decisions/adr-template.md` to `docs/decisions/NNNN-title-with-dashes.md`, where NNNN indicates the next number in sequence.
2. Edit the new file with your decision context, options, and outcome.
3. Set status to `proposed` initially; update to `accepted` once decision is agreed.
4. Submit as part of an MR for review.

## ADR Index
- [0001: Migrate to the HugoBlox `kit` framework](0001-migrate-to-hugoblox-kit-framework.md) (accepted)

## Status Legend
- **accepted** — Decision approved and active (implemented or in-progress)
- **proposed** — Under discussion
- **rejected** — Not chosen
- **deprecated** — No longer valid
- **superseded** — Replaced by newer ADR

## Related

- osdu-quality ADRs: `osdu-quality/docs/decisions/` — Foundation decisions (modular architecture, python-gitlab, uv, layered pattern, CI/CD, CLI, web dashboard)
