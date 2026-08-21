import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { marketplaceService } from "../../services/marketplaceService";
import { ListingAvailability } from "../../types/enums";
import { PageHeader } from "../../components/ui";

export function CreateListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [form, setForm] = useState({
    crop: "",
    category: "Vegetables",
    quantity: "",
    unit: "crates",
    pricePerUnit: "",
    location: user?.location || "",
    availability: ListingAvailability.InStock,
    description: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const listing = await marketplaceService.createListing({
        farmerId: user?.id,
        farmerName: user?.name,
        crop: form.crop,
        category: form.category,
        quantity: parseInt(form.quantity) || 0,
        unit: form.unit,
        pricePerUnit: parseInt(form.pricePerUnit) || 0,
        location: form.location,
        availability: form.availability,
        description: form.description,
        imageUrl: imagePreview,
      });
      navigate(`/marketplace/${listing.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Compress: resize to max 800px and reduce quality
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          setImagePreview(compressed);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="fade-in max-w-2xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <PageHeader title="Create Listing" subtitle="List your produce for buyers to discover." />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {/* Image upload */}
        <div>
          <label className="label">Produce Photo</label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover border border-sage-200" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-sage-300 bg-sage-50">
                <ImageIcon className="h-8 w-8 text-sage-400" />
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="listing-image"
              />
              <label htmlFor="listing-image" className="btn-outline cursor-pointer">
                Upload Photo
              </label>
              <p className="text-xs text-forest-500 mt-1">Images are compressed before upload.</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Crop Name</label>
            <input
              type="text"
              value={form.crop}
              onChange={(e) => setForm({ ...form, crop: e.target.value })}
              className="input"
              placeholder="e.g. Fresh Tomatoes"
              required
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              <option>Vegetables</option>
              <option>Grains</option>
              <option>Fruits</option>
              <option>Roots & Tubers</option>
              <option>Legumes</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="input"
              placeholder="100"
              required
              min="1"
            />
          </div>
          <div>
            <label className="label">Unit</label>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input">
              <option>crates</option>
              <option>bags</option>
              <option>kg</option>
              <option>tonnes</option>
              <option>baskets</option>
            </select>
          </div>
          <div>
            <label className="label">Price per Unit (₦)</label>
            <input
              type="number"
              value={form.pricePerUnit}
              onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
              className="input"
              placeholder="4500"
              required
              min="0"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input"
              placeholder="e.g. Kano, Nigeria"
              required
            />
          </div>
          <div>
            <label className="label">Availability</label>
            <select
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value as ListingAvailability })}
              className="input"
            >
              <option value={ListingAvailability.InStock}>In Stock</option>
              <option value={ListingAvailability.Limited}>Limited</option>
              <option value={ListingAvailability.SoldOut}>Sold Out</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input min-h-[80px]"
            placeholder="Describe your produce — quality, harvest date, etc."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            <Plus className="h-4 w-4" />
            {loading ? "Creating..." : "Create Listing"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
