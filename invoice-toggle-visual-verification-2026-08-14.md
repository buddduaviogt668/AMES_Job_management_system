# Invoice toggle visual verification — 2026-08-14

Local Vite preview was opened at `http://127.0.0.1:5173/`.

The Tax Invoices screen visibly shows an `Invoice type` control with two buttons:

- `Tax Invoice`
- `50% Deposit Invoice`

The default seeded invoice displays `TAX INVOICE`, `Invoice Type: Tax Invoice`, `TOTAL DUE`, and the full subtotal of `$2,095.00` ex GST / `$2,304.50` incl GST.

Clicking `50% Deposit Invoice` immediately changed the document to:

- Header: `50% DEPOSIT INVOICE`
- Header sublabel: `MONTAO QUALITY BAKERY · 50% DEPOSIT`
- Details: `Invoice Type: 50% Deposit Invoice`
- Line item: `50% Deposit — approved engagement (Montao Quality Bakery)`
- Deposit amount: `$1,047.50` ex GST / `$1,152.25` incl GST
- `DEPOSIT TOTAL DUE`
- `Balance remaining (incl GST) $1,152.25`
- Deposit footnote stating the remaining balance
- Card-payment total recalculated to the deposit amount plus the Stripe fee

No invoice was saved, sent, or marked paid during this visual check. The toggle was changed only in local in-memory UI state.

Screenshots captured by the browser tool:
- `/home/ubuntu/screenshots/127_0_0_1_2026-08-14_12-58-45_1194.webp`
- `/home/ubuntu/screenshots/127_0_0_1_2026-08-14_12-58-55_1798.webp`

Switching back to `Tax Invoice` restored the two original line items, `TAX INVOICE`, `Invoice Type: Tax Invoice`, `TOTAL DUE`, and the original `$2,095.00` ex GST / `$2,304.50` incl GST totals. The local verification again made no saved, sent, or paid invoice changes.
