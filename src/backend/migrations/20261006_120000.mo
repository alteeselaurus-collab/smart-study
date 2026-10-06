import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type Timestamp = Int;
  type SubjectId = Nat;
  type LessonId = Nat;
  type ExerciseId = Nat;
  type ExamId = Nat;
  type SessionId = Nat;
  type BadgeId = Text;

  type Subject = {
    id : SubjectId;
    name : Text;
    description : Text;
    icon : Text;
  };

  type Lesson = {
    id : LessonId;
    subjectId : SubjectId;
    title : Text;
    level : Text;
    country : Text;
    curriculum : Text;
    language : Text;
    explanation : Text;
    example : Text;
    keyPoints : [Text];
    memorizationSummary : Text;
    memorizationPoints : [Text];
  };

  type Exercise = {
    id : ExerciseId;
    lessonId : LessonId;
    prompt : Text;
    choices : [Text];
    correctIndex : Nat;
    explanation : Text;
  };

  type ExamQuestion = {
    exerciseId : ExerciseId;
    prompt : Text;
    choices : [Text];
  };

  type Exam = {
    id : ExamId;
    lessonId : LessonId;
    title : Text;
    durationSeconds : Nat;
    questions : [ExamQuestion];
  };

  type LearningStep = {
    #comprendre;
    #exemple;
    #entrainer;
    #corriger;
    #memoriser;
    #tester;
    #maitriser;
  };

  type StepState = {
    step : LearningStep;
    completed : Bool;
  };

  type LessonProgress = {
    lessonId : LessonId;
    steps : [StepState];
    currentStep : LearningStep;
    masteryRate : Nat;
    updatedAt : Timestamp;
  };

  type ExamSession = {
    sessionId : SessionId;
    examId : ExamId;
    lessonId : LessonId;
    startedAt : Timestamp;
    durationSeconds : Nat;
    submitted : Bool;
  };

  type ExamResult = {
    sessionId : SessionId;
    examId : ExamId;
    score : Nat;
    total : Nat;
    results : [ExamQuestionResult];
  };

  type ExamQuestionResult = {
    exerciseId : ExerciseId;
    prompt : Text;
    selectedIndex : Nat;
    correctIndex : Nat;
    correct : Bool;
    explanation : Text;
  };

  type ActivityEntry = {
    kind : Text;
    lessonId : LessonId;
    detail : Text;
    at : Timestamp;
  };

  type Badge = {
    id : BadgeId;
    name : Text;
    description : Text;
    icon : Text;
  };

  type StudentProfile = {
    level : Text;
    country : Text;
    curriculum : Text;
    language : Text;
    points : Nat;
    studentLevel : Nat;
    lessonsCompleted : Nat;
    exercisesCompleted : Nat;
    updatedAt : Timestamp;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    subjects : Map.Map<SubjectId, Subject>;
    lessons : Map.Map<LessonId, Lesson>;
    exercises : Map.Map<ExerciseId, Exercise>;
    exams : Map.Map<ExamId, Exam>;
    profiles : Map.Map<Principal, StudentProfile>;
    progress : Map.Map<Principal, Map.Map<LessonId, LessonProgress>>;
    examSessions : Map.Map<SessionId, ExamSession>;
    examResults : Map.Map<SessionId, ExamResult>;
    activity : Map.Map<Principal, List.List<ActivityEntry>>;
    badges : Map.Map<BadgeId, Badge>;
    nextSessionId : { var value : Nat };
  };

  func seedSubjects() : Map.Map<SubjectId, Subject> {
    let m = Map.empty<SubjectId, Subject>();
    m.add(1, { id = 1; name = "Mathématiques"; description = "Nombres, calcul, géométrie et raisonnement."; icon = "➗" });
    m.add(2, { id = 2; name = "Français"; description = "Lecture, grammaire, orthographe et expression écrite."; icon = "📖" });
    m.add(3, { id = 3; name = "Histoire"; description = "Grandes périodes, événements et civilisations."; icon = "🏛️" });
    m.add(4, { id = 4; name = "Sciences"; description = "Vivant, matière, énergie et environnement."; icon = "🔬" });
    m;
  };

  func seedLessons() : Map.Map<LessonId, Lesson> {
    let m = Map.empty<LessonId, Lesson>();
    // --- Collège (programme national français) : leçons historiques 1 à 6 ---
    m.add(1, {
      id = 1;
      subjectId = 1;
      title = "Les fractions";
      level = "college";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "Une fraction représente une part d'un tout. Le nombre du bas (le dénominateur) indique en combien de parts égales on partage le tout, et le nombre du haut (le numérateur) indique combien de parts on prend.";
      example = "Si on coupe une pizza en 4 parts égales et qu'on en mange 3, on a mangé 3/4 de la pizza.";
      keyPoints = ["Le dénominateur indique le nombre de parts égales.", "Le numérateur indique le nombre de parts prises.", "Une fraction peut être simplifiée en divisant haut et bas par un même nombre."];
      memorizationSummary = "Une fraction = numérateur / dénominateur : combien de parts prises sur combien de parts au total.";
      memorizationPoints = ["Dénominateur = parts totales", "Numérateur = parts prises", "Simplifier = diviser haut et bas"];
    });
    m.add(2, {
      id = 2;
      subjectId = 1;
      title = "Les nombres décimaux";
      level = "college";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "Un nombre décimal s'écrit avec une virgule qui sépare la partie entière de la partie décimale. Chaque rang après la virgule vaut dix fois moins que le précédent.";
      example = "Dans 12,45 : 12 est la partie entière, 4 est le chiffre des dixièmes et 5 celui des centièmes.";
      keyPoints = ["La virgule sépare partie entière et partie décimale.", "Dixièmes, centièmes, millièmes se suivent après la virgule.", "Comparer deux décimaux : comparer d'abord la partie entière."];
      memorizationSummary = "Un décimal = partie entière, virgule, partie décimale (dixièmes, centièmes, millièmes).";
      memorizationPoints = ["Virgule = séparateur", "Dixièmes puis centièmes", "Comparer la partie entière d'abord"];
    });
    m.add(3, {
      id = 3;
      subjectId = 2;
      title = "Le présent de l'indicatif";
      level = "college";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "Le présent de l'indicatif exprime une action qui se déroule au moment où l'on parle. Les terminaisons changent selon le groupe du verbe.";
      example = "Je parle, tu parles, il parle : le verbe « parler » (1er groupe) prend les terminaisons -e, -es, -e.";
      keyPoints = ["Le présent exprime une action actuelle.", "Les verbes du 1er groupe finissent en -er.", "Les terminaisons dépendent du groupe et de la personne."];
      memorizationSummary = "Le présent de l'indicatif = action au moment où l'on parle ; terminaisons selon le groupe.";
      memorizationPoints = ["Action actuelle", "1er groupe : -e, -es, -e", "Accord avec le sujet"];
    });
    m.add(4, {
      id = 4;
      subjectId = 2;
      title = "Les accords sujet-verbe";
      level = "college";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "Le verbe s'accorde en personne et en nombre avec son sujet. Il faut donc identifier le sujet avant de choisir la terminaison.";
      example = "« Les élèves travaillent » : le sujet « les élèves » est au pluriel, le verbe prend donc la terminaison -ent.";
      keyPoints = ["Le verbe s'accorde avec le sujet.", "Identifier le sujet avant d'écrire le verbe.", "Attention aux sujets inversés ou éloignés."];
      memorizationSummary = "Le verbe s'accorde en personne et en nombre avec son sujet.";
      memorizationPoints = ["Trouver le sujet", "Accorder en personne", "Accorder en nombre"];
    });
    m.add(5, {
      id = 5;
      subjectId = 3;
      title = "La Révolution française";
      level = "college";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "La Révolution française débute en 1789 et met fin à la monarchie absolue. Elle proclame les droits de l'homme et transforme la société française.";
      example = "Le 14 juillet 1789, la prise de la Bastille symbolise le début du soulèvement populaire.";
      keyPoints = ["Début en 1789.", "Fin de la monarchie absolue.", "Déclaration des droits de l'homme et du citoyen."];
      memorizationSummary = "1789 : la Révolution française met fin à la monarchie absolue et proclame les droits de l'homme.";
      memorizationPoints = ["1789", "Prise de la Bastille", "Droits de l'homme"];
    });
    m.add(6, {
      id = 6;
      subjectId = 4;
      title = "Le cycle de l'eau";
      level = "college";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "L'eau circule en permanence entre les océans, l'atmosphère et les continents. Elle s'évapore, forme des nuages, retombe en pluie puis ruisselle vers les mers.";
      example = "Après une averse, l'eau s'infiltre dans le sol ou ruisselle vers une rivière qui rejoint la mer.";
      keyPoints = ["Évaporation, condensation, précipitation, ruissellement.", "Le Soleil est le moteur du cycle.", "L'eau change d'état mais sa quantité reste stable."];
      memorizationSummary = "Le cycle de l'eau : évaporation → condensation → précipitation → ruissellement.";
      memorizationPoints = ["Évaporation", "Condensation", "Précipitation", "Ruissellement"];
    });
    // --- Primaire ---
    m.add(7, {
      id = 7;
      subjectId = 1;
      title = "Les tables de multiplication";
      level = "primaire";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "Les tables de multiplication donnent le résultat d'un nombre multiplié par un autre. Les connaître par cœur rend les calculs beaucoup plus rapides.";
      example = "4 × 3 = 12 : on additionne 4 trois fois (4 + 4 + 4).";
      keyPoints = ["Multiplier, c'est additionner plusieurs fois le même nombre.", "Apprendre les tables de 1 à 10.", "L'ordre des nombres ne change pas le résultat."];
      memorizationSummary = "Une multiplication = une addition répétée ; apprendre les tables de 1 à 10.";
      memorizationPoints = ["4 × 3 = 4 + 4 + 4", "Tables de 1 à 10", "Ordre indifférent"];
    });
    m.add(8, {
      id = 8;
      subjectId = 2;
      title = "Les sons et les syllabes";
      level = "primaire";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "Un mot se découpe en syllabes. Chaque syllabe contient au moins une voyelle. Découper les mots aide à bien lire et à bien écrire.";
      example = "« cha-peau » contient deux syllabes ; « é-co-le » en contient trois.";
      keyPoints = ["Une syllabe contient une voyelle.", "On frappe les syllabes pour les compter.", "Découper aide à lire les mots longs."];
      memorizationSummary = "Un mot se découpe en syllabes ; chaque syllabe a une voyelle.";
      memorizationPoints = ["Syllabe = une voyelle", "Frapper pour compter", "Découper pour lire"];
    });
    m.add(9, {
      id = 9;
      subjectId = 4;
      title = "Les saisons";
      level = "primaire";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "L'année compte quatre saisons : printemps, été, automne et hiver. Elles changent à cause de l'inclinaison de la Terre autour du Soleil.";
      example = "En été les jours sont longs et chauds ; en hiver ils sont courts et froids.";
      keyPoints = ["Quatre saisons dans l'année.", "La Terre tourne autour du Soleil.", "Les jours changent de longueur."];
      memorizationSummary = "Quatre saisons : printemps, été, automne, hiver.";
      memorizationPoints = ["Printemps", "Été", "Automne", "Hiver"];
    });
    // --- Collège : variantes pays / programme / langue ---
    m.add(10, {
      id = 10;
      subjectId = 1;
      title = "Les fractions (programme sénégalais)";
      level = "college";
      country = "SN";
      curriculum = "francais";
      language = "fr";
      explanation = "Au Sénégal, l'étude des fractions suit le programme francophone : on partage des quantités concrètes (mil, arachides) pour comprendre numérateur et dénominateur.";
      example = "On partage un sac de 8 mesures en 4 parts égales : chaque part vaut 2 mesures, soit 1/4 du sac.";
      keyPoints = ["Partager une quantité concrète.", "Numérateur = parts prises.", "Dénominateur = parts totales."];
      memorizationSummary = "Fraction = part d'un tout partagé en parts égales.";
      memorizationPoints = ["Partager", "Numérateur", "Dénominateur"];
    });
    m.add(11, {
      id = 11;
      subjectId = 1;
      title = "Fractions (Cambridge)";
      level = "college";
      country = "GB";
      curriculum = "cambridge";
      language = "en";
      explanation = "In the Cambridge curriculum, fractions are introduced through sharing and measuring, then simplified using common factors.";
      example = "Half of 10 is 5, so 1/2 of 10 = 5.";
      keyPoints = ["A fraction is part of a whole.", "Simplify by dividing by common factors.", "Compare fractions with the same denominator."];
      memorizationSummary = "A fraction shows equal parts of a whole.";
      memorizationPoints = ["Part of a whole", "Simplify", "Compare"];
    });
    // --- Lycée ---
    m.add(12, {
      id = 12;
      subjectId = 1;
      title = "Les fonctions";
      level = "lycee";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "Une fonction associe à chaque nombre de départ un unique nombre d'arrivée. On la note f(x) et on étudie ses variations sur un intervalle.";
      example = "f(x) = 2x + 1 : pour x = 3, f(3) = 7.";
      keyPoints = ["Une fonction associe une seule image à chaque antécédent.", "On étudie le sens de variation.", "Le tableau de variations résume le comportement."];
      memorizationSummary = "Une fonction associe à chaque x une unique image f(x).";
      memorizationPoints = ["f(x)", "Image unique", "Sens de variation"];
    });
    m.add(13, {
      id = 13;
      subjectId = 2;
      title = "Le commentaire de texte";
      level = "lycee";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "Le commentaire de texte analyse un extrait littéraire en dégageant ses procédés d'écriture et leur effet sur le lecteur, organisé en axes de lecture.";
      example = "Une métaphore filée peut créer une atmosphère angoissante : on cite le texte puis on explique l'effet produit.";
      keyPoints = ["Analyser les procédés littéraires.", "Organiser en axes de lecture.", "Toujours citer le texte."];
      memorizationSummary = "Commentaire = procédés + effets, organisés en axes.";
      memorizationPoints = ["Procédés", "Effets", "Axes de lecture"];
    });
    m.add(14, {
      id = 14;
      subjectId = 3;
      title = "La Première Guerre mondiale";
      level = "lycee";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "La Première Guerre mondiale (1914-1918) oppose les Alliés aux Empires centraux. C'est une guerre de position marquée par les tranchées et une violence de masse.";
      example = "La bataille de Verdun (1916) symbolise l'horreur des tranchées et l'usure des soldats.";
      keyPoints = ["1914-1918.", "Guerre de tranchées.", "Violence de masse et bilan humain lourd."];
      memorizationSummary = "1914-1918 : guerre de tranchées et violence de masse.";
      memorizationPoints = ["1914-1918", "Tranchées", "Verdun"];
    });
    // --- Supérieur ---
    m.add(15, {
      id = 15;
      subjectId = 1;
      title = "Les dérivées";
      level = "superieur";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "La dérivée d'une fonction mesure sa vitesse de variation en un point. Elle correspond au coefficient directeur de la tangente à la courbe.";
      example = "Si f(x) = x², alors f'(x) = 2x : en x = 3 la pente vaut 6.";
      keyPoints = ["La dérivée mesure la variation locale.", "Elle donne la pente de la tangente.", "Dérivée nulle = extremum possible."];
      memorizationSummary = "Dérivée = pente de la tangente = vitesse de variation.";
      memorizationPoints = ["Pente", "Tangente", "Extremum"];
    });
    m.add(16, {
      id = 16;
      subjectId = 4;
      title = "La thermodynamique";
      level = "superieur";
      country = "FR";
      curriculum = "national";
      language = "fr";
      explanation = "La thermodynamique étudie les échanges d'énergie sous forme de chaleur et de travail. Ses deux principes encadrent la conservation de l'énergie et l'irréversibilité.";
      example = "Un moteur thermique convertit une partie de la chaleur en travail ; le reste est perdu, ce qui illustre le second principe.";
      keyPoints = ["Premier principe : conservation de l'énergie.", "Second principe : entropie croissante.", "Chaleur et travail sont des transferts d'énergie."];
      memorizationSummary = "Thermodynamique : énergie conservée, entropie croissante.";
      memorizationPoints = ["Énergie", "Entropie", "Chaleur et travail"];
    });
    // --- Variantes supplémentaires pays / programme / langue ---
    m.add(17, {
      id = 17;
      subjectId = 1;
      title = "Les tables de multiplication (Sénégal)";
      level = "primaire";
      country = "SN";
      curriculum = "francais";
      language = "fr";
      explanation = "Au primaire au Sénégal, on apprend les tables en les récitant et en les appliquant à des situations de la vie quotidienne.";
      example = "Au marché, 5 tas de 3 mangues font 5 × 3 = 15 mangues.";
      keyPoints = ["Réciter les tables.", "Appliquer à des situations concrètes.", "Vérifier avec l'addition répétée."];
      memorizationSummary = "Tables de multiplication appliquées au quotidien.";
      memorizationPoints = ["Réciter", "Appliquer", "Vérifier"];
    });
    m.add(18, {
      id = 18;
      subjectId = 1;
      title = "Functions (Cambridge)";
      level = "lycee";
      country = "GB";
      curriculum = "cambridge";
      language = "en";
      explanation = "A function maps each input to exactly one output. Cambridge A-Level studies domain, range, composition and inverse functions.";
      example = "If f(x) = 2x + 1, then f(3) = 7 and the inverse is f⁻¹(y) = (y − 1) / 2.";
      keyPoints = ["One output per input.", "Domain and range.", "Composition and inverse."];
      memorizationSummary = "A function maps each input to one output; study domain, range and inverse.";
      memorizationPoints = ["Mapping", "Domain and range", "Inverse"];
    });
    m.add(19, {
      id = 19;
      subjectId = 4;
      title = "Thermodynamics (US)";
      level = "superieur";
      country = "US";
      curriculum = "anglophone";
      language = "en";
      explanation = "Thermodynamics studies energy transfer as heat and work. The first law states energy is conserved; the second law states entropy tends to increase.";
      example = "A heat engine converts part of the heat into work; the rest is rejected, illustrating the second law.";
      keyPoints = ["First law: energy conservation.", "Second law: entropy increases.", "Heat and work are energy transfers."];
      memorizationSummary = "Thermodynamics: energy conserved, entropy increases.";
      memorizationPoints = ["Energy", "Entropy", "Heat and work"];
    });
    m;
  };

  func seedExercises() : Map.Map<ExerciseId, Exercise> {
    let m = Map.empty<ExerciseId, Exercise>();
    m.add(1, { id = 1; lessonId = 1; prompt = "Quelle fraction représente 3 parts sur 4 ?"; choices = ["3/4", "4/3", "3/7", "1/4"]; correctIndex = 0; explanation = "3 parts prises sur 4 parts au total s'écrit 3/4." });
    m.add(2, { id = 2; lessonId = 1; prompt = "Dans la fraction 5/8, quel est le dénominateur ?"; choices = ["5", "8", "13", "3"]; correctIndex = 1; explanation = "Le dénominateur est le nombre du bas : 8." });
    m.add(3, { id = 3; lessonId = 2; prompt = "Dans 7,32 quel est le chiffre des dixièmes ?"; choices = ["7", "3", "2", "0"]; correctIndex = 1; explanation = "Le premier chiffre après la virgule est celui des dixièmes : 3." });
    m.add(4, { id = 4; lessonId = 2; prompt = "Quel nombre est le plus grand ?"; choices = ["3,5", "3,45", "3,405", "3,05"]; correctIndex = 0; explanation = "3,5 = 3,50 est le plus grand." });
    m.add(5, { id = 5; lessonId = 3; prompt = "Quelle est la terminaison de « parler » à la 1re personne du singulier au présent ?"; choices = ["-e", "-es", "-ons", "-ez"]; correctIndex = 0; explanation = "Je parle : terminaison -e pour le 1er groupe." });
    m.add(6, { id = 6; lessonId = 3; prompt = "« Nous (chanter) » au présent donne :"; choices = ["chantons", "chantez", "chantent", "chante"]; correctIndex = 0; explanation = "Nous chantons : terminaison -ons." });
    m.add(7, { id = 7; lessonId = 4; prompt = "Quelle phrase est correctement accordée ?"; choices = ["Les élèves travaillent.", "Les élèves travaille.", "Les élève travaillent.", "Les élèves travailles."]; correctIndex = 0; explanation = "Sujet pluriel « les élèves » → verbe au pluriel « travaillent »." });
    m.add(8, { id = 8; lessonId = 5; prompt = "En quelle année débute la Révolution française ?"; choices = ["1789", "1815", "1914", "1492"]; correctIndex = 0; explanation = "La Révolution française débute en 1789." });
    m.add(9, { id = 9; lessonId = 5; prompt = "Quel événement du 14 juillet 1789 est célèbre ?"; choices = ["La prise de la Bastille", "Le sacre de Napoléon", "La bataille de Marignan", "La prise des Tuileries"]; correctIndex = 0; explanation = "Le 14 juillet 1789, le peuple prend la Bastille." });
    m.add(10, { id = 10; lessonId = 6; prompt = "Quel phénomène transforme l'eau liquide en vapeur ?"; choices = ["L'évaporation", "La condensation", "La précipitation", "Le ruissellement"]; correctIndex = 0; explanation = "L'évaporation transforme l'eau liquide en vapeur d'eau." });
    m.add(11, { id = 11; lessonId = 6; prompt = "Que se passe-t-il lors de la condensation ?"; choices = ["La vapeur devient nuage", "L'eau gèle", "L'eau s'infiltre", "Le nuage tombe"]; correctIndex = 0; explanation = "La condensation transforme la vapeur d'eau en fines gouttelettes formant les nuages." });
    m;
  };

  func seedExams() : Map.Map<ExamId, Exam> {
    let m = Map.empty<ExamId, Exam>();
    m.add(1, { id = 1; lessonId = 1; title = "Contrôle — Les fractions"; durationSeconds = 300; questions = [
      { exerciseId = 1; prompt = "Quelle fraction représente 3 parts sur 4 ?"; choices = ["3/4", "4/3", "3/7", "1/4"] },
      { exerciseId = 2; prompt = "Dans la fraction 5/8, quel est le dénominateur ?"; choices = ["5", "8", "13", "3"] },
    ] });
    m.add(2, { id = 2; lessonId = 2; title = "Contrôle — Les nombres décimaux"; durationSeconds = 300; questions = [
      { exerciseId = 3; prompt = "Dans 7,32 quel est le chiffre des dixièmes ?"; choices = ["7", "3", "2", "0"] },
      { exerciseId = 4; prompt = "Quel nombre est le plus grand ?"; choices = ["3,5", "3,45", "3,405", "3,05"] },
    ] });
    m.add(3, { id = 3; lessonId = 3; title = "Contrôle — Le présent de l'indicatif"; durationSeconds = 300; questions = [
      { exerciseId = 5; prompt = "Quelle est la terminaison de « parler » à la 1re personne du singulier au présent ?"; choices = ["-e", "-es", "-ons", "-ez"] },
      { exerciseId = 6; prompt = "« Nous (chanter) » au présent donne :"; choices = ["chantons", "chantez", "chantent", "chante"] },
    ] });
    m.add(4, { id = 4; lessonId = 4; title = "Contrôle — Les accords sujet-verbe"; durationSeconds = 300; questions = [
      { exerciseId = 7; prompt = "Quelle phrase est correctement accordée ?"; choices = ["Les élèves travaillent.", "Les élèves travaille.", "Les élève travaillent.", "Les élèves travailles."] },
    ] });
    m.add(5, { id = 5; lessonId = 5; title = "Contrôle — La Révolution française"; durationSeconds = 300; questions = [
      { exerciseId = 8; prompt = "En quelle année débute la Révolution française ?"; choices = ["1789", "1815", "1914", "1492"] },
      { exerciseId = 9; prompt = "Quel événement du 14 juillet 1789 est célèbre ?"; choices = ["La prise de la Bastille", "Le sacre de Napoléon", "La bataille de Marignan", "La prise des Tuileries"] },
    ] });
    m.add(6, { id = 6; lessonId = 6; title = "Contrôle — Le cycle de l'eau"; durationSeconds = 300; questions = [
      { exerciseId = 10; prompt = "Quel phénomène transforme l'eau liquide en vapeur ?"; choices = ["L'évaporation", "La condensation", "La précipitation", "Le ruissellement"] },
      { exerciseId = 11; prompt = "Que se passe-t-il lors de la condensation ?"; choices = ["La vapeur devient nuage", "L'eau gèle", "L'eau s'infiltre", "Le nuage tombe"] },
    ] });
    m;
  };

  func seedBadges() : Map.Map<BadgeId, Badge> {
    let m = Map.empty<BadgeId, Badge>();
    m.add("premier-pas", { id = "premier-pas"; name = "Premier pas"; description = "Réussir son premier exercice."; icon = "🌟" });
    m.add("studieux", { id = "studieux"; name = "Studieux"; description = "Réussir 10 exercices."; icon = "📚" });
    m.add("expert", { id = "expert"; name = "Expert"; description = "Atteindre 500 points."; icon = "🏅" });
    m.add("maitre", { id = "maitre"; name = "Maître"; description = "Maîtriser 5 leçons."; icon = "🏆" });
    m;
  };

  public func migration(_ : {}) : NewActor {
    {
      accessControlState = AccessControl.initState();
      subjects = seedSubjects();
      lessons = seedLessons();
      exercises = seedExercises();
      exams = seedExams();
      profiles = Map.empty();
      progress = Map.empty();
      examSessions = Map.empty();
      examResults = Map.empty();
      activity = Map.empty();
      badges = seedBadges();
      nextSessionId = { var value = 0 };
    };
  };
};
