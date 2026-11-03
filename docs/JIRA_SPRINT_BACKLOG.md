# SOLACE Jira backlog

The current Jira space is **My Scrum Space**, project key **SCRUM**. The backlog contains 25 SOLACE Tasks (`SCRUM-1` through `SCRUM-25`). This document mirrors their titles for reference; Jira is the source of truth for assignees, status, acceptance criteria, and sprint placement.

[Open the Jira backlog](https://zeuus610.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog)

| Issue | Task |
|---|---|
| [SCRUM-1](https://zeuus610.atlassian.net/browse/SCRUM-1) | Document URL scanning API contract and response schema |
| [SCRUM-2](https://zeuus610.atlassian.net/browse/SCRUM-2) | Add URL normalization and canonicalization before analysis |
| [SCRUM-3](https://zeuus610.atlassian.net/browse/SCRUM-3) | Handle redirects with a configurable hop limit |
| [SCRUM-4](https://zeuus610.atlassian.net/browse/SCRUM-4) | Add domain age and registration metadata to scan results |
| [SCRUM-5](https://zeuus610.atlassian.net/browse/SCRUM-5) | Show the evidence behind each risk score |
| [SCRUM-6](https://zeuus610.atlassian.net/browse/SCRUM-6) | Record provider latency and failure metrics |
| [SCRUM-7](https://zeuus610.atlassian.net/browse/SCRUM-7) | Cache reputation lookups with a short configurable TTL |
| [SCRUM-8](https://zeuus610.atlassian.net/browse/SCRUM-8) | Validate URL schemes, length, and malformed input |
| [SCRUM-9](https://zeuus610.atlassian.net/browse/SCRUM-9) | Improve mobile layout for scan results |
| [SCRUM-10](https://zeuus610.atlassian.net/browse/SCRUM-10) | Add keyboard navigation and screen reader labels |
| [SCRUM-11](https://zeuus610.atlassian.net/browse/SCRUM-11) | Design clear loading, empty, and provider error states |
| [SCRUM-12](https://zeuus610.atlassian.net/browse/SCRUM-12) | Implement rate limiting for the public scanner endpoint |
| [SCRUM-13](https://zeuus610.atlassian.net/browse/SCRUM-13) | Add export for detailed scan results |
| [SCRUM-14](https://zeuus610.atlassian.net/browse/SCRUM-14) | Add unit coverage for URL parsing and normalization |
| [SCRUM-15](https://zeuus610.atlassian.net/browse/SCRUM-15) | Add provider failure integration tests |
| [SCRUM-16](https://zeuus610.atlassian.net/browse/SCRUM-16) | Add end-to-end scan flow smoke coverage |
| [SCRUM-17](https://zeuus610.atlassian.net/browse/SCRUM-17) | Document deployment steps and required environment variables |
| [SCRUM-18](https://zeuus610.atlassian.net/browse/SCRUM-18) | Document risk score signals and known limitations |
| [SCRUM-19](https://zeuus610.atlassian.net/browse/SCRUM-19) | Add a health check for scanner API dependencies |
| [SCRUM-20](https://zeuus610.atlassian.net/browse/SCRUM-20) | Review CORS settings and safe external links |
| [SCRUM-21](https://zeuus610.atlassian.net/browse/SCRUM-21) | Add structured logs with scan correlation IDs |
| [SCRUM-22](https://zeuus610.atlassian.net/browse/SCRUM-22) | Build a safe local URL fixture set for regression checks |
| [SCRUM-23](https://zeuus610.atlassian.net/browse/SCRUM-23) | Review false positives for common safe URLs |
| [SCRUM-24](https://zeuus610.atlassian.net/browse/SCRUM-24) | Create a browser and device QA checklist |
| [SCRUM-25](https://zeuus610.atlassian.net/browse/SCRUM-25) | Define screenshot evidence checklist for completed team work |

## Documentation references

The repository now contains documentation relevant to these backlog items:

- `SCRUM-1` — [API contract](API.md)
- `SCRUM-17` — [Deployment steps and configuration](DEPLOYMENT.md)
- `SCRUM-18` — [Risk signals and limitations](SCORING_AND_LIMITATIONS.md)
- `SCRUM-25` — [Screenshot evidence workflow](TEAM_WORKFLOW.md)

These links document the current implementation. The team should review and update the corresponding Jira issues as work is accepted; listing a document here does not change Jira status.

For pull requests, include the issue key in the branch name or commit message. See [team workflow and screenshot evidence](TEAM_WORKFLOW.md) for how to record completed work.
