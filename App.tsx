import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { AIOutput } from './components/AIOutput';
import { generateLabNotes, explainLogic, predictOutput, visualizeTrace } from './services/geminiService';
import { AITaskType, type AIOutputData } from './types';


export default function App() {
  const [code, setCode] = useState<string>('');
  const [aiOutput, setAiOutput] = useState<AIOutputData>({
    labNotes: null,
    logicExplanation: null,
    predictedOutput: null,
    visualTrace: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTask, setActiveTask] = useState<AITaskType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAI = useCallback(async (task: AITaskType) => {
    if (!code.trim()) {
      setError("Please enter some code first.");
      return;
    }
    setIsLoading(true);
    setActiveTask(task);
    setError(null);

    try {
      switch (task) {
        case AITaskType.LAB_NOTES:
          const labNotesResult = await generateLabNotes(code);
          setAiOutput(prev => ({ ...prev, labNotes: labNotesResult }));
          break;
        case AITaskType.EXPLAIN_LOGIC:
          const logicResult = await explainLogic(code);
          setAiOutput(prev => ({ ...prev, logicExplanation: logicResult }));
          break;
        case AITaskType.PREDICT_OUTPUT:
          const outputResult = await predictOutput(code);
          setAiOutput(prev => ({ ...prev, predictedOutput: outputResult }));
          break;
        case AITaskType.VISUALIZE_TRACE:
          const traceResult = await visualizeTrace(code);
          setAiOutput(prev => ({ ...prev, visualTrace: traceResult }));
          break;
        default:
          throw new Error("Unknown AI task");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setActiveTask(null);
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2 flex flex-col">
          <Editor 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onRunAI={handleRunAI}
            isLoading={isLoading}
            activeTask={activeTask}
          />
        </div>
        <div className="lg:w-1/2 flex flex-col">
          <AIOutput 
            data={aiOutput}
            isLoading={isLoading}
            error={error}
            activeTask={activeTask}
          />
        </div>
      </main>
    </div>
  );
}
