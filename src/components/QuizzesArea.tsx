import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardList, History, Loader2, Play, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

interface QuizCourse {
  id: string;
  title: string;
}

interface QuizAttemptRecord {
  id: string;
  score: number;
  passed: boolean;
  submitted_at: string;
}

interface QuizSummary {
  id: string;
  title: string;
  passing_score: number;
  questions_count: number;
  course?: QuizCourse | null;
  attempts: {
    count: number;
    best_score: number | null;
    passed: boolean;
    history: QuizAttemptRecord[];
  };
}

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  statement: string;
  options: QuizOption[];
}

interface QuizDetail {
  id: string;
  title: string;
  passing_score: number;
  course?: QuizCourse | null;
  questions: QuizQuestion[];
}

interface Attempt {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  passing_score: number;
}

interface QuizzesAreaProps {
  // ponytail: quando embutido no curso, mostra só os testes vinculados a ele.
  courseId?: string;
}

export const QuizzesArea: React.FC<QuizzesAreaProps> = ({ courseId }) => {
  const { session } = useAuth();
  const token = session?.token;

  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Teste aberto: detalhe + respostas escolhidas + resultado
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [startingId, setStartingId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [openHistoryId, setOpenHistoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const loadQuizzes = () =>
    fetch(`${API_BASE_URL}/api/v1/quizzes`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => setQuizzes(
        ((data.quizzes ?? []) as QuizSummary[]).filter((q) => !courseId || q.course?.id === courseId),
      ))
      .catch(() => setError('Não foi possível carregar os testes.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!token) return;
    loadQuizzes();
  }, [token, courseId]);

  const start = async (summary: QuizSummary) => {
    setStartingId(summary.id);
    setError('');
    try {
      const r = await fetch(`${API_BASE_URL}/api/v1/quizzes/${summary.id}`, { headers: authHeaders });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Não foi possível abrir o teste.');
      setQuiz(data.quiz);
      setAnswers({});
      setIndex(0);
      setAttempt(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível abrir o teste.');
    } finally {
      setStartingId('');
    }
  };

  const submit = async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    setError('');
    try {
      const r = await fetch(`${API_BASE_URL}/api/v1/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ answers }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Não foi possível enviar as respostas.');
      setAttempt(data.attempt);
      loadQuizzes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar as respostas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const close = () => {
    setQuiz(null);
    setAttempt(null);
    setAnswers({});
    setIndex(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // --- Resultado ---
  if (quiz && attempt) {
    const Icon = attempt.passed ? CheckCircle2 : XCircle;
    return (
      <div className={courseId ? '' : 'mx-auto max-w-2xl px-4 py-8'}>
        <div className="rounded-3xl border border-[#1b253b] bg-[#0b101e]/90 p-8 text-center">
          <Icon className={`mx-auto h-14 w-14 ${attempt.passed ? 'text-emerald-400' : 'text-red-400'}`} />
          <h2 className="mt-4 text-2xl font-extrabold text-white">
            {attempt.passed ? 'Aprovado!' : 'Não foi dessa vez'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Você acertou {attempt.correct} de {attempt.total} — nota {attempt.score}% (mínimo {attempt.passing_score}%).
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => { setAttempt(null); setAnswers({}); setIndex(0); }}
              className="rounded-xl border border-[#1b253b] px-5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-[#131a2b]"
            >
              Refazer
            </button>
            <button
              onClick={close}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2.5 text-sm font-bold text-white"
            >
              Voltar aos testes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Teste aberto: uma pergunta por vez ---
  if (quiz) {
    const question = quiz.questions[index];
    // ponytail: teste sem perguntas nao deveria existir, mas nao quebra a tela
    if (!question) return <p className="py-8 text-center text-sm text-gray-400">Este teste não tem perguntas.</p>;

    const isLast = index === quiz.questions.length - 1;
    const answered = Boolean(answers[question.id]);

    return (
      <div className={courseId ? '' : 'mx-auto max-w-2xl px-4 py-8'}>
        <button onClick={close} className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h2 className="text-2xl font-extrabold text-white">{quiz.title}</h2>
        <p className="text-sm text-gray-400">
          {quiz.course && <span className="text-cyan-400">{quiz.course.title} • </span>}
          aprovação a partir de {quiz.passing_score}%
        </p>

        {/* Progresso */}
        <div className="mt-5 mb-3 flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>Pergunta {index + 1} de {quiz.questions.length}</span>
          <span>{Math.round(((index + (answered ? 1 : 0)) / quiz.questions.length) * 100)}%</span>
        </div>
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[#1b253b]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all"
            style={{ width: `${((index + (answered ? 1 : 0)) / quiz.questions.length) * 100}%` }}
          />
        </div>

        {error && <p className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        <div className="rounded-2xl border border-[#1b253b] bg-[#0b101e]/90 p-5">
          <p className="mb-4 font-bold text-white">{question.statement}</p>
          <div className="space-y-2">
            {question.options.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                  answers[question.id] === option.id
                    ? 'border-cyan-400 bg-cyan-400/10 text-white'
                    : 'border-[#1b253b] text-gray-300 hover:border-[#2a3550]'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === option.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                  className="h-4 w-4 accent-cyan-400"
                />
                {option.text}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {index > 0 && (
            <button
              onClick={() => setIndex((i) => i - 1)}
              className="rounded-xl border border-[#1b253b] px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-[#131a2b]"
            >
              Anterior
            </button>
          )}
          <button
            onClick={() => (isLast ? submit() : setIndex((i) => i + 1))}
            disabled={!answered || isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 py-3 font-bold text-white disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {!answered ? 'Escolha uma resposta' : isLast ? 'Confirmar e enviar' : 'Confirmar e continuar'}
          </button>
        </div>
      </div>
    );
  }

  // --- Lista ---
  return (
    <div className={courseId ? '' : 'w-full px-4 py-8 lg:px-10'}>
      {!courseId && (
        <>
          <h1 className="text-2xl font-extrabold text-white">Testes</h1>
          <p className="mb-6 text-sm text-gray-400">Avalie seu conhecimento e conquiste o "Mestre dos Testes".</p>
        </>
      )}

      {error && <p className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      {quizzes.length === 0 ? (
        <div className="rounded-3xl border border-[#1b253b] bg-[#0b101e]/90 p-12 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-gray-600" />
          <p className="mt-3 text-sm text-gray-400">
            {courseId ? 'Este curso ainda não tem testes.' : 'Nenhum teste disponível no momento.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {quizzes.map((summary) => (
            <div key={summary.id} className="rounded-2xl border border-[#1b253b] bg-[#0b101e]/90 p-5">
              <h2 className="font-bold text-white">{summary.title}</h2>
              {summary.course && (
                <span className="mt-2 inline-block rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                  {summary.course.title}
                </span>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {summary.questions_count} pergunta(s) • aprova com {summary.passing_score}%
              </p>

              {summary.attempts.count > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                  <span
                    className={`rounded-full px-2.5 py-1 ${
                      summary.attempts.passed
                        ? 'bg-emerald-400/10 text-emerald-300'
                        : 'bg-amber-400/10 text-amber-300'
                    }`}
                  >
                    {summary.attempts.passed ? 'Aprovado' : 'Ainda não aprovado'} • melhor {summary.attempts.best_score}%
                  </span>
                  <button
                    onClick={() => setOpenHistoryId(openHistoryId === summary.id ? '' : summary.id)}
                    className="flex items-center gap-1 text-gray-400 underline-offset-2 hover:text-white hover:underline"
                  >
                    <History className="h-3.5 w-3.5" />
                    {summary.attempts.count} tentativa(s)
                  </button>
                </div>
              )}

              {openHistoryId === summary.id && (
                <ul className="mt-3 space-y-1.5 rounded-xl border border-[#1b253b] bg-[#090d16]/60 p-3">
                  {summary.attempts.history.map((record) => (
                    <li key={record.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        {new Date(record.submitted_at).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                      <span className={record.passed ? 'font-bold text-emerald-400' : 'font-bold text-red-400'}>
                        {record.score}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => start(summary)}
                disabled={startingId === summary.id}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {startingId === summary.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {summary.attempts.count > 0 ? 'Refazer teste' : 'Iniciar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
