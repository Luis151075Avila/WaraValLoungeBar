/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Safely retrieve API key if it exists, otherwise default to empty string
const getApiKey = (): string => {
  try {
    // Check if we are in an environment where process.env exists
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
    return '';
  } catch (e) {
    return '';
  }
};

const API_KEY = getApiKey();
let chatSession: Chat | null = null;

// Pre-defined responses for Demo Mode (when no API Key is present)
const MOCK_RESPONSES = [
  {
    keywords: ['ticket', 'price', 'cost', 'buy'],
    response: "Tickets are flying fast! 🎫 Day Pass: $149, Weekend: $349, Astral VIP: $899. Secure your spot in the void now."
  },
  {
    keywords: ['lineup', 'artist', 'who', 'playing', 'band'],
    response: "The sonic architects include Neon Void, Data Mosh, and Ether Real. 🎹 Prepare for audio deconstruction."
  },
  {
    keywords: ['where', 'location', 'place', 'city'],
    response: "We are manifesting in the Neon District, Tokyo. 🗼 Follow the signal to the coordinates provided on your ticket."
  },
  {
    keywords: ['time', 'when', 'date', 'schedule'],
    response: "The transmission begins Oct 24-26, 2025. 📅 Don't be late for the future."
  },
  {
    keywords: ['hello', 'hi', 'hey', 'start'],
    response: "System Online. ⚡️ I am LUMI. How can I guide your experience?"
  }
];

const getMockResponse = (message: string): string => {
  const lowerMsg = message.toLowerCase();
  const match = MOCK_RESPONSES.find(r => r.keywords.some(k => lowerMsg.includes(k)));
  
  return match 
    ? match.response 
    : "I'm receiving interference... 📡 Ask me about Tickets, Lineup, or the Experience.";
};

export const initializeChat = (): Chat | null => {
  // If no API Key, we don't initialize the real SDK
  if (!API_KEY) return null;

  if (chatSession) return chatSession;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are 'LUMI', the AI Concierge for Lumina Festival 2025. 
        The festival is in Tokyo, Neon District. Dates: Oct 24-26, 2025.
        
        Tone: High energy, cosmic, helpful, slightly mysterious. Use emojis like ⚡️, 🔮, 💿, 🌃, ✨.
        
        Key Info:
        - Headliners: Neon Void, Cyber Heart, The Glitch Mob (Fictional).
        - Genres: Synthwave, Techno, Hyperpop.
        - Tickets: standard ($150), VIP ($350), Astral Pass ($900).
        
        Keep responses short (under 50 words) and punchy. If asked about lineup, hype up the fictional artists.`,
      },
    });
    return chatSession;
  } catch (error) {
    console.warn("Failed to initialize GenAI, falling back to demo mode.");
    return null;
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  // 1. Mock Mode (Fallback)
  if (!API_KEY) {
    console.log("Demo Mode: Simulating AI response");
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockResponse(message);
  }

  // 2. Real API Mode
  try {
    const chat = initializeChat();
    
    // Double safety check if initialization failed
    if (!chat) {
       await new Promise(resolve => setTimeout(resolve, 1000));
       return getMockResponse(message);
    }

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Transmission interrupted.";
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback to mock response on API error
    return getMockResponse(message);
  }
};