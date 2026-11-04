# V425 verification

- `npm run test:v425`: PASS
- `npx tsc -p tests/tsconfig.v425-core.json`: PASS
- Versioned regression chain `npm run test:v404` through `npm run test:v425`: 20/20 PASS for the explicitly scripted 404, 407–425 sequence (not every historically-numbered version)
- `npm run check:syntax`: PASS, 576 TS/TSX
- `npm run test:imports`: PASS, 912 project files / 1,940 imports
- `npm run test:module-case`: PASS, 912 project files, no case-insensitive collisions
- Dependency preflight: BLOCKED, 16 of 17 packages unavailable, no package-lock.json
- Full `npx tsc --noEmit` / `npm run build`: NOT RUN; cannot assert a production build.
- V425 has explicit safe priorities and optional activation; camera impulse is diagnostic only.
