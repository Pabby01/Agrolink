import { useAsync } from "../lib/useAsync";
import { trustService } from "../services/trustService";
import { TrustLevel, VerificationStatus } from "../types/enums";
import { ShieldCheck, Star, TrendingUp, Award, BadgeCheck } from "lucide-react";

interface TrustScoreProps {
  userId: string;
  variant?: "full" | "compact" | "badge";
  showName?: boolean;
  name?: string;
}

export function TrustScore({ userId, variant = "full", name }: TrustScoreProps) {
  const { data: trust, loading, error } = useAsync(() => trustService.getTrust(userId), [userId]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg bg-sage-100 h-20" />
    );
  }

  if (error || !trust) {
    return <div className="text-xs text-red-600">Trust unavailable</div>;
  }

  if (variant === "badge") {
    return (
      <span className="badge bg-sage-100 text-forest-800">
        <ShieldCheck className="h-3 w-3" />
        {trust.score}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-sage-50 px-3 py-2 border border-sage-200">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-forest-800">{trust.score}</span>
          <span className="text-[10px] uppercase text-forest-500">{levelLabel(trust.level)}</span>
        </div>
        <div className="h-8 w-px bg-sage-200" />
        <div className="text-xs text-forest-600">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
            <span className="font-semibold">{trust.rating.toFixed(1)}/5</span>
          </div>
          <div>{trust.completedTransactions} completed</div>
          <div>{trust.fulfilmentRate}% fulfilment</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wide">
            Trust Score
          </h3>
          {name && <p className="text-lg font-bold text-forest-900">{name}</p>}
        </div>
        {trust.verification === VerificationStatus.Verified && (
          <span className="badge bg-gold-100 text-gold-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        )}
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <div className={`text-5xl font-bold ${scoreColor(trust.score)}`}>{trust.score}</div>
          <div className="text-xs uppercase tracking-wide text-forest-500 mt-1">{levelLabel(trust.level)}</div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
            <span className="font-semibold text-forest-800">{trust.rating.toFixed(1)}/5</span>
            <span className="text-forest-500">rating</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-sage-500" />
            <span className="font-semibold text-forest-800">{trust.completedTransactions}</span>
            <span className="text-forest-500">completed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-sage-500" />
            <span className="font-semibold text-forest-800">{trust.fulfilmentRate}%</span>
            <span className="text-forest-500">fulfilment</span>
          </div>
        </div>
      </div>

      {trust.trends.length > 0 && (
        <div className="border-t border-sage-200 pt-3">
          <div className="text-xs text-forest-500 mb-2">6-month trend</div>
          <div className="flex items-end gap-1.5 h-16">
            {trust.trends.map((t) => (
              <div key={t.period} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-sage-400 hover:bg-sage-500 transition-colors"
                  style={{ height: `${(t.score / 100) * 100}%` }}
                />
                <span className="text-[10px] text-forest-400">{t.period}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-forest-700";
  if (score >= 75) return "text-sage-600";
  if (score >= 60) return "text-gold-600";
  return "text-red-600";
}

function levelLabel(level: TrustLevel): string {
  switch (level) {
    case TrustLevel.Elite:
      return "Elite Trust";
    case TrustLevel.High:
      return "High Trust";
    case TrustLevel.Established:
      return "Established";
    case TrustLevel.Building:
      return "Building";
  }
}
