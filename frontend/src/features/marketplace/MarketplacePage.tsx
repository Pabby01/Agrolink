import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Plus, Store, Filter } from "lucide-react";
import { useAsync } from "../../lib/useAsync";
import { marketplaceService } from "../../services/marketplaceService";
import { LoadingSpinner, ErrorState, EmptyState, PageHeader, StatusBadge } from "../../components/ui";
import { TrustScore } from "../../components/TrustScore";
import { ListingAvailability } from "../../types/enums";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../types/enums";
import { formatNaira } from "../../lib/format";

export function MarketplacePage() {
  const { data: listings, loading, error, refetch } = useAsync(() => marketplaceService.getListings(), []);
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(listings?.map((l) => l.category) ?? []);
    return ["all", ...Array.from(cats)];
  }, [listings]);

  const filtered = useMemo(() => {
    if (!listings) return [];
    return listings.filter((l) => {
      const matchesSearch = l.crop.toLowerCase().includes(search.toLowerCase()) ||
        l.location.toLowerCase().includes(search.toLowerCase()) ||
        l.farmerName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || l.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [listings, search, category]);

  return (
    <div className="fade-in">
      <PageHeader
        title="Marketplace"
        subtitle="Discover verified produce from trusted farmers."
        action={
          user?.role === Role.Farmer && (
            <Link to="/marketplace/create" className="btn-primary">
              <Plus className="h-4 w-4" />
              Create Listing
            </Link>
          )
        }
      />

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search crops, locations, farmers..."
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-400 pointer-events-none" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input pl-10 pr-8"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner label="Loading listings..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={<Store className="h-12 w-12" />}
          title="No listings found"
          message="Try adjusting your search or filters. New listings appear here when farmers create them."
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <Link
              key={listing.id}
              to={`/marketplace/${listing.id}`}
              className="card overflow-hidden hover:shadow-lg hover:border-forest-300 transition-all group"
            >
              {/* Image */}
              <div className="h-40 bg-sage-100 relative overflow-hidden">
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.crop} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Store className="h-12 w-12 text-sage-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={listing.availability} />
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-forest-900">{listing.crop}</h3>
                    <p className="text-xs text-forest-500">{listing.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-forest-800">{formatNaira(listing.pricePerUnit)}</div>
                    <div className="text-xs text-forest-500">per {listing.unit}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-forest-500 mb-3">
                  <MapPin className="h-3 w-3" />
                  {listing.location}
                </div>

                <div className="flex items-center justify-between border-t border-sage-100 pt-3">
                  <span className="text-sm text-forest-600">{listing.farmerName}</span>
                  <TrustScore userId={listing.farmerId} variant="badge" />
                </div>

                <div className="text-xs text-forest-500 mt-2">
                  {listing.quantity} {listing.unit} available
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
