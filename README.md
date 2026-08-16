# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


## OneDrive for Business document storage

The portal supports the Sydney Automation Co. `Ames Food Advisory` shared folder through Microsoft Graph delegated permissions. The approved folder model is:

| Document | OneDrive path |
|---|---|
| Proposal DOCX | `Ames Food Advisory / Client Name / AFA-P-###### / Proposal` |
| Invoice PDF | `Ames Food Advisory / Client Name / AFA-###### / Invoices` |
| Job documents | `Ames Food Advisory / Client Name / AFA-###### / Job Documents` |

Configure the Vercel deployment with `VITE_MICROSOFT_CLIENT_ID`, `VITE_MICROSOFT_TENANT_ID`, `VITE_MICROSOFT_REDIRECT_URI`, and `VITE_ONEDRIVE_ROOT_SHARE_URL`. The root share URL is intentionally not committed to source control.

Because this is a React/Vite application running in the browser, the Microsoft app registration must include a **Single-page application (SPA)** redirect URI for the deployed portal origin. The portal uses MSAL PKCE with delegated `Files.ReadWrite`, so a client secret must not be placed in Vite variables or shipped to the browser. The previously created client secret can remain unused; it is not required for this browser-only connection.

When connected from Settings, new proposal and job records initialize their folders idempotently. The Proposal Generator’s DOCX action can save the generated proposal to OneDrive, and the Invoice Generator’s `Save Invoice to OneDrive` action captures the existing two-page AMES invoice as a PDF and uploads it to the invoice folder.
