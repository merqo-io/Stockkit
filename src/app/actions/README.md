# actions

## Purpose

Server actions shared across routes rather than colocated with a single page — vendor NPS feedback and Get-help support messages, both filed into the shared cross-kit `merqo` schema.

## Contents

- `feedback.ts` — `submitFeedbackAction(input: FeedbackInput): Promise<ActionResult>`. Validates with `feedbackSchema`, requires a signed-in vendor, then inserts via `submitVendorFeedback` (`@/lib/merqo-vendor-feedback`) which calls the shared `merqo.submit_vendor_feedback` SECURITY DEFINER RPC — the RPC derives `vendor_id` from `auth.uid()` itself, never a passed-in value.
- `feedback.test.ts` — covers the signed-in RPC-call path, schema rejection, the "please sign in" path, and RPC-failure handling.
- `support.ts` — `submitSupportMessageAction(input: unknown): Promise<ActionResult>`. Validates with `supportMessageSchema`, requires a signed-in vendor, then files the message via `submitSupportMessage` (`@/lib/merqo-support`) into the shared `merqo.support_messages` inbox through `merqo.submit_support_message` (SECURITY DEFINER). Inline session check, not a shared vendor-auth guard — backs `@merqo/ui`'s `AccountMenu`-embedded `HelpSheet`, not a full page.
- `support.test.ts` — covers the signed-in RPC-call path, schema rejection, the "please sign in" path, and RPC-failure handling.

## Connectivity

Each file is a `"use server"` module imported directly by the client component that triggers it: `feedback.ts` and `support.ts` by `src/app/dashboard/dashboard-nav.tsx`, which wires them into `@merqo/ui`'s `AccountMenu` `onFeedbackSubmit`/`getHelp.onSubmit` props as throw-adapters (the shared contract expects a rejected promise on failure; these actions return `{success, error}`). Both go through the RLS-scoped `createServerClient()`, no service-role usage, since the target RPCs are SECURITY DEFINER and derive the vendor identity themselves.

## Parent

[app](../README.md)

Signup, feedback and profile saves are rate limited through `src/lib/rate-limit.ts` and fail closed.
