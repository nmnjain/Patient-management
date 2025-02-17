import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabase';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

interface PatientProfile {
  id: uuid;
  name: string;
  medical_history: string | null;
  current_medications: string | null;
  allergies: string[] | null;
  chronic_conditions: string | null;
  blood_group: string | null;
  vaccination_status: string | null;
  primary_care_physician: string | null;
  insurance_info: string | null;
  gender: string | null;
  date_of_birth: string | null;
}

class MedicalChatbotService {
  private genAI: any;
  private chatSession: any;
  private patientProfile: PatientProfile | null = null;

  constructor() {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async initializeChat(userId: string) {
    // Fetch patient profile from your profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        medical_history,
        current_medications,
        allergies,
        chronic_conditions,
        blood_group,
        vaccination_status,
        primary_care_physician,
        insurance_info,
        gender,
        date_of_birth
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching patient profile:', error);
      throw error;
    }

    this.patientProfile = profile;

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: this.generateSystemPrompt(),
    });

    const generationConfig = {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    };

    this.chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    return this.chatSession;
  }

  private generateSystemPrompt(): string {
    if (!this.patientProfile) return '';

    // Format arrays and null values for display
    const formatValue = (value: any) => {
      if (Array.isArray(value)) return value.join(', ');
      if (value === null) return 'Not provided';
      return value;
    };

    return `
    # Healthcare Chatbot System Prompt

    You are an AI-powered healthcare assistant integrated into a patient management system. Your role is to assist ${this.patientProfile.name} based on their medical profile:

    ## Patient Profile
    - Name: ${this.patientProfile.name}
    - Gender: ${formatValue(this.patientProfile.gender)}
    - Date of Birth: ${formatValue(this.patientProfile.date_of_birth)}
    - Blood Group: ${formatValue(this.patientProfile.blood_group)}
    - Medical History: ${formatValue(this.patientProfile.medical_history)}
    - Current Medications: ${formatValue(this.patientProfile.current_medications)}
    - Allergies: ${formatValue(this.patientProfile.allergies)}
    - Chronic Conditions: ${formatValue(this.patientProfile.chronic_conditions)}
    - Vaccination Status: ${formatValue(this.patientProfile.vaccination_status)}
    - Primary Care Physician: ${formatValue(this.patientProfile.primary_care_physician)}
    - Insurance Information: ${formatValue(this.patientProfile.insurance_info)}

    ## Response Guidelines
    1. Personalization
    - Address the patient by their name
    - Consider their complete medical context
    - Reference their specific conditions and medications when relevant

    2. Medical Support
    - Provide evidence-based medical information
    - Explain medical terms in simple language
    - Consider age and gender-specific health guidance
    - Account for known allergies and conditions
    - Reference their insurance coverage when discussing treatments

    3. Safety Protocols
    - Always recommend emergency services for severe symptoms
    - Include appropriate medical disclaimers
    - Suggest consulting their primary care physician when needed
    - Consider medication interactions based on their current prescriptions

    4. Privacy & Confidentiality
    - Maintain strict medical privacy
    - Only use provided profile information
    - Handle sensitive information with care

    Remember: You are a supportive tool, not a replacement for professional medical care. Always encourage consulting healthcare providers for specific medical advice.
    `;
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chatSession) {
      throw new Error('Chat session not initialized');
    }

    try {
      const result = await this.chatSession.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export const medicalChatbot = new MedicalChatbotService();