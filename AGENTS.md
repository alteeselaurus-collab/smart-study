# Project Guidance

## User Preferences

- Application éducative mondiale destinée à tous les élèves
- Interface simple, rapide, moderne et facile à utiliser, même pour un élève débutant
- Méthode d'apprentissage en 7 étapes : Comprendre → Exemple → S'entraîner → Corriger → Mémoriser → Tester → Maîtriser
- Slogan : « Apprendre. Comprendre. Maîtriser. »
- Application web responsive utilisable sur Android, iPhone et ordinateur
- Interface et contenu en français

## Verified Commands

- **typecheck**: `mops check --fix`
- **build**: `mops build`

## Learnings

- Frontend level vocabulary is exactly primaire/college/lycee/superieur; seeded lesson levels and the default profile level must use those values or listLessons returns nothing.
- ensureProfile writes a profile on every getProgress/getRewards call, so a backend default silently becomes the frontend's active level.
- Radix Select fires onValueChange('') when its controlled value transitions from the placeholder to a real value; guard select handlers with `if (!value) return;`.
- Under Enhanced Migration with check-limit=1, keep exactly one pending migration file and declare every stable field in the actor body with a type and no initializer.
- A top-level let in a Motoko mixin is implicitly stable state and traps at runtime; pass shared state as a mixin parameter.
- Never JSON.stringify backend objects in the frontend — BigInt throws 'Do not know how to serialize a BigInt'.
- The generated test suite lives under src/frontend/src/__tests__/ and test/pocketic/; production workers must not edit test files.
- Local-deploy preflight could not verify runtime behavior in this build (tester transport error); the app tree was recorded as deployable without a browser run.
