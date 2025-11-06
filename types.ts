export interface VisualTraceStep {
  step: number;
  description: string;
  imageUrl: string;
}

export interface AIOutputData {
  labNotes: string | null;
  logicExplanation: string | null;
  predictedOutput: string | null;
  visualTrace: VisualTraceStep[] | null;
}

export enum AITaskType {
  LAB_NOTES = 'LAB_NOTES',
  EXPLAIN_LOGIC = 'EXPLAIN_LOGIC',
  PREDICT_OUTPUT = 'PREDICT_OUTPUT',
  VISUALIZE_TRACE = 'VISUALIZE_TRACE',
}
