import html2canvas from 'html2canvas';

export interface ExportOptions {
  filename?: string;
  quality?: number;
}

export class ExportUtils {
  /**
   * Export visualization as PNG image
   */
  static async exportAsPNG(
    elementRef: React.RefObject<HTMLElement | null>,
    options: ExportOptions = {}
  ): Promise<void> {
    if (!elementRef.current) {
      throw new Error('Element reference is not available');
    }

    const { filename = 'doubly-linked-list-visualization', quality = 1 } = options;

    try {
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: elementRef.current.scrollWidth,
        height: elementRef.current.scrollHeight,
        ignoreElements: (element) => {
          // Skip elements that might cause color parsing issues
          return element.classList.contains('ignore-export');
        },
        onclone: (clonedDoc) => {
          // Convert lab() colors to rgb() to avoid parsing issues
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: rgb(0, 0, 0) !important;
              background-color: rgb(255, 255, 255) !important;
            }
            .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
            .bg-white { background-color: rgb(255, 255, 255) !important; }
            .text-gray-800 { color: rgb(31, 41, 55) !important; }
            .text-gray-600 { color: rgb(75, 85, 99) !important; }
            .text-gray-400 { color: rgb(156, 163, 175) !important; }
            .text-blue-600 { color: rgb(37, 99, 235) !important; }
            .text-green-600 { color: rgb(22, 163, 74) !important; }
            .border-black { border-color: rgb(0, 0, 0) !important; }
            .bg-accent { background-color: rgb(59, 130, 246) !important; }
            .border-accent { border-color: rgb(59, 130, 246) !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png', quality);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting PNG:', error);
      throw new Error('Failed to export PNG');
    }
  }

  /**
   * Export Python code as .py file
   */
  static exportAsPython(
    code: string,
    options: ExportOptions = {}
  ): void {
    const { filename = 'doubly-linked-list-code' } = options;

    try {
      // Create blob with Python code
      const blob = new Blob([code], { type: 'text/python' });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}.py`;
      link.href = URL.createObjectURL(blob);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL object
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting Python code:', error);
      throw new Error('Failed to export Python code');
    }
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
}
