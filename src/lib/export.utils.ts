// @ts-expect-error - dom-to-image doesn't have types
import * as domtoimage from 'dom-to-image';

export interface ExportOptions {
  filename?: string;
  quality?: number;
}

export class ExportUtils {
  /**
   * Export visualization as PNG image using dom-to-image
   */
  static async exportAsPNG(
    elementRef: React.RefObject<HTMLElement | null>,
    options: ExportOptions = {},
  ): Promise<void> {
    if (!elementRef.current) {
      throw new Error('Element reference is not available');
    }

    const { filename = 'visualization', quality = 1 } = options;

    try {
      const element = elementRef.current;

      // Use dom-to-image to capture the element
      const dataUrl = await domtoimage.toPng(element, {
        quality: quality,
        bgcolor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        filter: (node: Element) => {
          // Skip elements that might cause issues
          return !(node as HTMLElement).classList?.contains('ignore-export');
        },
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up URL object
      URL.revokeObjectURL(dataUrl);
    } catch (error) {
      console.error('Error exporting PNG:', error);
      throw new Error('Failed to export PNG');
    }
  }

  /**
   * Export Python code as .py file
   */
  static exportAsPython(code: string, options: ExportOptions = {}): void {
    const { filename = 'playground' } = options;

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
