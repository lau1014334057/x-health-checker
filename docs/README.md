# X Health Checker Docs

This folder contains the implementation-ready documentation set for the `X Health Checker` Chrome extension.

## Documents

1. [Product Overview](product-overview.md)
   Defines the product position, users, scope, MVP, and release boundaries.

2. [Technical Design](technical-design.md)
   Describes the Chrome extension architecture, backend responsibilities, runtime flows, and implementation choices.

3. [API Specification](api-spec.md)
   Defines the backend endpoints, request and response contracts, error model, and caching expectations.

4. [Data Model](data-model.md)
   Documents storage entities for local and cloud-backed modes, including extension storage keys.

5. [Development Plan](development-plan.md)
   Breaks down delivery into milestones, tasks, dependencies, estimates, and ownership suggestions.

6. [Acceptance and QA](acceptance-and-qa.md)
   Defines acceptance criteria, test cases, edge cases, release checklist, and monitoring.

7. [Troubleshooting](troubleshooting.md)
   Documents known local development and Chrome extension loading errors.

## Recommended Build Order

1. Product boundary confirmation
2. Extension shell and page detection
3. Backend aggregation endpoints
4. Score and visibility result rendering
5. History and cache
6. QA and release hardening
