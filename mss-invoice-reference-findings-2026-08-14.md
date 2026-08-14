# MSS Manning invoice reference findings — 2026-08-14

The attached `MSS-ManningSupportServices_AFA-100011_Deposit_Tax_Invoice.pdf` is a two-page A4-style invoice reference.

## Page 1 structure

The page uses a restrained, professional white layout with a dark navy rounded header banner. The banner contains the AMES Food Advisory logo/wordmark at left, the title `DEPOSIT TAX INVOICE` in amber at right, and the invoice number `AFA-100011` beneath the title. A thin rule and compact contact strip show the ABN, phone, and email.

Below the banner, the content is organized as a two-column block. The left side contains `BILL TO`, the business name `MSS Inc. (Manning Support Services)`, contact name, street address, and email. The right side contains `INVOICE DETAILS` with invoice number, job reference `AFA-P-100011`, issue date, and payment terms `50% deposit due now`.

A thin horizontal rule separates the client block from `SCOPE OF WORK`. The scope is a short explanatory paragraph followed by three concise bullet lines. The line-item table has a navy header row with `DESCRIPTION`, `QTY`, `UNIT ($)`, and `AMOUNT ($)`. It contains four rows: `Site Audit / Gap Assessment Fee (Phase 1)`, `Compliance package`, `NSW Food Authority audit preparation`, and `Allergen review`.

The totals are compact and right aligned beneath the table. The reference displays `Full engagement subtotal (ex GST)`, `GST (10%)`, `Full project total (inc GST)`, `This deposit invoice — 50%`, and `Balance on final documentation`. A light gray-green payment panel contains `BANK TRANSFER` details with account name, account number, BSB, and reference. A stronger light gray-green bar beneath it reads `OUTSTANDING OWED NOW` with the deposit amount emphasized at far right.

## Page 2 structure

The second page is a terms page with the same dark navy rounded header treatment. The header reads `Terms & Conditions` at left and `Deposit Tax Invoice AFA-100011` at right. The terms text is arranged in two columns, numbered 1 through 8, with bold term headings followed by explanatory copy. A footer rule and closing line read `Thank you for choosing AMES Food Advisory.` followed by the website/email and phone.

## Adaptation requirements

The portal should match this hierarchy and spacing, but retain AMES Food Advisory’s existing logo component, green/navy/white palette, website `amesfoodadvisory.com.au`, email, phone, invoice numbering, editable invoice fields, and Tax Invoice versus 50% Deposit Invoice toggle. The existing Stripe payment panel can remain available in the interactive portal, but the printed deposit document should prioritize the reference’s bank-transfer and outstanding-owed-now presentation. No customer data, invoice status, or payment state should be altered merely by applying the layout.

## Local portal verification

The updated local portal rendered the compact AMES navy header, AMES Food Advisory logo, `DEPOSIT TAX INVOICE` title, invoice number, contact strip, two-column `BILL TO` / `DETAILS` block, `SCOPE OF WORK`, compact full-engagement line-item table, reference-style totals, bank transfer panel, `OUTSTANDING OWED NOW` bar, and a dedicated terms section headed `Terms & Conditions`.

Switching the same draft to `50% Deposit Invoice` rendered `DEPOSIT TAX INVOICE`, `Invoice Type: 50% Deposit Invoice`, `Payment Terms: 50% deposit due now`, full engagement subtotal, full project total, `This deposit invoice — 50%`, `Balance on final documentation`, and `OUTSTANDING OWED NOW` with the 50% amount. The selected draft remained unpaid and was not saved or sent during verification.

A lower-page browser check confirmed the reference-style bank-transfer panel, `OUTSTANDING OWED NOW` bar, compact card-payment editor, and two-column terms section with the AMES Food Advisory closing line. The terms editor remains visible in the interactive portal for editing but is marked `no-print`, so it is excluded from the printed reference output. The print stylesheet forces `.invoice-terms-page` to begin on a new page.
