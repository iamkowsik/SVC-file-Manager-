import { GoogleGenAI } from "@google/genai";
import { StudentRecord } from "../types";

// Initialize the client. 
// Note: In a production app, never expose API keys on the client side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a summary/recommendation letter draft based on the student's uploaded documents.
 */
export const generateStudentSummary = async (student: StudentRecord): Promise<string> => {
  try {
    const internshipNames = student.internshipFiles.map(f => f.name).join(", ");
    const participationNames = student.participationFiles.map(f => f.name).join(", ");

    const prompt = `
      You are an academic assistant helping a teacher review a student's portfolio.
      
      Student Name: ${student.name}
      Uploaded Internship Documents: ${internshipNames || "None"}
      Uploaded Participation Certificates: ${participationNames || "None"}

      Please write a concise, professional summary (max 100 words) evaluating this student's extracurricular engagement based on these file titles. 
      If no files are uploaded, politely state that the portfolio is empty.
      Highlight the diversity of their activities if applicable.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster simple summary
      }
    });

    return response.text || "Unable to generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "AI Service Unavailable: Could not generate summary at this time.";
  }
};
