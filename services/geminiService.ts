import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { VisualTraceStep } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateLabNotes(code: string): Promise<string> {
  const prompt = `
    You are an expert computer science professor creating a lab report. 
    Based on the following code, generate detailed and professional lab notes. 
    The notes should cover the following sections:
    - **Objective:** What is the primary goal of this code?
    - **Methodology:** Describe the approach, algorithms, and data structures used.
    - **Code Analysis:** A walkthrough of the code's key parts.
    - **Observations:** Any potential issues, optimizations, or interesting aspects.
    - **Conclusion:** A summary of what the code accomplishes.
    
    Format the output in clean markdown.

    Code:
    \`\`\`
    ${code}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating lab notes:", error);
    throw new Error("Failed to generate lab notes. Please check the console for details.");
  }
}

export async function explainLogic(code: string): Promise<string> {
  const prompt = `
    You are a friendly and encouraging coding tutor. 
    Explain the logic of the following code in the simplest way possible, as if you were explaining it to a complete beginner. 
    Break it down step-by-step. Use simple analogies where helpful. Avoid complex jargon.

    Code:
    \`\`\`
    ${code}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error explaining logic:", error);
    throw new Error("Failed to explain logic. Please check the console for details.");
  }
}

export async function predictOutput(code: string): Promise<string> {
  const prompt = `
    You are a precise code execution engine. Analyze the following code and provide its exact output.
    - If the code runs successfully, show only the final output.
    - If the code would result in an error, describe the error.
    - If the code requires user input to run, state that and explain what input is needed.
    
    Wrap the final output in a markdown code block.

    Code:
    \`\`\`
    ${code}
    \`\`\`
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error predicting output:", error);
    throw new Error("Failed to predict output. Please check the console for details.");
  }
}

export async function visualizeTrace(code: string): Promise<VisualTraceStep[]> {
  const tracePrompt = `
    Analyze the following code and break it down into a step-by-step execution trace. 
    For each step, provide a concise, simple description of what is happening. 
    Focus on variable assignments, function calls, loops, and conditional logic.
    Do not generate more than 5 steps. Keep it high level.

    Code:
    \`\`\`
    ${code}
    \`\`\`
  `;
  
  const traceSchema = {
    type: Type.OBJECT,
    properties: {
      trace: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: 'A simple explanation of this step of code execution.',
            },
          },
          required: ['description'],
        },
      },
    },
    required: ['trace'],
  };

  let traceSteps: { description: string }[];
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: tracePrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: traceSchema,
        }
    });

    const jsonResponse = JSON.parse(response.text);
    traceSteps = jsonResponse.trace;
    
    if (!traceSteps || traceSteps.length === 0) {
      return [];
    }
  } catch (error) {
    console.error("Error generating visual trace steps:", error);
    throw new Error("Failed to generate code trace. The code might be too complex or contain errors.");
  }

  const imageGenerationPromises = traceSteps.map(async (step) => {
    const imagePrompt = `
      Create a simple, clear, and illustrative image that visually represents this programming concept for a beginner. 
      Use a clean, modern, diagrammatic style. Think of it as a slide in a presentation or a clear whiteboard drawing.
      Concept to illustrate: "${step.description}"
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: imagePrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        const part = response.candidates[0].content.parts[0];
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error('No image data returned from API.');
    } catch (error) {
        console.error(`Error generating image for step "${step.description}":`, error);
        return 'https://via.placeholder.com/512x288.png?text=Image+Generation+Failed';
    }
  });

  const imageUrls = await Promise.all(imageGenerationPromises);

  return traceSteps.map((step, index) => ({
    step: index + 1,
    description: step.description,
    imageUrl: imageUrls[index],
  }));
}
