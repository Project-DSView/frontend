interface DataStructure {
  name: string;
  description: string;
  iconName: string;
  iconColor: string;
}

interface LearningTip {
  title: string;
  description: string;
}

interface TutorialStep {
  image: string;
  alt: string;
  stepNumber: string;
  description: string;
}

interface PlaygroundMode {
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  steps: TutorialStep[];
}

interface TutorialSection {
  title: string;
  description: string;
  image: string;
  alt: string;
}

interface ImageModalProps {
  selectedImage: string | null;
  onClose: () => void;
}

interface PlaygroundModeCardProps {
  mode: PlaygroundMode;
  onImageClick: (imageSrc: string) => void;
}

interface TutorialStepProps {
  step: TutorialStep;
  hoverColor: string;
  onImageClick: (imageSrc: string) => void;
}

interface LearningTipCardProps {
  tip: LearningTip;
}

interface DataStructureCardProps {
  structure: DataStructure;
}

export type {
  DataStructure,
  LearningTip,
  TutorialStep,
  PlaygroundMode,
  TutorialSection,
  ImageModalProps,
  PlaygroundModeCardProps,
  TutorialStepProps,
  LearningTipCardProps,
  DataStructureCardProps,
};
