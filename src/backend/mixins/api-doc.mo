mixin () {
  public query func getApiDoc() : async Text {
    "# SMART STUDY — API Backend

Documentation statique de l'API du canister SMART STUDY.

## Objet

Le backend expose le catalogue pédagogique (matières, leçons, exercices,
contrôles), le parcours d'apprentissage en 7 étapes, les révisions
intelligentes, la progression, les récompenses, le profil élève et le
professeur IA. Il expose également ses données structurées via OQL
(`schema()` / `execute()`) pour l'agent Data Intelligence.

## Méthodes publiques

### Catalogue
- `listSubjects() : [SubjectView]` — liste des matières, triées par identifiant.
- `listLessons(subjectId, level) : [LessonSummary]` — leçons d'une matière pour un niveau ; `level = \"\"` renvoie tous les niveaux.
- `getLesson(lessonId) : ?LessonDetail` — détail d'une leçon (explication, exemple, points clés, fiche de mémorisation).
- `listExercises(lessonId) : [ExerciseView]` — exercices d'une leçon.
- `getExam(lessonId) : ?ExamView` — contrôle associé à une leçon.

### Parcours et exercices
- `getLessonProgress(lessonId) : ?LessonProgress` — état des 7 étapes pour l'appelant.
- `advanceStep(lessonId) : LessonProgress` — avance à l'étape suivante et met à jour `masteryRate`.
- `submitAnswer(exerciseId, selectedIndex) : AnswerResult` — correction immédiate.
- `startExam(examId) : ExamSession` — démarre un contrôle chronométré.
- `submitExam(sessionId, answers) : ExamResult` — score final et correction détaillée.
- `listRevisions() : [RevisionItem]` — révisions prioritaires de l'appelant, triées par priorité décroissante.
- `getProgress() : ProgressOverview` — maîtrise par matière et 10 activités récentes.
- `getRewards() : RewardState` — points, niveau et badges débloqués.
- `getCondensedPath(lessonId, durationMinutes) : CondensedPath` — parcours condensé 5/10/20 minutes.
- `askAiTeacher(lessonId, question) : AiExplanation` — professeur IA adapté au niveau.

### Profil
- `getProfile() : ?ProfileView` — profil de l'appelant (`null` s'il n'existe pas encore).
- `updateProfile(input) : ProfileView` — met à jour niveau, pays, programme, langue.

### Documentation
- `getApiDoc() : Text` — ce document.

### OQL (Data Intelligence)
- `schema() : Text` — schéma JSON des entités exposées.
- `execute(query) : Text` — exécute une requête JSON sur les entités exposées.

## Authentification et autorisation

Les méthodes de lecture du catalogue (`listSubjects`, `listLessons`,
`getLesson`, `listExercises`, `getExam`) sont des requêtes publiques, lisibles
par tout appelant, y compris anonyme.

Les méthodes de progression (`getLessonProgress`, `listRevisions`,
`getProgress`, `getRewards`, `getCondensedPath`, `getProfile`) sont des
requêtes qui opèrent sur les données du principal appelant. Les méthodes de
mutation (`advanceStep`, `submitAnswer`, `startExam`, `submitExam`,
`askAiTeacher`, `updateProfile`) exigent un appelant signé (non anonyme) et
opèrent sur les données du principal appelant.

L'enregistrement est un prérequis : un appelant doit d'abord s'enregistrer via
`_initialize_access_control` (appelé une fois par un appelant signé) avant tout
appel protégé par un rôle. Le premier appelant enregistré reçoit le rôle
`#admin`, les suivants le rôle `#user`. Un appelant non enregistré qui appelle
`getCallerUserRole` reçoit un trap `User is not registered` ; un appelant
anonyme reçoit `#guest`. L'enregistrement n'a lieu que lorsque l'appelant se
connecte via le frontend de l'application : un principal qui ne l'a jamais fait
est non enregistré, même s'il appartient au propriétaire de l'application, et
un appelant signé dérivé contre une autre origine est un principal différent de
celui enregistré par le frontend.

Le frontend épingle une origine de dérivation Internet Identity, publiée sur
`/.well-known/ii-derivation-origin` lorsqu'elle est disponible. Un agent
détenant déjà l'autorisation Internet Identity de l'utilisateur dérive le
principal correct pour cette application contre cette origine (par exemple
`icp identity link web <name> --app <host>`). Une telle délégation agit avec
l'autorité complète de l'utilisateur dans cette application jusqu'à son
expiration.

### Autorisation OQL par entité

- `subject`, `lesson`, `exercise`, `exam`, `badge` — lecture publique (tout
  appelant, y compris anonyme).
- `studentProfile`, `lessonProgress`, `activityEntry` — lecture limitée à
  l'appelant signé : chaque appelant ne voit que ses propres lignes
  (`controllerOrScoped`). Le contrôleur de la plateforme voit toutes les lignes.
- `examSession` — lecture réservée au contrôleur de la plateforme.

## Unités et encodages

- Les horodatages (`Timestamp`) sont des nanosecondes depuis l'époque UNIX.
- Les identifiants (`SubjectId`, `LessonId`, `ExerciseId`, `ExamId`,
  `SessionId`) sont des `Nat`.
- Les taux de maîtrise (`masteryRate`) sont des entiers de 0 à 100.
- Les valeurs optionnelles sont encodées en `?T` (Candid `opt`).
- `LearningStep` est une variante : `#comprendre`, `#exemple`, `#entrainer`,
  `#corriger`, `#memoriser`, `#tester`, `#maitriser`.
- Dans les entités OQL, les champs de type liste (`keyPoints`, `choices`,
  `memorizationPoints`) sont aplatis en texte séparé par ` | `, et les listes
  imbriquées (`steps`, `questions`) sont exposées sous forme de compteurs
  (`stepsCompleted`, `questionCount`).

## Cycle de vie et interrogation

- `startExam` crée une session chronométrée ; `submitExam` la clôture et renvoie
  le score et la correction détaillée question par question. Une session déjà
  soumise est marquée `submitted = true`.
- `advanceStep` est idempotent au sens où une étape déjà franchie reste
  franchie ; l'appel renvoie l'état courant et met à jour `masteryRate`.
- `askAiTeacher` appelle le service d'inférence Caffeine. Si l'inférence est
  indisponible, une explication déterministe construite à partir du contenu de
  la leçon est renvoyée à la place.

## Sécurité des mutations et réessais

- `advanceStep` et `submitAnswer` sont idempotents pour l'état : ré-appeler une
  étape déjà franchie ne la décompte pas deux fois et n'attribue pas de points
  en double. `submitAnswer` n'attribue des points que sur une bonne réponse.
- `startExam` n'est pas idempotent : chaque appel crée une nouvelle session avec
  un identifiant croissant. Un réessai après un échec réseau peut donc créer une
  session supplémentaire.
- `submitExam` est idempotent pour le score : re-soumettre la même session
  recalcule le même résultat, mais ré-attribue les points de score à chaque
  appel. Ne pas réessayer sans nécessité.
- `updateProfile` est idempotent : il remplace les champs de profil fournis et
  préserve points, niveau et compteurs.
- `askAiTeacher` enregistre une entrée d'activité à chaque appel réussi.

## Erreurs et limites

- Un appelant non signé sur une méthode de mutation est rejeté.
- Un identifiant inconnu renvoie `null` (lectures) ou une valeur neutre
  (mutations) selon la méthode : `submitAnswer` renvoie `correct = false` avec
  l'explication « Exercice introuvable. » ; `startExam` renvoie une session
  `submitted = true` avec `sessionId = 0` ; `submitExam` renvoie un résultat
  vide (`score = 0`, `total = 0`).
- `getCondensedPath` accepte 5, 10 ou 20 minutes ; toute autre valeur est
  traitée comme le palier le plus proche.
- `getProfile` renvoie `null` tant que le profil n'a pas été créé ; les autres
  lectures de progression créent un profil par défaut à la volée.
";
  };
};
