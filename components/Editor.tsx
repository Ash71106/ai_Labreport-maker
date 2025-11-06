import React from 'react';
import { AITaskType } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { PlayIcon } from './icons/PlayIcon';
import { EyeIcon } from './icons/EyeIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface EditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRunAI: (task: AITaskType) => void;
  isLoading: boolean;
  activeTask: AITaskType | null;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, onRunAI, isLoading, activeTask }) => {
  const commonButtonClasses = "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";
  const buttonIdleClasses = "bg-gray-700 text-gray-200 hover:bg-gray-600";
  const buttonActiveClasses = "bg-purple-600 text-white";

  const getButtonClasses = (task: AITaskType) => {
    return `${commonButtonClasses} ${isLoading ? (activeTask === task ? buttonActiveClasses : 'bg-gray-800 text-gray-500') : buttonIdleClasses}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 shadow-lg">
      <div className="flex-grow p-1">
        <textarea
          value={value}
          onChange={onChange}
          placeholder="Paste your code here and let the magic happen..."
          className="w-full h-full bg-transparent text-gray-300 resize-none focus:outline-none font-mono text-sm p-4"
          style={{ minHeight: '400px' }}
        />
      </div>
      <div className="bg-gray-900/50 p-3 border-t border-gray-700/50 flex flex-wrap justify-center sm:justify-end gap-3">
        <button
          onClick={() => onRunAI(AITaskType.LAB_NOTES)}
          disabled={isLoading}
          className={getButtonClasses(AITaskType.LAB_NOTES)}
        >
          {isLoading && activeTask === AITaskType.LAB_NOTES ? <SpinnerIcon /> : <DocumentIcon />}
          <span>Generate Lab Notes</span>
        </button>
        <button
          onClick={() => onRunAI(AITaskType.EXPLAIN_LOGIC)}
          disabled={isLoading}
          className={getButtonClasses(AITaskType.EXPLAIN_LOGIC)}
        >
          {isLoading && activeTask === AITaskType.EXPLAIN_LOGIC ? <SpinnerIcon /> : <LightbulbIcon />}
          <span>Explain Logic</span>
        </button>
        <button
          onClick={() => onRunAI(AITaskType.PREDICT_OUTPUT)}
          disabled={isLoading}
          className={getButtonClasses(AITaskType.PREDICT_OUTPUT)}
        >
          {isLoading && activeTask === AITaskType.PREDICT_OUTPUT ? <SpinnerIcon /> : <PlayIcon />}
          <span>Predict Output</span>
        </button>
        <button
          onClick={() => onRunAI(AITaskType.VISUALIZE_TRACE)}
          disabled={isLoading}
          className={getButtonClasses(AITaskType.VISUALIZE_TRACE)}
        >
          {isLoading && activeTask === AITaskType.VISUALIZE_TRACE ? <SpinnerIcon /> : <EyeIcon />}
          <span>Visualize Trace</span>
        </button>
      </div>
    </div>
  );
};
