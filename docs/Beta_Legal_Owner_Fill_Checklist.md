# Beta Legal Owner Fill Checklist

Version 1.0 · 2026-04-23
Owner: Seungjae
Status: Owner input required before replacing legal/contact placeholders

## Purpose

This checklist isolates the unresolved legal and contact values still marked as `TODO(owner)` in the current beta-facing legal pages.

This document does not complete legal review.
It only identifies the missing values and where each value must be inserted.

## Privacy Page Fill-Ins

Target: `apps/web/app/privacy/page.tsx`

### Operational placeholders card

Current placeholder:
- `insert legal entity name, registered address, and final privacy contact inbox`

Owner inputs required:
- Legal entity name
- Registered business address or official contact address
- Privacy contact email inbox

Insertion point:
- Privacy page
- Card heading: `Operational placeholders`
- First `TODO(owner)` paragraph

Current placeholder:
- `define retention windows for CSV uploads, waitlist submissions, and support conversations`

Owner inputs required:
- CSV upload retention window
- Waitlist submission retention window
- Support conversation retention window

Insertion point:
- Privacy page
- Card heading: `Operational placeholders`
- Second `TODO(owner)` paragraph

Current placeholder:
- `document the final deletion workflow once support ownership and backend storage are finalized`

Owner inputs required:
- Deletion request intake owner
- Deletion request contact path
- Deletion workflow summary
- Whether export rights are described here, in terms, or both

Insertion point:
- Privacy page
- Card heading: `Operational placeholders`
- Third `TODO(owner)` paragraph

## Terms Page Fill-Ins

Target: `apps/web/app/terms/page.tsx`

### Owner-supplied details still required card

Current placeholder:
- `insert governing entity, applicable jurisdiction, and effective date`

Owner inputs required:
- Governing legal entity name
- Governing law / jurisdiction language
- Effective date

Insertion point:
- Terms page
- Card heading: `Owner-supplied details still required`
- First `TODO(owner)` paragraph

Current placeholder:
- `add the final support email and feedback response expectations for beta participants`

Owner inputs required:
- Beta support email inbox
- Feedback intake destination
- Expected response window or support SLA wording

Insertion point:
- Terms page
- Card heading: `Owner-supplied details still required`
- Second `TODO(owner)` paragraph

Current placeholder:
- `decide whether invite revocation, data export, and beta sunset notice need explicit clauses before external invites begin`

Owner inputs required:
- Whether invite revocation needs an explicit clause
- Whether data export rights need an explicit clause in terms
- Whether beta sunset / shutdown notice needs an explicit clause

Insertion point:
- Terms page
- Card heading: `Owner-supplied details still required`
- Third `TODO(owner)` paragraph

## Consolidated Missing Values

- Legal entity name
- Registered business address or official contact address
- Privacy contact email inbox
- Beta support email inbox
- Feedback intake destination
- Effective date
- Governing law / jurisdiction language
- CSV upload retention window
- Waitlist submission retention window
- Support conversation retention window
- Deletion request owner
- Deletion request contact path
- Deletion workflow summary
- Whether export rights must be described in privacy, terms, or both
- Whether invite revocation needs an explicit clause
- Whether beta sunset / shutdown notice needs an explicit clause
- Expected response window / support SLA wording

## Related Source Of Truth

These missing values align with the broader owner checklist in `docs/Beta_Launch_Owner_Checklist.md`, but this document is the narrow fill-in map for the current legal page placeholders only.
