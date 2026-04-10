import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BillAnalysis {
  providerName: string;
  dateOfService: string;
  totalAmount: number;
  items: {
    code: string;
    description: string;
    amount: number;
    potentialError?: string;
  }[];
  summary: string;
}

export interface InsuranceAnalysis {
  planName: string;
  coverageDetails: {
    category: string;
    coverage: string;
    notes?: string;
  }[];
}

export interface ConflictResult {
  conflicts: {
    itemDescription: string;
    billAmount: number;
    expectedAmount: number;
    reason: string;
    actionRecommended: string;
  }[];
  savingsPotential: number;
}

export const analyzeMedicalBill = async (base64Image: string, mimeType: string): Promise<BillAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "Analyze this medical bill. Extract the provider name, date of service, total amount, and a list of line items with their codes, descriptions, and amounts. Also identify any potential coding errors or suspicious charges.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          providerName: { type: Type.STRING },
          dateOfService: { type: Type.STRING },
          totalAmount: { type: Type.NUMBER },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                potentialError: { type: Type.STRING },
              },
              required: ["description", "amount"],
            },
          },
          summary: { type: Type.STRING },
        },
        required: ["providerName", "totalAmount", "items"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const analyzeInsurancePolicy = async (base64Pdf: string): Promise<InsuranceAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Pdf,
            mimeType: "application/pdf",
          },
        },
        {
          text: "Analyze this insurance Summary of Benefits (SOB). Extract the plan name and key coverage details for common medical services (e.g., office visits, ER, surgery, lab tests).",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          planName: { type: Type.STRING },
          coverageDetails: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                coverage: { type: Type.STRING },
                notes: { type: Type.STRING },
              },
              required: ["category", "coverage"],
            },
          },
        },
        required: ["planName", "coverageDetails"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const detectConflicts = async (bill: BillAnalysis, policy: InsuranceAnalysis): Promise<ConflictResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Compare this medical bill analysis with the insurance policy coverage.
      Identify any discrepancies where the bill amount exceeds what the policy suggests should be covered.
      
      Bill Data: ${JSON.stringify(bill)}
      Policy Data: ${JSON.stringify(policy)}
      
      Return a list of conflicts and the total potential savings.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          conflicts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemDescription: { type: Type.STRING },
                billAmount: { type: Type.NUMBER },
                expectedAmount: { type: Type.NUMBER },
                reason: { type: Type.STRING },
                actionRecommended: { type: Type.STRING },
              },
              required: ["itemDescription", "billAmount", "expectedAmount", "reason", "actionRecommended"],
            },
          },
          savingsPotential: { type: Type.NUMBER },
        },
        required: ["conflicts", "savingsPotential"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const generateAppealLetter = async (conflict: any, bill: BillAnalysis, policy: InsuranceAnalysis): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Generate a professional, firm, and legally-toned health insurance appeal letter.
      The letter should be from the patient to their insurance provider or the hospital's billing department.
      
      Conflict to address: ${JSON.stringify(conflict)}
      Bill context: ${JSON.stringify(bill)}
      Policy context: ${JSON.stringify(policy)}
      
      Include placeholders for personal information like [Patient Name], [Policy Number], [Claim Number], etc.
    `,
  });

  return response.text;
};
