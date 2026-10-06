import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ActivityEntry {
    at: Timestamp;
    lessonId: LessonId;
    kind: string;
    detail: string;
}
export interface AiExplanation {
    question: string;
    answer: string;
    level: string;
}
export interface AnswerResult {
    correctIndex: bigint;
    explanation: string;
    correct: boolean;
}
export interface Badge {
    id: BadgeId;
    icon: string;
    name: string;
    description: string;
}
export type BadgeId = string;
export interface Cell {
    value: Value;
    name: string;
}
export interface CondensedPath {
    lessonId: LessonId;
    summary: string;
    steps: Array<LearningStep>;
    durationMinutes: DurationMinutes;
}
export type DurationMinutes = bigint;
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface ExamAnswer {
    exerciseId: ExerciseId;
    selectedIndex: bigint;
}
export type ExamId = bigint;
export interface ExamQuestion {
    exerciseId: ExerciseId;
    prompt: string;
    choices: Array<string>;
}
export interface ExamQuestionResult {
    exerciseId: ExerciseId;
    correctIndex: bigint;
    explanation: string;
    correct: boolean;
    selectedIndex: bigint;
    prompt: string;
}
export interface ExamResult {
    total: bigint;
    results: Array<ExamQuestionResult>;
    score: bigint;
    examId: ExamId;
    sessionId: SessionId;
}
export interface ExamSession {
    lessonId: LessonId;
    startedAt: Timestamp;
    submitted: boolean;
    durationSeconds: bigint;
    examId: ExamId;
    sessionId: SessionId;
}
export interface ExamView {
    id: ExamId;
    lessonId: LessonId;
    title: string;
    durationSeconds: bigint;
    questions: Array<ExamQuestion>;
}
export type ExerciseId = bigint;
export interface ExerciseView {
    id: ExerciseId;
    lessonId: LessonId;
    prompt: string;
    choices: Array<string>;
}
export interface LessonDetail {
    id: LessonId;
    curriculum: string;
    title: string;
    country: string;
    explanation: string;
    level: string;
    language: string;
    memorizationSummary: string;
    example: string;
    keyPoints: Array<string>;
    subjectId: SubjectId;
    memorizationPoints: Array<string>;
}
export type LessonId = bigint;
export interface LessonProgress {
    lessonId: LessonId;
    masteryRate: bigint;
    updatedAt: Timestamp;
    steps: Array<StepState>;
    currentStep: LearningStep;
}
export interface LessonSummary {
    id: LessonId;
    title: string;
    level: string;
    subjectId: SubjectId;
}
export interface ProfileInput {
    curriculum: string;
    country: string;
    level: string;
    language: string;
}
export interface ProfileView {
    curriculum: string;
    studentLevel: bigint;
    country: string;
    exercisesCompleted: bigint;
    level: string;
    language: string;
    updatedAt: Timestamp;
    lessonsCompleted: bigint;
    points: bigint;
}
export interface ProgressOverview {
    subjects: Array<SubjectMastery>;
    recentActivity: Array<ActivityEntry>;
    level: bigint;
    totalPoints: bigint;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface RevisionItem {
    lessonId: LessonId;
    title: string;
    subjectId: SubjectId;
    priority: bigint;
    reason: string;
}
export interface RewardState {
    badges: Array<Badge>;
    level: bigint;
    points: bigint;
}
export type SessionId = bigint;
export interface StepState {
    step: LearningStep;
    completed: boolean;
}
export type SubjectId = bigint;
export interface SubjectMastery {
    masteryRate: bigint;
    name: string;
    subjectId: SubjectId;
}
export interface SubjectView {
    id: SubjectId;
    icon: string;
    name: string;
    description: string;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum LearningStep {
    entrainer = "entrainer",
    memoriser = "memoriser",
    comprendre = "comprendre",
    corriger = "corriger",
    exemple = "exemple",
    tester = "tester",
    maitriser = "maitriser"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    advanceStep(lessonId: bigint): Promise<LessonProgress>;
    askAiTeacher(lessonId: bigint, question: string): Promise<AiExplanation>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getCondensedPath(lessonId: bigint, durationMinutes: bigint): Promise<CondensedPath>;
    getExam(lessonId: bigint): Promise<ExamView | null>;
    getLesson(lessonId: bigint): Promise<LessonDetail | null>;
    getLessonProgress(lessonId: bigint): Promise<LessonProgress | null>;
    getProfile(): Promise<ProfileView | null>;
    getProgress(): Promise<ProgressOverview>;
    getRewards(): Promise<RewardState>;
    isCallerAdmin(): Promise<boolean>;
    listExercises(lessonId: bigint): Promise<Array<ExerciseView>>;
    listLessons(subjectId: bigint, level: string): Promise<Array<LessonSummary>>;
    listRevisions(): Promise<Array<RevisionItem>>;
    listSubjects(): Promise<Array<SubjectView>>;
    schema(): Promise<string>;
    startExam(examId: bigint): Promise<ExamSession>;
    submitAnswer(exerciseId: bigint, selectedIndex: bigint): Promise<AnswerResult>;
    submitExam(sessionId: bigint, answers: Array<ExamAnswer>): Promise<ExamResult>;
    updateProfile(input: ProfileInput): Promise<ProfileView>;
}
