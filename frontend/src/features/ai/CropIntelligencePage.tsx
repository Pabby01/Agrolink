import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Upload, Leaf, Send, AlertTriangle, Lightbulb, Store, Truck, Package, Loader2, Sparkles } from "lucide-react";
import { aiService } from "../../services/aiService";
import { useLanguage, type Language } from "../../context/LanguageContext";
import { PageHeader } from "../../components/ui";
import type { CropDiagnosis, AIMessage } from "../../types";

const languageLabels: Record<Language, string> = {
  english: "English",
  yoruba: "Yorùbá",
  igbo: "Igbo",
  hausa: "Hausa",
};

export function CropIntelligencePage() {
  const { language, setLanguage } = useLanguage();
  const [diagnosis, setDiagnosis] = useState<CropDiagnosis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDiagnosis(null);

    // Compress image
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
        runDiagnosis(file.name, compressed);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function runDiagnosis(fileName: string, imageData: string) {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await aiService.diagnoseCrop(fileName, imageData);
      setDiagnosis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    setAsking(true);

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: q,
      language: languageLabels[language],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const context = diagnosis ? `${diagnosis.crop} — ${diagnosis.condition}` : undefined;
      const reply = await aiService.ask({ question: q, language: languageLabels[language].toLowerCase(), context });
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const errMsg: AIMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't process your question right now.",
        language: languageLabels[language],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setAsking(false);
    }
  }

  const severityColors: Record<string, string> = {
    low: "bg-sage-100 text-forest-700",
    moderate: "bg-gold-100 text-gold-700",
    high: "bg-orange-100 text-orange-700",
    severe: "bg-red-100 text-red-700",
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Crop Intelligence"
        subtitle="AI-powered crop diagnosis and recommendations."
        action={
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold-500" />
            <span className="text-sm font-medium text-forest-600">AI Powered</span>
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload & Diagnosis */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-forest-700 uppercase mb-4">Scan Your Crop</h3>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="crop-upload"
            />

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden mb-3">
                <img src={imagePreview} alt="Crop" className="w-full h-56 object-cover" />
                {analyzing && (
                  <div className="absolute inset-0 bg-forest-900/60 flex flex-col items-center justify-center text-ivory-50">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-sm">Analyzing image...</p>
                  </div>
                )}
              </div>
            ) : (
              <label
                htmlFor="crop-upload"
                className="flex flex-col items-center justify-center h-56 rounded-xl border-2 border-dashed border-sage-300 bg-sage-50 cursor-pointer hover:border-forest-400 hover:bg-sage-100 transition-colors"
              >
                <Camera className="h-12 w-12 text-sage-400 mb-3" />
                <p className="text-sm font-medium text-forest-600">Upload or take a photo</p>
                <p className="text-xs text-forest-400 mt-1">JPG, PNG up to 10MB</p>
              </label>
            )}

            {imagePreview && !analyzing && (
              <button onClick={() => fileRef.current?.click()} className="btn-outline w-full">
                <Upload className="h-4 w-4" />
                Scan Another
              </button>
            )}

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Diagnosis results */}
          {diagnosis && (
            <div className="card p-6 fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-5 w-5 text-forest-700" />
                <h3 className="text-sm font-semibold text-forest-700 uppercase">Diagnosis</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-forest-500 mb-1">Crop</div>
                  <div className="text-lg font-bold text-forest-900">{diagnosis.crop}</div>
                </div>

                <div className="rounded-lg bg-sage-50 p-4">
                  <div className="text-xs text-forest-500 mb-1">Condition</div>
                  <div className="text-lg font-semibold text-forest-800">{diagnosis.condition}</div>
                  <p className="text-xs text-forest-500 mt-1 italic">
                    Image appears consistent with this diagnosis. This is not a certainty.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-sage-50 p-3 text-center">
                    <div className="text-xs text-forest-500 mb-1">Confidence</div>
                    <div className="text-2xl font-bold text-forest-800">{diagnosis.confidence}%</div>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${severityColors[diagnosis.severity]}`}>
                    <div className="text-xs text-forest-500 mb-1">Severity</div>
                    <div className="text-2xl font-bold capitalize">{diagnosis.severity}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-forest-500 mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Likely Causes
                  </div>
                  <ul className="space-y-1">
                    {diagnosis.likelyCauses.map((cause, i) => (
                      <li key={i} className="text-sm text-forest-600 flex items-start gap-2">
                        <span className="text-forest-400 mt-0.5">•</span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs text-forest-500 mb-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    Recommended Actions
                  </div>
                  <ol className="space-y-2">
                    {diagnosis.recommendedActions.map((action, i) => (
                      <li key={i} className="text-sm text-forest-700 flex items-start gap-2">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-forest-100 text-xs font-bold text-forest-700">
                          {i + 1}
                        </span>
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Next best action CTAs */}
              <div className="border-t border-sage-200 mt-5 pt-4">
                <div className="text-xs text-forest-500 mb-2">Next best action</div>
                <div className="grid grid-cols-3 gap-2">
                  <Link to="/marketplace" className="btn-secondary text-xs px-2 py-2">
                    <Store className="h-3.5 w-3.5" />
                    Find Buyers
                  </Link>
                  <Link to="/deliveries" className="btn-secondary text-xs px-2 py-2">
                    <Truck className="h-3.5 w-3.5" />
                    Find Transport
                  </Link>
                  <Link to="/orders" className="btn-secondary text-xs px-2 py-2">
                    <Package className="h-3.5 w-3.5" />
                    Inventory
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ask Agrolink */}
        <div className="space-y-4">
          <div className="card p-6 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-500" />
                <h3 className="text-sm font-semibold text-forest-700 uppercase">Ask Agrolink</h3>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="text-xs rounded-lg border border-sage-200 bg-white px-2 py-1 text-forest-700"
              >
                {(Object.keys(languageLabels) as Language[]).map((l) => (
                  <option key={l} value={l}>{languageLabels[l]}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Sparkles className="h-10 w-10 text-sage-300 mb-3" />
                  <p className="text-sm text-forest-500 mb-2">Ask a question about your crops</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["What should I do first?", "How do I find buyers?", "What transport do I need?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuestion(q)}
                        className="rounded-full bg-sage-100 px-3 py-1.5 text-xs text-forest-700 hover:bg-sage-200"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-forest-800 text-ivory-50"
                          : "bg-sage-100 text-forest-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {asking && (
                <div className="flex justify-start">
                  <div className="bg-sage-100 rounded-lg px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-forest-600" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="input flex-1"
                placeholder="Ask a question..."
                disabled={asking}
              />
              <button type="submit" className="btn-primary" disabled={asking || !question.trim()}>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
