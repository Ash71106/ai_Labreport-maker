import React, { useState, useEffect } from 'react';
import { type AIOutputData, AITaskType, type VisualTraceStep } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AIOutputProps {
  data: AIOutputData;
  isLoading: boolean;
  error: string | null;
  activeTask: AITaskType | null;
}

type Tab = 'labNotes' | 'logicExplanation' | 'predictedOutput' | 'visualTrace';

const OutputDisplay: React.FC<{ content: string | null }> = ({ content }) => {
  if (content === null) {
    return <p className="text-gray-500 italic text-center py-10">AI output will appear here.</p>;
  }

  const formattedContent = content
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900/80 rounded-md p-4 my-4 text-sm text-gray-300 overflow-x-auto font-mono">$1</pre>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-purple-300">$1</strong>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');

  return (
    <div 
      className="prose prose-invert prose-sm max-w-none text-gray-300"
      dangerouslySetInnerHTML={{ __html: formattedContent.replace(/\n/g, '<br />') }}
    />
  );
};

const VisualTraceDisplay: React.FC<{ trace: VisualTraceStep[] | null }> = ({ trace }) => {
  if (trace === null) {
    return <p className="text-gray-500 italic text-center py-10">AI visual trace will appear here.</p>;
  }
  
  if (trace.length === 0) {
    return <p className="text-gray-500 italic text-center py-10">No trace could be generated for this code.</p>;
  }

  return (
    <div className="space-y-8">
      {trace.map((step) => (
        <div key={step.step} className="flex flex-col md:flex-row items-start gap-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="md:w-1/2 flex-shrink-0">
            <img src={step.imageUrl} alt={`Visual for step ${step.step}`} className="w-full h-auto rounded-md object-cover aspect-video bg-gray-800" />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-lg font-bold text-purple-300 mb-2">Step {step.step}</h3>
            <p className="text-gray-300 text-sm">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AIOutput: React.FC<AIOutputProps> = ({ data, isLoading, error, activeTask }) => {
  const [activeTab, setActiveTab] = useState<Tab>('labNotes');
  
  useEffect(() => {
    if (activeTask === AITaskType.LAB_NOTES) setActiveTab('labNotes');
    if (activeTask === AITaskType.EXPLAIN_LOGIC) setActiveTab('logicExplanation');
    if (activeTask === AITaskType.PREDICT_OUTPUT) setActiveTab('predictedOutput');
    if (activeTask === AITaskType.VISUALIZE_TRACE) setActiveTab('visualTrace');
  }, [activeTask]);

  const renderContent = () => {
    if (error) {
      return <div className="text-red-400 bg-red-900/30 p-4 rounded-md text-center">{error}</div>;
    }
    
    const taskForTab: Record<Tab, AITaskType> = {
      labNotes: AITaskType.LAB_NOTES,
      logicExplanation: AITaskType.EXPLAIN_LOGIC,
      predictedOutput: AITaskType.PREDICT_OUTPUT,
      visualTrace: AITaskType.VISUALIZE_TRACE
    };
    
    if (isLoading && activeTask === taskForTab[activeTab]) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
          <SpinnerIcon />
          <p className="mt-4 text-lg">Generating response...</p>
          {activeTask === AITaskType.VISUALIZE_TRACE && (
            <p className="mt-2 text-sm text-gray-500">Creating images, this may take a moment.</p>
          )}
        </div>
      );
    }
    
    switch (activeTab) {
      case 'visualTrace':
        return <VisualTraceDisplay trace={data.visualTrace} />;
      case 'labNotes':
        return <OutputDisplay content={data.labNotes} />;
      case 'logicExplanation':
        return <OutputDisplay content={data.logicExplanation} />;
      case 'predictedOutput':
        return <OutputDisplay content={data.predictedOutput} />;
      default:
        return null;
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'labNotes', label: 'Lab Notes' },
    { id: 'logicExplanation', label: 'Logic Explained' },
    { id: 'predictedOutput', label: 'Predicted Output' },
    { id: 'visualTrace', label: 'Visual Trace' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg border border-gray-700/50 shadow-lg">
      <div className="flex border-b border-gray-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-400'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-grow p-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
