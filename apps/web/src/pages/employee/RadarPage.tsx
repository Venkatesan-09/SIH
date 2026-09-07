import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

function RadarChart({
  scores,
  onSelectCompetency,
  activeLabel,
}: {
  scores: Array<{ label: string; value: number; required: number }>;
  onSelectCompetency?: (label: string) => void;
  activeLabel?: string | null;
}) {
  if (!scores || scores.length === 0) {
    return null;
  }

  const N = scores.length;
  // Center coordinates and radius in a 440x440 viewBox so labels have plenty of room
  const cx = 220;
  const cy = 220;
  const r = 135;

  const toXY = (i: number, val: number) => {
    const angle = (2 * Math.PI * i) / N - Math.PI / 2;
    const clamped = Math.max(0, Math.min(100, val));
    return {
      x: cx + (r * clamped / 100) * Math.cos(angle),
      y: cy + (r * clamped / 100) * Math.sin(angle),
    };
  };

  const axisXY = (i: number, val = 1) => {
    const angle = (2 * Math.PI * i) / N - Math.PI / 2;
    return {
      x: cx + r * val * Math.cos(angle),
      y: cy + r * val * Math.sin(angle),
    };
  };

  const toPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
  };

  const actualPts = scores.map((s, i) => toXY(i, s.value));
  const reqPts = scores.map((s, i) => toXY(i, s.required));

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-square flex items-center justify-center select-none">
      <svg
        viewBox="0 0 440 440"
        className="w-full h-full drop-shadow-sm overflow-visible"
      >
        <defs>
          {/* Radial / linear gradient fills for clean projection */}
          <linearGradient id="userRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E8F73" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="reqRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Concentric grid rings (20%, 40%, 60%, 80%, 100%) */}
        {[20, 40, 60, 80, 100].map((pct) => (
          <g key={pct}>
            <polygon
              points={scores
                .map((_, i) => {
                  const p = axisXY(i, pct / 100);
                  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                })
                .join(' ')}
              fill={pct === 100 ? 'currentColor' : 'none'}
              className={pct === 100 ? 'text-surface fill-opacity-40 stroke-border/80' : 'stroke-border/70'}
              strokeWidth={1}
            />
            {/* Axis % indicator along the top axis */}
            <text
              x={cx + 4}
              y={cy - (r * pct) / 100 + 3}
              fontSize={8}
              fill="#94A3B8"
              className="font-bold pointer-events-none select-none"
            >
              {pct}%
            </text>
          </g>
        ))}

        {/* Radial Axis Lines */}
        {scores.map((_, i) => {
          const end = axisXY(i, 1.0);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              className="stroke-border/80"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Role Target (Benchmark) Polygon */}
        <path
          d={toPath(reqPts)}
          fill="url(#reqRadarGrad)"
          stroke="#6366F1"
          strokeWidth={1.8}
          strokeDasharray="5 3"
          className="transition-all duration-300"
        />

        {/* User Actual Score Polygon */}
        <path
          d={toPath(actualPts)}
          fill="url(#userRadarGrad)"
          stroke="#0E8F73"
          strokeWidth={2.5}
          className="transition-all duration-300"
        />

        {/* Benchmark Dots */}
        {reqPts.map((p, i) => (
          <circle
            key={`req-${i}`}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="#6366F1"
            className="pointer-events-none"
          />
        ))}

        {/* User Score Dots & Values */}
        {actualPts.map((p, i) => {
          const sc = scores[i];
          if (!sc) return null;
          const isSelected = activeLabel === sc.label;
          return (
            <g
              key={`act-${i}`}
              className="cursor-pointer group"
              onClick={() => onSelectCompetency?.(sc.label)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 6 : 4.5}
                fill="#0E8F73"
                stroke="#FFFFFF"
                strokeWidth={2}
                className="transition-all duration-200 group-hover:scale-125"
              />
            </g>
          );
        })}

        {/* Outer Dimension Labels with text-anchor intelligence */}
        {scores.map((s, i) => {
          const angle = (2 * Math.PI * i) / N - Math.PI / 2;
          const isTop = Math.abs(angle + Math.PI / 2) < 0.1 || Math.abs(angle - (3 * Math.PI) / 2) < 0.1;
          const isBottom = Math.abs(angle - Math.PI / 2) < 0.1;
          const isRight = Math.cos(angle) > 0.1;
          const isLeft = Math.cos(angle) < -0.1;

          // Distance multiplier slightly extended so text doesn't overlap polygon points
          const lp = axisXY(i, 1.25);
          const anchor = isRight ? 'start' : isLeft ? 'end' : 'middle';
          const isSelected = activeLabel === s.label;

          return (
            <g
              key={`lbl-${i}`}
              className="cursor-pointer group"
              onClick={() => onSelectCompetency?.(s.label)}
            >
              <text
                x={lp.x}
                y={lp.y + (isTop ? -4 : isBottom ? 10 : 2)}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={11}
                className={`transition-colors font-bold ${
                  isSelected
                    ? 'fill-primary font-black text-xs'
                    : 'fill-text-primary group-hover:fill-primary text-[11px]'
                }`}
              >
                {s.label.length > 18 ? s.label.slice(0, 16) + '…' : s.label}
              </text>
              <text
                x={lp.x}
                y={lp.y + (isTop ? 8 : isBottom ? 22 : 14)}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={9.5}
                className="fill-text-secondary font-semibold"
              >
                {s.value}% / {s.required}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function RadarPage() {
  const { user } = useAuthStore();
  const [selectedComp, setSelectedComp] = useState<string | null>(null);

  const { data: twinData, isLoading } = useQuery({
    queryKey: ['skilltwin-me'],
    queryFn: () => api.get('/skilltwin/me').then((r) => r.data.skillTwin),
  });

  const competencies = twinData?.competencies ?? [];
  const scores = competencies.slice(0, 8).map((c: any) => ({
    id: c.competencyId,
    label: c.competencyName,
    cluster: c.cluster,
    value: Math.round(c.currentScore),
    required: c.requiredScore,
    gap: c.gap,
    priority: c.priority,
    proficiencyLevel: c.proficiencyLevel,
  }));

  const avgCurrent = twinData?.avgCurrentScore ?? (scores.length > 0 ? Math.round(scores.reduce((a: number, b: any) => a + b.value, 0) / scores.length) : 0);
  const avgRequired = twinData?.avgRequiredScore ?? (scores.length > 0 ? Math.round(scores.reduce((a: number, b: any) => a + b.required, 0) / scores.length) : 75);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Container */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ai-bg text-ai-text text-xs font-bold mb-2">
              Steps 5 & 15 · SkillTwin™ Vector Intelligence & Updated Radar
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Competency Radar & SkillTwin</h1>
            <p className="text-sm text-text-secondary mt-1">
              Multi-dimensional evaluation comparing your current scores against {user?.jobRole?.title ?? 'Role'} benchmarks (Step 5 initial & Step 15 post-learning evolution).
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="card px-4 py-2 text-center bg-background border-border">
              <div className="text-xs text-text-secondary">Average Score</div>
              <div className="text-lg font-black text-accent-teal">{avgCurrent}%</div>
            </div>
            <div className="card px-4 py-2 text-center bg-background border-border">
              <div className="text-xs text-text-secondary">Role Target</div>
              <div className="text-lg font-black text-primary">{avgRequired}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns on desktop (lg:grid-cols-12) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Radar Visual Representation (lg: col-span-6) */}
          <div className="lg:col-span-6 card p-6 sm:p-8 flex flex-col items-center justify-center shadow-sm">
            <div className="w-full flex items-center justify-between mb-4 border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Radar Projection</span>
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-1 bg-accent-teal rounded" />
                  <span className="font-medium text-text-primary">Your Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-0.5 border-t-2 border-dashed border-[#6366F1]" />
                  <span className="font-medium text-text-primary">Benchmark</span>
                </div>
              </div>
            </div>

            <div className="w-full py-2 flex items-center justify-center">
              {isLoading ? (
                <div className="skeleton h-72 w-72 rounded-full mx-auto" />
              ) : scores.length > 0 ? (
                <div className="w-full">
                  <RadarChart
                    scores={scores}
                    activeLabel={selectedComp}
                    onSelectCompetency={(label) =>
                      setSelectedComp((prev) => (prev === label ? null : label))
                    }
                  />
                </div>
              ) : (
                <div className="text-center py-16 text-text-secondary">
                  <div className="font-medium">No skill scores recorded yet</div>
                  <div className="text-sm mt-1">Take assessments to generate your competency twin</div>
                </div>
              )}
            </div>

            <div className="w-full mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <span>Projection based on verified assessments & self-appraisals</span>
              <span className="font-semibold text-primary">8 Dimensions</span>
            </div>
          </div>

          {/* Right: Detailed Competency Breakdown (lg: col-span-6) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary">Competency Breakdown</h2>
              <span className="text-xs text-text-secondary">{scores.length} skills measured</span>
            </div>

            {isLoading && (
              <div className="space-y-3">
                <div className="skeleton h-20 rounded-xl" />
                <div className="skeleton h-20 rounded-xl" />
                <div className="skeleton h-20 rounded-xl" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {scores.map((s: any) => {
                const delta = s.value - s.required;
                const isMet = delta >= 0;
                const isSelected = selectedComp === s.label;

                return (
                  <div
                    key={s.label}
                    onClick={() => setSelectedComp(prev => (prev === s.label ? null : s.label))}
                    className={`card p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 shadow-md bg-primary/5'
                        : 'hover:border-primary/40 hover:shadow-card-hover bg-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                          {s.label}
                        </div>
                        {s.cluster && <div className="text-[11px] text-text-secondary">{s.cluster}</div>}
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isMet ? 'bg-accent-teal-light text-accent-teal' : 'bg-critical-light text-critical'}`}>
                          {isMet ? `+${delta}% Met` : `${delta}% Gap`}
                        </span>
                        <div className="text-xs font-black text-text-primary mt-1">{s.value}%</div>
                      </div>
                    </div>

                    <div className="space-y-1 mt-2">
                      <div className="progress-bar-track relative h-2">
                        <div
                          className={`progress-bar-fill ${isMet ? 'bg-accent-teal' : 'bg-warning'}`}
                          style={{ width: `${s.value}%` }}
                        />
                        <div
                          className="h-full w-0.5 bg-primary absolute top-0"
                          style={{ left: `${s.required}%` }}
                          title={`Required Target: ${s.required}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-text-secondary">
                        <span>Current: {s.value}%</span>
                        <span>Role Benchmark: {s.required}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
