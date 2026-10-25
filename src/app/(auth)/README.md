# (auth)

## Purpose

Route group for the signed-out auth pages.

## Contents

- `layout.tsx`: forces per-request rendering so the nonce CSP from `proxy.ts` reaches the login and reset-password scripts.
- `login/`, `reset-password/`: the pages themselves (see their READMEs).

## Parent

[app](../README.md)
