import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Code } from 'lucide-react';
import {
  Course,
  UserProfile,
  Material,
  PDFSubmission,
  SubmissionResponse,
  QueueJob,
  QueueJobStatus,
  CourseEnrollmentsResponse,
  Announcement,
  CoursePDFSubmission,
  TestCaseResult,
} from '../services/services.types';
import {
  OperationCategory,
  DragComponent,
  DataStructureStats,
  Operation as DragDropOperation,
} from '../dragdrop/common.types';
import { SinglyLinkedListDragComponent } from '../dragdrop/SinglyLinkedList.types';
import { DoublyLinkedListDragComponent } from '../dragdrop/DoublyLinkedList.types';
import { StackDragComponent } from '../dragdrop/Stack.types';
import { QueueDragComponent } from '../dragdrop/Queue.types';
import { UndirectedGraphNode, UndirectedGraphEdge } from '../dragdrop/UndirectedGraph.types';
import { DirectedGraphNode, DirectedGraphEdge } from '../dragdrop/DirectedGraph.types';
import { StepthroughStep, ComplexityAnalysis } from '../stepthrough/common.types';

// ============================================================================
// Button Props
// ============================================================================
interface CopyAndExportButtonProps {
  code: string;
  disabled?: boolean;
}

interface ExportPNGButtonProps {
  visualizationRef: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
}

interface FileUploadButtonProps {
  onFileLoad: (content: string, filename: string) => void;
  disabled?: boolean;
}

// ============================================================================
// Card Props
// ============================================================================
interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string, enrollKey: string) => void;
  isEnrolling?: boolean;
  isEnrolled?: boolean;
  onEnterCourse?: (courseId: string) => void;
  onArchive?: (courseId: string) => void;
  isArchiving?: boolean;
  onEdit?: (course: Course) => void;
  userProfile?: UserProfile | null;
}

interface CourseCardWithEnrollmentProps {
  course: Course;
  onEnroll: (courseId: string, enrollKey: string) => void;
  isEnrolling: boolean;
  onEnterCourse: (courseId: string) => void;
  onArchive?: (courseId: string) => void;
  isArchiving?: boolean;
  onEdit?: (course: Course) => void;
  accessToken: string | null;
  userProfile?: UserProfile | null;
}

interface MaterialCardProps {
  material: Material;
}

interface ExerciseProblemCardProps {
  material: Material;
  isExpired: boolean;
  isGraded: boolean;
}

interface PDFSubmissionCardProps {
  materialId: string;
  accessToken: string;
  isExpired: boolean;
  isGraded: boolean;
}

interface SubmittedPDFCardProps {
  submission: PDFSubmission;
  accessToken: string;
  material?: Material;
}

interface TestCaseResultCardProps {
  results?: TestCaseResult[];
  passedCount?: number;
  failedCount?: number;
}

interface QueueStatusCardProps {
  queueJob?: QueueJob | null;
  status?: QueueJobStatus;
  labRoom?: string;
  tableNumber?: string;
  claimedByName?: string;
  reviewComment?: string;
  reviewStatus?: 'approved' | 'rejected';
  reviewedAt?: string;
}

interface QueueJobCardProps {
  job: QueueJob;
  onClaim?: (jobId: string) => void;
  onReview?: (jobId: string) => void;
  isClaiming?: boolean;
  isReviewing?: boolean;
  canClaim?: boolean;
  canReview?: boolean;
}

interface TACommentCardProps {
  comment: string;
  status: 'approved' | 'rejected';
  reviewedAt: string;
  reviewedByName: string;
}

interface PlaygroundModeCardProps {
  mode: PlaygroundMode;
  onImageClick: (imageSrc: string) => void;
}

interface LearningTipCardProps {
  tip: LearningTip;
}

interface DataStructureCardProps {
  structure: DataStructure;
}

interface FeatureCardProps {
  feature: {
    iconSrc: string;
    iconAlt: string;
    title: string;
    desc: string;
    priority?: boolean;
  };
  index: number;
}

// ============================================================================
// Table Props
// ============================================================================
interface GradingTableProps {
  submissions: CoursePDFSubmission[];
  isLoading: boolean;
  courseId: string;
  accessToken: string | null;
}

interface QueueTableProps {
  jobs: QueueJob[];
  isLoading?: boolean;
  canManage?: boolean;
  token: string | null;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
  queuePositionMap?: Map<string, number>;
}

// ============================================================================
// Dialog Props
// ============================================================================
interface GradingDialogProps {
  submission: CoursePDFSubmission;
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  accessToken: string | null;
  totalPoints?: number;
}

