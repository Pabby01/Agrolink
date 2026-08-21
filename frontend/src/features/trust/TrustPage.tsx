import { useAsync } from "../../lib/useAsync";
import { PageHeader, LoadingSpinner, ErrorState } from "../../components/ui";
import { trustService } from "../../services/trustService";
import { mockStore } from "../../services/mockStore";
import type { User, TrustProfile } from "../../types";

export function TrustPage() {
  const { data: allUsers, loading, error } = useAsync(async () => {
    // Get all users from mock store (in production this would be an API call)
    return mockStore.users as User[];
  }, []);

  if (loading) return <LoadingSpinner label="Loading trust profiles..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="fade-in">
      <PageHeader
        title="Trust Network"
        subtitle="Cross-role trust scores for everyone in the Agrolink network."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {allUsers?.map((u) => (
          <TrustCard key={u.id} user={u} />
        ))}
      </div>
    </div>
  );
}

function TrustCard({ user }: { user: User }) {
  const { data: trust, loading, error } = useAsync<TrustProfile>(
    () => trustService.getTrust(user.id),
    [user.id],
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  if (!trust) return null;

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-ivory-50 font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-forest-900">{user.name}</h3>
            <p className="text-xs text-forest-500">{roleLabel} · {user.location}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="rounded-lg bg-sage-50 p-3">
          <div className={`text-2xl font-bold ${trust.score >= 90 ? "text-forest-700" : trust.score >= 75 ? "text-sage-600" : "text-gold-600"}`}>
            {trust.score}
          </div>
          <div className="text-[10px] text-forest-500 uppercase">Score</div>
        </div>
        <div className="rounded-lg bg-sage-50 p-3">
          <div className="text-2xl font-bold text-forest-800">{trust.rating.toFixed(1)}</div>
          <div className="text-[10px] text-forest-500 uppercase">Rating</div>
        </div>
        <div className="rounded-lg bg-sage-50 p-3">
          <div className="text-2xl font-bold text-forest-800">{trust.completedTransactions}</div>
          <div className="text-[10px] text-forest-500 uppercase">Completed</div>
        </div>
        <div className="rounded-lg bg-sage-50 p-3">
          <div className="text-2xl font-bold text-forest-800">{trust.fulfilmentRate}%</div>
          <div className="text-[10px] text-forest-500 uppercase">Fulfilment</div>
        </div>
      </div>

      {trust.trends.length > 0 && (
        <div className="mt-4 border-t border-sage-200 pt-3">
          <div className="text-xs text-forest-500 mb-2">6-month trend</div>
          <div className="flex items-end gap-1.5 h-12">
            {trust.trends.map((t) => (
              <div key={t.period} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-sage-400"
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
