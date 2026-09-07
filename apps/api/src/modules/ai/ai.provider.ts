import { env } from '../../config/env';

export interface GeneratedQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  competencyId?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface AssessmentGenerationRequest {
  roleTitle: string;
  departmentName: string;
  competencies: { id: string; name: string; requiredScore: number }[];
  questionCount?: number;
}

export interface AIProvider {
  generateRoleAssessment(req: AssessmentGenerationRequest): Promise<GeneratedQuestion[]>;
}

export class GeminiAIProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  }

  async generateRoleAssessment(req: AssessmentGenerationRequest): Promise<GeneratedQuestion[]> {
    const totalQuestions = Math.max(3, Math.min(10, req.questionCount || 5));
    const compList = req.competencies.map((c) => `- ${c.name} (Benchmark: ${c.requiredScore}%)`).join('\n');

    const prompt = `You are the lead assessment psychometrician and AI skill evaluator for the Ministry of Statistics & Programme Implementation (MoSPI), Government of India.

ROLE DETAILS:
Department: ${req.departmentName}
Designation / Job Role: ${req.roleTitle}

REQUIRED ROLE COMPETENCIES:
${compList}

TASK:
Generate exactly ${totalQuestions} rigorous, multiple-choice diagnostic questions to evaluate an employee's proficiency in these specific role competencies.

CRITICAL INSTRUCTIONS:
1. Every question must have:
   - "prompt": clear technical or official statistics scenario
   - "options": an array of exactly 4 distinct choices
   - "correctIndex": integer 0, 1, 2, or 3 representing the index of the correct answer
   - "explanation": concise explanation (1-2 sentences) of why the answer is correct
   - "competencyName": name of the competency tested (must match one of the listed competencies)
   - "difficulty": "BEGINNER", "INTERMEDIATE", or "ADVANCED"
2. DO NOT output conversational text, markdown fences, or commentary.
3. Return ONLY a valid JSON array of question objects.`;

    // Attempt Gemini call if API key exists
    if (this.apiKey && this.apiKey.length > 10) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.3,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (response.ok) {
          const resData: any = await response.json();
          const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
            const validated = this.validateAndNormalizeQuestions(questions, req.competencies);
            if (validated.length >= 3) {
              return validated;
            }
          }
        }
      } catch (err: any) {
        console.warn('[GeminiAIProvider] AI call failed, using deterministic fallback:', err?.message || err);
      }
    }

    // Deterministic fallback matching the specific role & competencies
    return this.getFallbackQuestions(req.roleTitle, req.competencies, totalQuestions);
  }

  private validateAndNormalizeQuestions(
    rawQuestions: any[],
    competencies: { id: string; name: string }[]
  ): GeneratedQuestion[] {
    const compMap = new Map(competencies.map((c) => [c.name.toLowerCase().trim(), c.id]));
    const defaultCompId = competencies[0]?.id;

    const validated: GeneratedQuestion[] = [];
    for (const q of rawQuestions) {
      if (!q.prompt || !Array.isArray(q.options) || q.options.length < 4) continue;
      const correctIdx = typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0;
      
      let matchedCompId = defaultCompId;
      if (q.competencyName) {
        const key = String(q.competencyName).toLowerCase().trim();
        for (const [name, id] of compMap.entries()) {
          if (key.includes(name) || name.includes(key)) {
            matchedCompId = id;
            break;
          }
        }
      }

      validated.push({
        prompt: String(q.prompt).trim(),
        options: q.options.slice(0, 4).map((opt: any) => String(opt).trim()),
        correctIndex: correctIdx,
        explanation: String(q.explanation || 'Verified correct answer based on domain benchmark.').trim(),
        competencyId: matchedCompId,
        difficulty: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(q.difficulty) ? q.difficulty : 'INTERMEDIATE',
      });
    }

    return validated;
  }

  private getFallbackQuestions(
    roleTitle: string,
    competencies: { id: string; name: string }[],
    count: number
  ): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const comp = competencies[i % competencies.length] || { id: 'c0', name: 'Statistical Methodology' };
      questions.push({
        prompt: `In the context of ${comp.name} for the ${roleTitle} role, what is the primary operational standard recommended?`,
        options: [
          `Execute standardized validation protocols with documented sampling variance`,
          `Rely solely on secondary subjective heuristics`,
          `Bypass verification checks to expedite processing cycles`,
          `Omit outlier diagnostics from summary tabulations`,
        ],
        correctIndex: 0,
        explanation: `Standardized validation protocols and variance estimation are mandatory standards for ${comp.name}.`,
        competencyId: comp.id,
        difficulty: 'INTERMEDIATE',
      });
    }
    return questions;
  }
}

export const aiProvider = new GeminiAIProvider();
