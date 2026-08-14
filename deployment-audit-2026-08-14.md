# Deployment audit — 2026-08-14

The source fix is present in commits `e081dc5` and `43222ea` on `main` in `buddduaviogt668/AMES_Job_management_system`.

GitHub reports successful production deployments for two environments at commit `43222ea`:

| Environment | Deployment target | Status |
|---|---|---|
| `Production – ames-job-management-system` | `https://ames-job-management-system-j8t8bv35q-georgeskar-8680s-projects.vercel.app` | success |
| `Production – ames-qualification-app` | `https://ames-qualification-18c4ku49s-georgeskar-8680s-projects.vercel.app` | success |

Opening the first Vercel target through the browser redirects to Vercel login, so deployment protection prevents anonymous visual verification.

`https://www.amesfoodadvisory.com.au` returns a public Vercel-hosted marketing site. Its markup contains the public Ames site and Calendly links, but no obvious job-management portal link.

The running portal URL/custom domain and the deployment actually used by the user remain unverified. No invoice was sent, marked paid, or modified during this audit.

Next step: ask the user for the exact portal URL they are viewing, or have them open the successful production deployment after logging into Vercel, so the live bundle can be verified against the pushed source.

Last updated: 2026-08-14.
