import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Clock, ChevronLeft, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import { toast } from '../../components/ui/toaster';

export function AssessmentAttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const { data, isLoading } = useQuery({ queryKey: ['assessment-questions', id], queryFn: () => api.get(`/assessments/${id}/questions`).then(r => r.data) });
  const questions = data?.questions ?? [];

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/assessments/${id}/submit`, {
      answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex })),
    }),
    onSuccess: () => { toast({ title: 'Assessment submitted!', variant: 'success' }); navigate(`/assessments/${id}/results`); },
    onError: () => toast({ title: 'Submission failed', variant: 'destructive' }),
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!questions.length) return <div className="flex items-center justify-center min-h-screen text-text-secondary">No questions found</div>;

  const q = questions[current];
  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ChevronLeft size={20} /></button>
        <div className="flex-1">
          <div className="text-sm font-semibold">{data?.title}</div>
          <div className="text-xs text-text-secondary">Q{current + 1} of {questions.length}</div>
        </div>
        <div className="text-sm font-medium text-primary">{totalAnswered}/{questions.length} answered</div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-border">
        <div className="h-full bg-primary transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-6">
        <div className="card p-5 mb-4">
          <div className="text-xs font-medium text-text-secondary mb-3">Question {current + 1}</div>
          <p className="text-text-primary font-medium leading-relaxed">{q.prompt}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {(q.options as string[]).map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
              className={`w-full text-left p-4 rounded-card border-2 transition-all ${
                answers[q.id] === i
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-border bg-surface hover:border-primary/40'
              }`}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border mr-3 text-sm font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Nav footer */}
      <div className="bg-surface border-t border-border px-4 py-4 flex items-center gap-3">
        <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0} className="btn-secondary flex-1">
          <ChevronLeft size={16} /> Previous
        </button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} disabled={!answers[q.id] && answers[q.id] !== 0} className="btn-primary flex-1">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || totalAnswered < questions.length} className="btn-primary flex-1">
            {submitMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {submitMutation.isPending ? 'Submitting…' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
