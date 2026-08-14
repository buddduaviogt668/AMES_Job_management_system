# Proposal Sequence Delivery Report

## Requested correction

The proposal sequence is corrected so Chew Boy can be entered as `AFA-P-100010` and MSS Manning Support Services is normalized to `AFA-P-100011`.

## Implementation

The portal now detects an existing Manning proposal by business name, updates its proposal number to `AFA-P-100011`, and updates linked job and invoice references from the old number without changing invoice status or payment state. The migration is collision-protected: if `AFA-P-100011` is already owned by another proposal or job, the portal leaves records unchanged and displays an error instead of overwriting data.

The Proposal Generator now includes an `Enter older proposal` form for proposals created before the portal. Users can enter the numeric suffix `10`, which is stored as `AFA-P-100010`, along with the business and client details. The form refuses to create a duplicate when the requested number is already present in proposals, jobs, or invoices. Normal future proposal creation continues from the highest shared AFA sequence, so after numbers 10 and 11 are present the next generated proposal is 12.

## Verification

Eight unit tests pass, lint reports zero errors with one pre-existing Toasts Fast Refresh warning, and the production build completes successfully. The local browser preview confirmed the legacy-entry action and the numeric `10` Chew Boy form defaults.

No customer, job, invoice, payment, or proposal record was deleted. No invoice was sent or marked paid.

## Persistent reload verification setup

A temporary local-storage test record was injected with MSS Manning Support Services at AFA-P-100010, a linked job at AFA-P-100010, and a deposit invoice reference at AFA-P-100010. The portal was reloaded to verify that the post-load migration repairs the dropdown and linked records. The original local test values were preserved in session storage and are not live customer data.

The post-load browser check surfaced a blank Dashboard because the intentionally minimal synthetic invoice test record lacked fields expected by the dashboard, not because the proposal migration threw an error. The local browser console showed no migration exception, and the original local test data was restored immediately after the check. The pure migration regression tests cover the same proposal/job/invoice repair path with complete fixtures.

A clean reload test with only a temporary legacy Manning proposal added completed successfully: the portal loaded normally after migration, the dashboard rendered, and the active job reference was normalized to AFA-P-100011. The temporary record is still local-only and will be removed before final verification.

## Dropdown verification result

After reloading the portal with a temporary stored Manning proposal at AFA-P-100010, the Proposal Generator dropdown displayed `AFA-P-100011 — Manning Support Services — Approved`. The temporary local-only record was removed immediately after verification.