interface ReviewScoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  token: string | null;
  onSuccess?: () => void;
}

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { status: 'approved' | 'rejected'; comment: string }) => void;
  isLoading?: boolean;
  job?: QueueJob | null;
}

interface RequestApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { lab_room: string; table_number: string }) => void;
  isLoading?: boolean;
}

interface ImageDialogProps {
  selectedImage: string | null;
  onClose: () => void;
}

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playgroundMode: 'dragdrop' | 'stepthrough' | 'realtime';
}

// ============================================================================
// UI Component Props (Badge, Dropdown, Popover, Chart)
// ============================================================================
interface ApprovalStatusBadgeProps {
  status: QueueJobStatus | 'waiting_approval' | 'not_started';
  className?: string;
}

interface OperationCategoryDropdownProps {
  categories: { key: OperationCategory; title: string; color: string }[];
  selectedCategory: OperationCategory | null;
  onCategorySelect: (category: OperationCategory | null) => void;
}

interface EnrollmentPopoverProps {
  courseId: string;
  courseName: string;
  onEnroll?: (courseId: string, enrollKey: string) => void;
  isEnrolling?: boolean;
}

interface ProgressChartProps {
  completedCount: number;
  totalCount: number;
}

// ============================================================================
// Editor Props
// ============================================================================
interface CodeEditorProps {
  code: string;
  currentLine?: number;
  title?: string;
  maxHeight?: string;
}

interface ExerciseEditorCardProps {
  code: string;
  onCodeChange: (code: string) => void;
  isExpired: boolean;
  isGraded: boolean;
  submission?: SubmissionResponse | null;
  materialId?: string;
  token?: string | null;
  material?: Material;
}

// ============================================================================
// List Props
// ============================================================================
interface QueueJobListProps {
  jobs: QueueJob[];
  isLoading?: boolean;
  onClaim?: (jobId: string) => void;
  onReview?: (jobId: string) => void;
  filters?: {
    status?: QueueJobStatus;
    courseId?: string;
  };
}

interface MembersListProps {
  enrollmentsData: CourseEnrollmentsResponse | null | undefined;
  isLoading: boolean;
  error: Error | null;
  isTeacher?: boolean;
  courseId?: string;
  accessToken?: string | null;
}

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  overscan?: number;
  className?: string;
}

// ============================================================================
// Menu Props
// ============================================================================
type SubItem = {
  href: string;
  label: string;
};

type MenuItem = {
  href: string | null;
  label: string;
  hasSubItems: boolean;
  subItems?: SubItem[];
};

type PlaygroundItem = {
  title: string;
  description: string;
  items?: MenuItem[];
  href?: string;
};

interface SubMenuItemProps {
  title: string;
  description: string;
  items?: PlaygroundItem['items'];
}

interface NestedSubMenuItemProps {
  item: MenuItem;
}

// ============================================================================
// Step Selector Props
// ============================================================================
interface StepSelectorProps {
  operations: DragDropOperation[];
  selectedStep: number | null;
  onStepSelect: (stepIndex: number) => void;
  getStepDescription: (operation: DragDropOperation) => string;
  onPrevious?: () => void;
  onNext?: () => void;
  onAutoPlay?: () => void;
  isAutoPlaying?: boolean;
}

// ============================================================================
// Showcase Props
// ============================================================================
interface CTASectionProps {
  onGetStarted?: () => void;
}

interface Structure {
  id: string;
  name: string;
  icon: typeof Code;
  description: string;
  preview: string;
  color: string;
}

// ============================================================================
// Landing Props
// ============================================================================
interface VisualizationMode {
  id: string;
  title: string;
  icon: LucideIcon;
  images: string[];
}

// ============================================================================
// Tutorial Props
// ============================================================================
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
  title: string;
  description: string;
  image?: string;
  highlightSelector?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  disableNextUntilVisible?: boolean;
  customContent?: 'naming-guide';
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  storageKey: string;
}

// Tutorial step for PlaygroundMode (with image and alt for display in cards)
interface PlaygroundTutorialStep {
  image: string;
  alt: string;
  description: string;
}

interface PlaygroundMode {
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  steps: PlaygroundTutorialStep[];
}

interface TutorialSection {
  title: string;
  description: string;
  image: string;
  alt: string;
}

interface TutorialStepProps {
  step: PlaygroundTutorialStep;
  hoverColor: string;
  onImageClick: (imageSrc: string) => void;
}

type PlaygroundModeType = 'dragdrop' | 'stepthrough' | 'realtime';

// ============================================================================
// Section Props
// ============================================================================
interface MaterialsByWeekProps {
  materials: Material[];
  userProfile?: UserProfile | null;
}

interface LatestAnnouncementProps {
  announcements: Announcement[];
}

