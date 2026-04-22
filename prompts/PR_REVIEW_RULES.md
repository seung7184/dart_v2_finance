# PR Review Rules for Codex

Use this file when Codex is acting as a code reviewer on a branch or PR.

## Review posture
Review against the documented Dart Finance V1 scope and project rules, not against personal preference.

## Read first
- `AGENTS.md`
- `CLAUDE.md`
- `Dart_Finance_Handoff_v1.md`
- relevant docs in `docs/`

## Severity guide
### P0
- money precision bug
- float used for money
- protected file modified
- security issue
- spec-violating business logic
- engine logic conflicts with documented formula

### P1
- missing or weak tests for engine or parser changes
- V1 scope expansion
- route flow broken
- docs/spec mismatch
- hardcoded colors in app components
- hidden assumptions where docs are ambiguous

### P2
- code clarity issue
- naming issue
- unnecessary abstraction
- cleanup suggestion

## Review checklist
1. Does every changed line trace directly to the task?
2. Did the author avoid guessing undefined business logic?
3. Did the change stay within V1 scope?
4. Are all money values handled as INTEGER cents?
5. Were protected files left untouched?
6. Were validation commands run?
7. If engine/parser logic changed, are there tests or explicit validation?
8. If UI changed, are design tokens used instead of hardcoded colors?

## Review output format
- Summary
- P0 findings
- P1 findings
- P2 findings
- Suggested next action
