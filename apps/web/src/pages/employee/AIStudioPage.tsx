import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  Upload,
  FileText,
  Loader2,
  Brain,
  CheckCircle,
  Sparkles,
  X,
  PlayCircle,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from '../../components/ui/toaster';
import { Link } from 'react-router-dom';

type Stage = 'upload' | 'processing' | 'review' | 'attempt' | 'attempt-results';

export function AIStudioPage() {
  const [stage, setStage] = useState<Stage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [competency, setCompetency] = useState('');
  const [promotedAssessmentId, setPromotedAssessmentId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // In-studio quiz attempt state (Employee Step 12: Attempt Quiz)
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [attemptScore, setAttemptScore] = useState<{ correct: number; total: number; pct: number } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('file', file!);
      if (competency) fd.append('competencyHint', competency);
      return api.post('/ai/quiz/generate', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
    },
    onSuccess: (data) => {
      setQuiz(data);
      setStage('review');
      setPromotedAssessmentId(null);
    },
    onError: () => toast({ title: 'AI processing failed', description: 'Please try a different document', variant: 'destructive' }),
  });

  const promoteMutation = useMutation({
    mutationFn: (quizId: string) => api.post(`/ai/quiz/${quizId}/promote`).then((r) => r.data),
    onSuccess: (res) => {
      toast({ title: 'Quiz promoted to Assessment Centre!', variant: 'success' });
      if (res?.assessmentId) {
        setPromotedAssessmentId(res.assessmentId);
      }
    },
    onError: () => toast({ title: 'Promotion failed', variant: 'destructive' }),
  });

  const startInStudioAttempt = () => {
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setAttemptScore(null);
    setStage('attempt');
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitInStudioAttempt = () => {
    const questions = quiz?.questions || [];
    let correct = 0;
    questions.forEach((q: any, i: number) => {
      if (selectedAnswers[i] === q.correctIndex) {
        correct++;
      }
    });
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setAttemptScore({ correct, total: questions.length, pct });
    setStage('attempt-results');
    toast({ title: `Quiz Attempt Completed: ${pct}%!`, variant: pct >= 70 ? 'success' : 'default' });
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Page Header */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ai-bg text-ai-text text-xs font-bold mb-2">
            <Sparkles size={12} /> Steps 11 & 12 · AI Learning Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Generate & Attempt Quiz (AI)
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Upload notes, survey PDFs or MoSPI manuals to instantly extract psychometric quiz items and test your knowledge with live AI evaluation.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="card p-6 sm:p-8 shadow-sm">
          {/* Stage: Upload */}
          {stage === 'upload' && (
            <div className="space-y-6">
              <div
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all ${
                  file
                    ? 'border-accent-teal bg-accent-teal-light/20'
                    : 'border-border hover:border-primary/50 hover:bg-surface-elevated/40'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFile(e.target.files[0]);
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {file ? <FileText size={28} className="text-accent-teal" /> : <Upload size={28} />}
                </div>

                {file ? (
                  <div>
                    <div className="font-bold text-text-primary text-base">{file.name}</div>
                    <div className="text-xs text-text-secondary mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for AI analysis
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-3 text-xs text-critical hover:underline inline-flex items-center gap-1"
                    >
                      <X size={13} /> Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold text-text-primary text-base">Drop your document here, or browse</div>
                    <div className="text-xs text-text-secondary mt-1">Supports PDF, DOCX, TXT up to 15MB</div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
                  Target Competency Focus (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sampling Theory, Survey Design, Machine Learning..."
                  className="input w-full"
                  value={competency}
                  onChange={(e) => setCompetency(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => uploadMutation.mutate()}
                  disabled={!file || uploadMutation.isPending}
                  className="btn-primary w-full sm:w-auto font-bold flex items-center justify-center gap-2"
                >
                  {uploadMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                  <span>{uploadMutation.isPending ? 'Synthesizing Psychometric Quiz…' : 'Generate AI Quiz Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Stage: Review (Questions Overview & Choice to Attempt or Publish) */}
          {stage === 'review' && quiz && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-accent-teal-light/40 border border-accent-teal-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-teal text-white flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-text-primary">Step 11: Quiz Generated Successfully!</div>
                    <div className="text-xs text-text-secondary">
                      {quiz.questions?.length} questions synthesized · Proceed to attempt or publish to assessment center.
                    </div>
                  </div>
                </div>
                <span className="badge bg-white text-accent-teal font-bold px-3 py-1">AI Calibrated</span>
              </div>

              {/* Action Banner to Attempt Quiz immediately */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <PlayCircle size={16} /> Ready to test yourself?
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    Take Step 12 (Attempt Quiz) directly with instant evaluation and feedback.
                  </div>
                </div>
                <button
                  onClick={startInStudioAttempt}
                  className="btn bg-primary text-white hover:bg-primary/90 text-xs font-bold px-4 py-2 flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                >
                  <PlayCircle size={14} /> Attempt Quiz Now
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-base text-text-primary">Generated Questions Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quiz.questions?.map((q: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-background/60 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1.5">Question {i + 1}</div>
                        <div className="font-semibold text-sm text-text-primary mb-3 leading-snug">{q.prompt}</div>
                        <div className="space-y-1.5">
                          {q.options.map((opt: string, j: number) => (
                            <div
                              key={j}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                                j === q.correctIndex
                                  ? 'bg-accent-teal-light text-accent-teal border-accent-teal/40 font-semibold'
                                  : 'border-border/60 text-text-secondary bg-surface'
                              }`}
                            >
                              {String.fromCharCode(65 + j)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setStage('upload');
                    setFile(null);
                    setQuiz(null);
                    setPromotedAssessmentId(null);
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Upload Another Document
                </button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {promotedAssessmentId ? (
                    <Link
                      to={`/assessments/${promotedAssessmentId}/attempt`}
                      className="btn bg-accent-teal text-white hover:bg-accent-teal/90 w-full sm:w-auto font-bold flex items-center justify-center gap-2"
                    >
                      <span>Attempt in Assessment Centre →</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => promoteMutation.mutate(quiz.quizId)}
                      disabled={promoteMutation.isPending}
                      className="btn-primary w-full sm:w-auto font-bold flex items-center justify-center gap-2"
                    >
                      {promoteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      <span>{promoteMutation.isPending ? 'Publishing…' : 'Publish to Assessment Centre'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stage: Interactive In-Studio Quiz Attempt (Step 12: Attempt Quiz) */}
          {stage === 'attempt' && quiz && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="badge bg-primary text-white text-xs font-bold px-2.5 py-1">
                    Step 12: Attempt Quiz
                  </span>
                  <span className="text-xs text-text-secondary font-medium">
                    Question {currentQIndex + 1} of {quiz.questions.length}
                  </span>
                </div>
                <button
                  onClick={() => setStage('review')}
                  className="text-xs text-text-secondary hover:text-text-primary underline"
                >
                  Exit Attempt
                </button>
              </div>

              {/* Progress track */}
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Active question */}
              {(() => {
                const q = quiz.questions[currentQIndex];
                const selected = selectedAnswers[currentQIndex];
                return (
                  <div className="space-y-5">
                    <div className="card p-5 bg-surface-elevated/40 border border-border">
                      <div className="text-xs uppercase font-bold tracking-wider text-primary mb-2">
                        Question #{currentQIndex + 1}
                      </div>
                      <div className="text-base sm:text-lg font-bold text-text-primary leading-relaxed">
                        {q.prompt}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {q.options.map((opt: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => handleSelectOption(currentQIndex, i)}
                          className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            selected === i
                              ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                              : 'border-border bg-surface hover:border-primary/40 text-text-primary font-medium'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              selected === i ? 'bg-primary text-white' : 'bg-border/60 text-text-secondary'
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 text-sm">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Attempt Navigation Controls */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="btn-secondary btn-sm"
                >
                  Previous
                </button>
                {currentQIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    disabled={selectedAnswers[currentQIndex] === undefined}
                    className="btn-primary btn-sm flex items-center gap-1"
                  >
                    Next Question <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={submitInStudioAttempt}
                    disabled={selectedAnswers[currentQIndex] === undefined}
                    className="btn bg-accent-teal text-white hover:bg-accent-teal/90 btn-sm font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} /> Submit & Evaluate
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Stage: Attempt Results with Instant Evaluation & Explanations */}
          {stage === 'attempt-results' && attemptScore && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl text-center ${
                  attemptScore.pct >= 70
                    ? 'bg-accent-teal-light/40 border border-accent-teal-border text-accent-teal'
                    : 'bg-warning-light/40 border border-warning-border text-warning'
                }`}
              >
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-black bg-white shadow-sm mb-3">
                  {attemptScore.pct}%
                </div>
                <h2 className="text-xl font-extrabold text-text-primary">
                  {attemptScore.pct >= 70 ? '🎉 Excellent Comprehension!' : '📈 Good Attempt — Room for Growth'}
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  You answered {attemptScore.correct} out of {attemptScore.total} questions correctly.
                </p>
              </div>

              {/* Detailed Breakdown with Explanations */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">
                  Instant Evaluation & Explanations
                </h3>
                {quiz.questions.map((q: any, i: number) => {
                  const userAns = selectedAnswers[i];
                  const isCorrect = userAns === q.correctIndex;
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${
                        isCorrect
                          ? 'bg-accent-teal-light/20 border-accent-teal-border'
                          : 'bg-critical-light/20 border-critical-border'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {isCorrect ? (
                          <CheckCircle2 size={16} className="text-accent-teal flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={16} className="text-critical flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-text-primary">{q.prompt}</div>
                          <div className="mt-2 text-xs flex flex-wrap gap-3">
                            <span className="text-text-secondary">
                              Your answer: <strong>{userAns !== undefined ? q.options[userAns] : 'Not answered'}</strong>
                            </span>
                            {!isCorrect && (
                              <span className="text-accent-teal font-semibold">
                                Correct: {q.options[q.correctIndex]}
                              </span>
                            )}
                          </div>
                          {q.explanation && (
                            <div className="mt-2 text-xs text-text-secondary italic bg-surface p-2.5 rounded-lg border border-border">
                              💡 <strong>AI Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Steps Buttons */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <button onClick={startInStudioAttempt} className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-1.5">
                  <RotateCcw size={14} /> Retake Quiz
                </button>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Link to="/progress" className="btn-secondary w-full sm:w-auto text-center">
                    Step 13: Track Progress →
                  </Link>
                  <Link to="/assessments" className="btn-primary w-full sm:w-auto text-center font-bold">
                    Step 14: Take Official Assessment →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
