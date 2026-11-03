# Team workflow and screenshot evidence

Use the Jira backlog to coordinate work, and use GitHub commits or pull requests as the source of code changes. Screenshots can show the result, but should accompany the code or documentation that produced it.

## For each Jira task

1. Confirm the issue is assigned to you and check its acceptance criteria or add them with the team if they are missing.
2. Create a short branch from the current default branch, for example `feature/SCRUM-12-rate-limit`.
3. Keep the change focused on the issue. Commit with the Jira key in the message, for example `feat(SCRUM-12): rate limit scan requests`.
4. Open a pull request or push the branch for review. Include the Jira key and a short summary.
5. Attach screenshots or a short recording to the Jira issue when visual evidence helps verify the result. Add the relevant commit or pull request link to the issue.
6. Move the Jira issue to Done only after its acceptance criteria are met and the work is visible in GitHub.

## What a useful screenshot shows

- The relevant SOLACE page or code output and the changed behavior.
- Enough surrounding UI to identify the page or workflow, without hiding the result.
- Browser or device size when the task concerns responsive behavior.
- A brief Jira comment describing what the screenshot demonstrates and linking to the related commit or pull request.

Use readable image names such as `SCRUM-09-mobile-results.png` or `SCRUM-16-scan-flow.png`. Prefer PNG for interface screenshots. Attach the original image rather than pasting it into a document that is hard to inspect.

## Protect private information

Before uploading, crop or blur passwords, access tokens, session cookies, personal messages, private user data, and any real suspicious URL that contains a secret. Do not commit credentials, `.env` files, private scan exports, or screenshots containing secrets. Use synthetic or redacted examples in screenshots and demo data.

## Jira project reference

The Jira backlog currently uses project key `SCRUM`. Its issue list is in [JIRA_SPRINT_BACKLOG.md](JIRA_SPRINT_BACKLOG.md); Jira remains the source of truth for each issue's current status and assignee.
