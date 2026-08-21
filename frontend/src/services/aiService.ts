import { apiRequest } from "./client";
import { mockStore } from "./mockStore";
import type { CropDiagnosis, AIMessage, AdminOverview, AuditLog, RiskSignal, Dispute, Notification } from "../types";

// ── AI mock logic ────────────────────────────────────
const cropConditions = [
  {
    crop: "Tomato",
    condition: "Possible Early Blight",
    confidence: 94,
    severity: "moderate" as const,
    likelyCauses: ["Alternaria solani fungus", "High humidity", "Overhead watering"],
    recommendedActions: [
      "Remove heavily affected leaves.",
      "Improve field airflow.",
      "Avoid overhead watering.",
      "Monitor nearby plants.",
    ],
  },
  {
    crop: "Maize",
    condition: "Possible Fall Armyworm damage",
    confidence: 91,
    severity: "high" as const,
    likelyCauses: ["Spodoptera frugiperda larvae", "Late planting", "No crop rotation"],
    recommendedActions: [
      "Apply biological pesticide (Bacillus thuringiensis).",
      "Scout early morning for larvae.",
      "Plant trap crops around field edges.",
    ],
  },
  {
    crop: "Pepper",
    condition: "Possible Bacterial Spot",
    confidence: 87,
    severity: "moderate" as const,
    likelyCauses: ["Xanthomonas bacteria", "Splashing rain", "Contaminated seed"],
    recommendedActions: [
      "Use copper-based bactericide spray.",
      "Remove infected plants.",
      "Use disease-free certified seed next season.",
    ],
  },
  {
    crop: "Cassava",
    condition: "Possible Cassava Mosaic Disease",
    confidence: 89,
    severity: "high" as const,
    likelyCauses: ["Whitefly-transmitted virus", "Infected planting material"],
    recommendedActions: [
      "Remove and burn infected plants.",
      "Plant resistant varieties.",
      "Control whitefly populations.",
    ],
  },
];

function detectCrop(fileName: string): { crop: string; condition: typeof cropConditions[0] } {
  const lower = fileName.toLowerCase();
  for (const c of cropConditions) {
    if (lower.includes(c.crop.toLowerCase())) return { crop: c.crop, condition: c };
  }
  // Default to tomato
  return { crop: "Tomato", condition: cropConditions[0] };
}

export const aiService = {
  async diagnoseCrop(imageName: string, _imageData?: string): Promise<CropDiagnosis> {
    return apiRequest(
      "/api/ai/crop-diagnosis",
      { method: "POST", body: JSON.stringify({ imageName }) },
      () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const { crop, condition } = detectCrop(imageName);
            resolve({
              id: `diag-${Date.now()}`,
              crop,
              condition: condition.condition,
              confidence: condition.confidence,
              severity: condition.severity,
              likelyCauses: condition.likelyCauses,
              recommendedActions: condition.recommendedActions,
              imageUrl: _imageData,
              createdAt: new Date().toISOString(),
            });
          }, 1500);
        });
      },
    );
  },

  async ask(data: { question: string; language: string; context?: string }): Promise<AIMessage> {
    return apiRequest(
      "/api/ai/ask",
      { method: "POST", body: JSON.stringify(data) },
      () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              id: `msg-${Date.now()}`,
              role: "assistant",
              content: generateAnswer(data.question, data.language, data.context),
              language: data.language,
              createdAt: new Date().toISOString(),
            });
          }, 800);
        });
      },
    );
  },
};

function generateAnswer(question: string, language: string, context?: string): string {
  const lower = question.toLowerCase();
  const ctxLine = context ? ` Based on the diagnosis (${context}),` : "";

  if (lower.includes("first") || lower.includes("start") || lower.includes("begin")) {
    return `${ctxLine} start by isolating the affected plants and removing any visibly damaged leaves to prevent further spread. Then improve airflow around the crops and adjust your watering schedule to avoid overhead irrigation. After stabilising the field, list your healthy produce on Agrolink to find buyers quickly.`;
  }
  if (lower.includes("buy") || lower.includes("sell") || lower.includes("market")) {
    return `${ctxLine} you can list your produce on the Agrolink marketplace right now. Buyers like FreshMart Foods are actively sourcing quality crops. I recommend creating a listing with your available quantity and setting a competitive price based on current market rates.`;
  }
  if (lower.includes("transport") || lower.includes("deliver") || lower.includes("haul")) {
    return `${ctxLine} SwiftHaul Logistics operates refrigerated trucks covering Northern and Southern Nigeria. You can find available transporters on the Deliveries page. For perishable crops like tomatoes, refrigerated transport is strongly recommended to maintain quality.`;
  }
  if (lower.includes("water") || lower.includes("irrigat")) {
    return `${ctxLine} switch from overhead watering to drip irrigation at the base of plants. This reduces leaf wetness and limits fungal spread. Water early in the morning so any moisture on leaves dries quickly during the day.`;
  }

  // Language-specific greetings
  const greetings: Record<string, string> = {
    yoruba: "Kaabo! ",
    igbo: "Nnọọ! ",
    hausa: "Barka da zuwa! ",
  };
  const prefix = greetings[language] || "";
  return `${prefix}${ctxLine} I recommend inspecting your crops regularly, maintaining proper field hygiene, and using the Agrolink marketplace to connect with verified buyers. You can also check your trust score to see how your reliability rating helps attract more buyers. Is there a specific issue you'd like help with?`;
}

// ── ADMIN ───────────────────────────────────────────
export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    return apiRequest("/api/admin/overview", {}, () => mockStore.getAdminOverview());
  },

  async getRiskSignals(): Promise<RiskSignal[]> {
    return apiRequest("/api/admin/risk-signals", {}, () => mockStore.getRiskSignals());
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return apiRequest("/api/admin/audit-logs", {}, () => mockStore.getAuditLogs());
  },
};

// ── DISPUTES ────────────────────────────────────────
export const disputeService = {
  async createDispute(orderId: string, reason: string, description: string, raisedBy: string): Promise<Dispute> {
    return apiRequest(
      `/api/orders/${orderId}/disputes`,
      { method: "POST", body: JSON.stringify({ reason, description }) },
      () => mockStore.createDispute(orderId, reason, description, raisedBy),
    );
  },

  async getDisputes(): Promise<Dispute[]> {
    return apiRequest("/api/disputes", {}, () => mockStore.getDisputes());
  },
};

// ── NOTIFICATIONS ───────────────────────────────────
export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    return apiRequest("/api/notifications", {}, () => mockStore.getNotifications(userId));
  },
};
