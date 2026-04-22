# Launch Blocker Priority Sequence

Run in this order:

1. codex < prompts/BLOCKER1_SUPABASE_AUTH_WIRING.md
2. codex < prompts/BLOCKER2_OBSERVABILITY_LIVE_BOOTSTRAP.md
3. codex < prompts/BLOCKER3_REAL_BETA_SIGNUP_DESTINATION.md
4. codex < prompts/BLOCKER4_LEGAL_OWNER_TODO_FILL.md
5. codex < prompts/BLOCKER5_STRIPE_LIVE_WIRING.md
6. codex < prompts/BLOCKER6_REVENUECAT_LIVE_WIRING.md

Rules:
- Do not batch all six into one Codex run
- Commit after each blocker if validation passes
- If a blocker stops on missing owner inputs, capture the exact list and move only if appropriate
