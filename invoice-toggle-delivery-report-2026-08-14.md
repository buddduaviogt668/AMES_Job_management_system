# AMES Food Advisory — Invoice Generator Toggle Delivery Report

The manual **Invoice Type** toggle has been successfully implemented, unit-tested, visually verified, and pushed to your GitHub repository (`buddduaviogt668/AMES_Job_management_system`, commit `2764223`).

## Summary of Changes

| Feature / Fix | Implementation Detail |
|---|---|
| **Explicit Invoice Type Selector** | Added a prominent toggle control directly above the invoice document in `InvoiceGenerator.jsx` allowing instant switching between **Tax Invoice** and **50% Deposit Invoice**. |
| **Reversible Calculations** | Stored full line items so switching between Tax Invoice and 50% Deposit Invoice recalculates subtotals, GST, deposit totals, balance remaining, and Stripe card fees without losing original proposal pricing. |
| **Dynamic Document Rendering** | The selected invoice type updates document banners (`TAX INVOICE` vs `50% DEPOSIT INVOICE`), item descriptions, subtotal headings, and deposit footnotes. |
| **Automated Testing** | Added robust Node.js unit tests (`src/lib/invoiceCalculations.test.js`) covering tax invoice defaults, automatic 50% deposit calculations, and full amount restoration. |
| **Zero Data Disruption** | No live invoice records were modified, sent, or marked paid during testing; all drafts remain untouched in unpaid status. |

## Verification Results

- **Unit Tests:** Passed cleanly (`3/3` tests).
- **Production Build:** `vite build` completed successfully (`dist/index.html` compiled with no errors).
- **Visual Check:** Verified locally in the browser preview that clicking the toggle instantly updates all labels, totals, and payment breakdown figures.

Last updated: 2026-08-14.
