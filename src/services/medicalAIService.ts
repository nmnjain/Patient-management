import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabase';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

interface ProcessedMedicalData {
  summary: string;
  recordId: string;
  patientId: string;
}

interface ProfileData {
  name: string;
  blood_group: string | null;
  date_of_birth: string | null;
  gender: string | null;
  allergies: string[] | null;
  medical_history: string | null;
  current_medications: string | null;
  chronic_conditions: string | null;
  vaccination_status: string | null;
}

class MedicalAIService {
  private genAI: any;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }

  async processMedicalRecord(text: string, recordId: string, patientId: string): Promise<ProcessedMedicalData> {
    try {
      await this.checkAndCreateInitialSummary(patientId);
      const dateFromText = this.extractDateFromText(text);
      
      const prompt = `
        Analyze this medical record text and extract ONLY the most important clinical information.
        
        Focus exclusively on:
        - Key diagnoses/conditions
        - Critical test results and their values
        - Important medications
        - Significant findings
        
        Format rules:
        1. Create a single coherent sentence or very short paragraph (2-3 lines max)
        2. Use medical terminology but be concise and clear
        3. Omit phrases like "No significant findings" or "No other significant findings"
        4. If there truly is nothing significant to report, just write the test name and "negative" or "normal"
        5. Do NOT add any commentary or interpretation
        6. Include only clinically significant information
        
        Medical Record Text:
        ${text}
      `;

      const result = await this.model.generateContent(prompt);
      let summary = result.response.text().trim();
      summary = summary.replace(/\bNo (other )?(significant )?findings\.?\s*$/i, '');
      summary = summary.replace(/\.\s*$/, ''); 
      summary = summary.trim();
      
      if (!summary) {
        summary = "Test performed with no clinically significant results";
      }
      if (dateFromText) {
        await this.updateDatabase(summary, recordId, patientId, dateFromText);
      } else {
        await this.updateDatabaseWithoutDate(summary, recordId, patientId);
      }

      return {
        summary,
        recordId,
        patientId
      };
    } catch (error) {
      throw error;
    }
  }

  private extractDateFromText(text: string): string | null {
    const datePatterns = [
      /(?:REGISTERED|COLLECTED|REPORTED|DATE)[\s:]+(\d{1,2}[-/]\w{3}[-/]\d{4})/gi, 
      /(?:REGISTERED|COLLECTED|REPORTED|DATE)[\s:]+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/gi, 
      
      /\b(\d{1,2}[-/]\w{3}[-/]\d{4})\b/g, 
      /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/g,
      /\b(\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/g, 
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g 
    ];

    for (const pattern of datePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches && matches.length > 0) {
        let dateText = '';
        
        if (matches[0][1]) {
          dateText = matches[0][1];
        } else {
          dateText = matches[0][0];
        }
        
        if (/\d{1,2}[-/]\w{3}[-/]\d{4}/i.test(dateText)) {
          const parts = dateText.split(/[-/]/);
          const months = {
            'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
            'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
          };
          
          const day = parts[0].padStart(2, '0');
          const month = months[parts[1].toLowerCase().substring(0, 3)];
          const year = parts[2];
          
          if (month) {
            return `${year}-${month}-${day}`;
          }
        }
        
        try {
          const date = new Date(dateText);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    return null;
  }

  private async checkAndCreateInitialSummary(patientId: string) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('medical_summary, name, blood_group, date_of_birth, gender, allergies, medical_history, current_medications, chronic_conditions, vaccination_status')
        .eq('id', patientId)
        .single();

      if (!profileData?.medical_summary) {
        await this.createInitialSummary(patientId, profileData as unknown as ProfileData);
      }
    } catch (error) {
      throw error;
    }
  }

  private async createInitialSummary(patientId: string, profileData: ProfileData) {
    try {
      const profileSummaryPrompt = `
        Create a concise 2-3 line medical summary paragraph based on the following patient information:
        
        Name: ${profileData.name || 'Not provided'}
        Blood Group: ${profileData.blood_group || 'Not provided'}
        Date of Birth: ${profileData.date_of_birth || 'Not provided'}
        Gender: ${profileData.gender || 'Not provided'}
        Allergies: ${profileData.allergies ? profileData.allergies.join(', ') : 'None reported'}
        Medical History: ${profileData.medical_history || 'None reported'}
        Current Medications: ${profileData.current_medications || 'None reported'}
        Chronic Conditions: ${profileData.chronic_conditions || 'None reported'}
        Vaccination Status: ${profileData.vaccination_status || 'Not provided'}
        
        Format rules:
        1. Create a cohesive, brief paragraph focusing only on clinically relevant information
        2. Use concise medical terminology
        3. If there is no significant medical information, simply state "No significant medical history"
        4. Do not include phrases like "Initial Profile Summary:"
      `;

      const result = await this.model.generateContent(profileSummaryPrompt);
      const initialSummary = result.response.text().trim();
      
      const dateStr = new Date().toISOString().split('T')[0];
      const formattedInitialSummary = `[${dateStr}] ${initialSummary}`;
      
      const { error } = await supabase
        .from('profiles')
        .update({ medical_summary: formattedInitialSummary })
        .eq('id', patientId);
      
      if (error) throw error;
      
    } catch (error) {
      throw error;
    }
  }

  private async updateDatabase(newSummary: string, recordId: string, patientId: string, dateStr: string) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('medical_summary')
        .eq('id', patientId)
        .single();

      const formattedNewSummary = `[${dateStr}] ${newSummary}`;

      let finalSummary = '';
      if (profileData?.medical_summary) {
        const existingEntries = profileData.medical_summary
          .split(/\n(?=\[\d{4}-\d{2}-\d{2}\])/g)
          .filter(entry => entry.trim());

        existingEntries.unshift(formattedNewSummary);

        const latestEntries = existingEntries.slice(0, 10);

        finalSummary = latestEntries.join('\n\n');
      } else {
        finalSummary = formattedNewSummary;
      }

      await supabase.rpc('update_medical_summary', {
        p_patient_id: patientId,
        p_record_id: recordId,
        p_summary: finalSummary
      });

    } catch (error) {
      throw error;
    }
  }

  private async updateDatabaseWithoutDate(newSummary: string, recordId: string, patientId: string) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('medical_summary')
        .eq('id', patientId)
        .single();
      const formattedNewSummary = newSummary;

      let finalSummary = '';
      if (profileData?.medical_summary) {
        const existingEntries = profileData.medical_summary
          .split(/\n(?=\[\d{4}-\d{2}-\d{2}\]|\w)/g)
          .filter(entry => entry.trim());

        existingEntries.unshift(formattedNewSummary);
        const latestEntries = existingEntries.slice(0, 10);

        finalSummary = latestEntries.join('\n\n');
      } else {
        finalSummary = formattedNewSummary;
      }

      await supabase.rpc('update_medical_summary', {
        p_patient_id: patientId,
        p_record_id: recordId,
        p_summary: finalSummary
      });

    } catch (error) {
      throw error;
    }
  }
}

export const medicalAI = new MedicalAIService();