// ============================================================================
// DragDrop Props
// ============================================================================
interface OperationCardProps {
  component: DragComponent;
  onDragStart: (e: React.DragEvent, component: DragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: DragComponent) => void;
  description?: string;
}

interface VisualizationProps {
  nodes: string[];
  stats: DataStructureStats;
  isRunning?: boolean;
  title?: string;
  renderNode?: (value: string, index: number) => React.ReactNode;
}

interface SinglyLinkedListOperationsProps {
  dragComponents: SinglyLinkedListDragComponent[];
  onDragStart: (e: React.DragEvent, component: SinglyLinkedListDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: SinglyLinkedListDragComponent) => void;
}

interface SinglyLinkedListVisualizationProps {
  nodes: string[];
  stats: DataStructureStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
  currentPosition?: number;
  selectedStep?: number | null;
  currentOperationData?: {
    type: string;
    value?: string | null;
    position?: string | null;
    newValue?: string | null;
  };
}

interface DoublyLinkedListOperationsProps {
  dragComponents: DoublyLinkedListDragComponent[];
  onDragStart: (e: React.DragEvent, component: DoublyLinkedListDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: DoublyLinkedListDragComponent) => void;
}

interface DoublyLinkedListVisualizationProps {
  nodes: string[];
  stats: DataStructureStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
  currentPosition?: number;
  selectedStep?: number | null;
  currentOperationData?: {
    type: string;
    value?: string | null;
    position?: string | null;
    newValue?: string | null;
  };
}

interface StackOperationsProps {
  dragComponents: StackDragComponent[];
  onDragStart: (e: React.DragEvent, component: StackDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: StackDragComponent) => void;
}

interface StackVisualizationProps {
  elements: string[];
  stats: DataStructureStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
  stacks?: {
    s1: string[];
    s2: string[];
  };
  mainStack?: string[];
  stackS1?: string[];
  stackS2?: string[];
}

interface QueueOperationsProps {
  dragComponents: QueueDragComponent[];
  onDragStart?: (e: React.DragEvent, component: QueueDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: QueueDragComponent) => void;
}

interface QueueVisualizationProps {
  dequeuedElement?: string | null;
  elements: string[];
  stats: DataStructureStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
}

interface DragDropZoneProps {
  operations: DragDropOperation[];
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveOperation: (id: number) => void;
  onUpdateOperationValue: (id: number, value: string) => void;
  onUpdateOperationPosition: (id: number, position: string) => void;
  onUpdateOperationNewValue: (id: number, newValue: string) => void;
  onUpdateOperationSourceStack?: (id: number, sourceStack: string) => void;
  onUpdateOperationTargetStack?: (id: number, targetStack: string) => void;
  onReorderOperation?: (fromIndex: number, toIndex: number) => void;
  children?: React.ReactNode;
}

// ============================================================================
// Playground Shared Component Props
// ============================================================================
interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToScreen: () => void;
  minZoom?: number;
  maxZoom?: number;
}

interface ZoomableContainerProps {
  children: React.ReactNode;
  className?: string;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  enablePan?: boolean;
  enableWheelZoom?: boolean;
  enableKeyboardZoom?: boolean;
  showControls?: boolean;
}

interface TutorialButtonProps {
  onClick: () => void;
  className?: string;
}

interface StepIndicatorProps {
  stepNumber: number;
  totalSteps: number;
  message?: string;
  isAutoPlaying?: boolean;
  className?: string;
}

interface MemoryUsagePanelProps {
  steps: StepthroughStep[];
  currentStepIndex: number;
}

interface InputDialogProps {
  isOpen: boolean;
  prompts: Array<{ prompt: string; inputId: number }> | null;
  onSubmit: (values: string[]) => void;
  onCancel: () => void;
}

interface GraphNodeProps {
  node: UndirectedGraphNode;
  isHighlighted: boolean;
  isInSearchPath: boolean;
  isTraverseSelected: boolean;
  isCurrentlyTraversing: boolean;
  isRunning: boolean;
  isAnimating?: boolean;
  onMouseDown?: (e: React.MouseEvent, nodeId: string) => void;
  position?: { x: number; y: number };
  isDragging?: boolean;
}

interface GraphEdgeProps {
  edge: UndirectedGraphEdge | DirectedGraphEdge;
  fromNode: UndirectedGraphNode | DirectedGraphNode;
  toNode: UndirectedGraphNode | DirectedGraphNode;
  isHighlighted: boolean;
  allEdges?: (UndirectedGraphEdge | DirectedGraphEdge)[];
}

interface ConsoleOutputProps {
  steps: StepthroughStep[];
  currentStepIndex: number;
}

