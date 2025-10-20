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

export type { CopyAndExportButtonProps, ExportPNGButtonProps, FileUploadButtonProps };
