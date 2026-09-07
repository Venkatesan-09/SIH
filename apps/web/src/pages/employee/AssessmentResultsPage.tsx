import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Loader2, RotateCcw } from 'lucide-react';

export function AssessmentResultsPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['assessment-results', id], queryFn: () => api.get(`/assessments/${id}/results`).then(r => r.data) });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!data) return <div className="text-center py-16 text-text-secondary">No results found. Take the assessment first.</div>;

  const pct = Math.round(data.scorePct ?? 0);
  const passed = pct >= 70;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Score hero */}
      <div className={`px-4 pt-10 pb-16 text-center ${passed ? 'gradient-success' : 'bg-gradient-to-b from-critical to-critical/60'}`}>
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white border-4 ${passed ? 'border-white/40' : 'border-white/40'}`}>
          {pct}%
        </div>
        <div className="text-white text-xl font-bold mt-4">{passed ? '🎉 Well done!' : 'Keep Practicing'}</div>
        <div className="text-white/80 text-sm mt-1">{data.correctCount}/{data.totalCount} correct answers</div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* AI insight */}
        <div className="card p-4 badge-ai">
          <div className="text-xs font-semibold text-ai-text mb-1">AI Insight</div>
          <p className="text-sm text-text-primary">{data.aiInsight}</p>
        </div>

        {/* Strengths & weak areas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="text-xs text-accent-teal font-semibold mb-2">Strengths</div>
            {data.strengths?.length > 0
              ? data.strengths.map((s: any) => <div key={s.id} className="text-xs text-text-secondary">{s.name}</div>)
              : <div className="text-xs text-text-secondary">Keep practicing!</div>}
          </div>
          <div className="card p-4">
            <div className="text-xs text-critical font-semibold mb-2">Focus Areas</div>
            {data.weakAreas?.length > 0
              ? data.weakAreas.map((s: any) => <div key={s.id} className="text-xs text-text-secondary">{s.name}</div>)
              : <div className="text-xs text-text-secondary">Great work!</div>}
          </div>
        </div>

        {/* Question review */}
        <div className="card p-4">
          <div className="font-semibold text-sm mb-3">Question Review</div>
          <div className="space-y-4">
            {data.questions?.map((q: any, i: number) => (
              <div key={q.id} className={`p-3 rounded-lg border ${q.isCorrect ? 'bg-success-light border-success-border' : 'bg-critical-light border-critical-border'}`}>
                <div className="flex items-start gap-2">
                  {q.isCorrect ? <CheckCircle size={14} className="text-accent-teal mt-0.5 flex-shrink-0" /> : <XCircle size={14} className="text-critical mt-0.5 flex-shrink-0" />}
                  <div>
                    <div className="text-xs font-medium text-text-primary">{q.prompt}</div>
                    {!q.isCorrect && <div className="text-xs text-text-secondary mt-1">Correct: {q.options[q.correctIndex]}</div>}
                    {q.explanation && <div className="text-xs text-text-secondary mt-1 italic">{q.explanation}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/assessments" className="btn-secondary btn-sm text-center">
            <RotateCcw size={14} /> All Assessments
          </Link>
          <Link to="/courses" className="btn-primary btn-sm text-center">Improve with Courses</Link>
        </div>
      </div>
    </div>
  );
}