interface BigOComplexityCardProps {
  complexity: ComplexityAnalysis | null | undefined;
  isLoading?: boolean;
}

// ============================================================================
// Exports
// ============================================================================
export type {
  // Button
  CopyAndExportButtonProps,
  ExportPNGButtonProps,
  FileUploadButtonProps,
  // Card
  CourseCardProps,
  CourseCardWithEnrollmentProps,
  MaterialCardProps,
  ExerciseProblemCardProps,
  PDFSubmissionCardProps,
  SubmittedPDFCardProps,
  TestCaseResultCardProps,
  QueueStatusCardProps,
  QueueJobCardProps,
  TACommentCardProps,
  PlaygroundModeCardProps,
  LearningTipCardProps,
  DataStructureCardProps,
  // Table
  GradingTableProps,
  QueueTableProps,
  // Dialog
  GradingDialogProps,
  ReviewScoreDialogProps,
  ReviewDialogProps,
  RequestApprovalDialogProps,
  ImageDialogProps,
  TutorialDialogProps,
  // UI Components
  ApprovalStatusBadgeProps,
  OperationCategoryDropdownProps,
  EnrollmentPopoverProps,
  ProgressChartProps,
  // Editor
  CodeEditorProps,
  ExerciseEditorCardProps,
  // List
  QueueJobListProps,
  MembersListProps,
  VirtualizedListProps,
  // Menu
  SubItem,
  MenuItem,
  PlaygroundItem,
  SubMenuItemProps,
  NestedSubMenuItemProps,
  // Step Selector
  StepSelectorProps,
  // Showcase
  Structure,
  CTASectionProps,
  // Landing
  VisualizationMode,
  // Tutorial
  DataStructure,
  LearningTip,
  TutorialStep,
  TutorialOverlayProps,
  PlaygroundTutorialStep,
  PlaygroundMode,
  TutorialSection,
  TutorialStepProps,
  PlaygroundModeType,
  // Section
  MaterialsByWeekProps,
  LatestAnnouncementProps,
  // DragDrop
  OperationCardProps,
  VisualizationProps,
  SinglyLinkedListOperationsProps,
  SinglyLinkedListVisualizationProps,
  DoublyLinkedListOperationsProps,
  DoublyLinkedListVisualizationProps,
  StackOperationsProps,
  StackVisualizationProps,
  QueueOperationsProps,
  QueueVisualizationProps,
  DragDropZoneProps,
  FeatureCardProps,
  // Playground Shared Components
  ZoomControlsProps,
  ZoomableContainerProps,
  TutorialButtonProps,
  StepIndicatorProps,
  MemoryUsagePanelProps,
  InputDialogProps,
  GraphNodeProps,
  GraphEdgeProps,
  ConsoleOutputProps,
  BigOComplexityCardProps,
  // Performance Panel
  PerformanceAnalysisPanelProps,
  PerformanceSummaryMetricsProps,
  PerformanceMetricsCardsProps,
  PerformanceChartProps,
  HotspotsPanelProps,
  TimelinePanelProps,
  MemoryUsageBarProps,
  TimeUsageBarProps,
  BigOOverviewProps,
  BigOAnalysisDetailsProps,
  PerFunctionComplexityProps,
  BigOChartProps,
};

// ============================================================================
// Performance Panel Props
// ============================================================================
interface PerformanceAnalysisPanelProps {
  steps: StepthroughStep[];
  currentStepIndex: number;
  complexity?: ComplexityAnalysis | null;
}

interface PerformanceSummaryMetricsProps {
  memoryUsage: number;
  totalExecutionTime: number;
  complexity?: ComplexityAnalysis | null;
}

interface PerformanceMetricsCardsProps {
  memoryUsage: number;
  maxMemoryUsed: number;
  totalExecutionTime: number;
  stepCount: number;
}

interface PerformanceChartProps {
  steps: StepthroughStep[];
  currentStepIndex: number;
}

interface HotspotsPanelProps {
  steps: StepthroughStep[];
}

interface TimelinePanelProps {
  steps: StepthroughStep[];
  currentStepIndex: number;
}

interface MemoryUsageBarProps {
  memoryUsage: number;
}

interface TimeUsageBarProps {
  totalExecutionTime: number;
}

interface BigOOverviewProps {
  complexity: ComplexityAnalysis;
}

interface BigOAnalysisDetailsProps {
  details: ComplexityAnalysis['analysisDetails'];
}

interface PerFunctionComplexityProps {
  functionComplexities: NonNullable<ComplexityAnalysis['functionComplexities']>;
}

interface BigOChartProps {
  timeComplexity: string;
}
