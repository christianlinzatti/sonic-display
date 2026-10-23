# V230 – Multi-Avatar Dance Director 2.0

Builds on V229; keeps the V206 localStorage settings compatible.

- Existing alternating lead/background and call-response roles remain under one shared beat clock.
- Adds bar-based line/diagonal/wide formations; strong drops choose wide formation.
- Background gesture timing follows with half-beat offset during solo phrases.
- All formation changes interpolate through frame-independent easing and preserve minimum distance, foot IK and partner contact.
- Track changes reset the shared clock. Reduced motion disables new phrase changes.
- Currently supports exactly two dancers; not a general N-avatar formation engine.
- Run `npm run verify:offline` or `npm run verify` once dependencies are installed.
