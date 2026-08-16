# OneDrive for Business integration research — 16 August 2026

The Microsoft Graph documentation used for this integration is:

1. Working with files in Microsoft Graph: https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0
2. Create a new folder in a drive: https://learn.microsoft.com/en-us/graph/api/driveitem-post-children?view=graph-rest-1.0
3. Upload or replace the contents of a driveItem: https://learn.microsoft.com/en-us/graph/api/driveitem-put-content?view=graph-rest-1.0
4. Register an application with the Microsoft identity platform: https://learn.microsoft.com/en-us/graph/auth-register-app-v2

Verified implementation facts from those sources:

- Microsoft Graph represents OneDrive files and folders through Drive and DriveItem resources.
- A folder can be created under a parent DriveItem with `POST /drives/{drive-id}/items/{parent-item-id}/children`; delegated `Files.ReadWrite` is listed as the least-privileged permission for a work or school account.
- A file up to 250 MB can be uploaded or replaced with `PUT .../{parent-id}:/{filename}:/content`; delegated `Files.ReadWrite` is also the least-privileged work/school permission for that operation.
- Microsoft app registration creates an Application (client) ID and Directory (tenant) ID. The deployed React/Vite portal uses MSAL browser PKCE and therefore does not ship a client secret to the browser.

The user-provided OneDrive root link was verified separately and resolved to an empty `Ames Food Advisory` folder under the Sydney Automation Co. OneDrive account. The root share URL is intentionally excluded from committed source and must be provided through Vercel environment configuration.
