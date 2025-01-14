import { useToast } from "@/hooks/use-toast";

export async function downloadFile(
  cid: string,
  fileName: string,
  toast: ReturnType<typeof useToast>["toast"]
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/file/${cid}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({
      title: 'Download successful',
      description: `File "${fileName}" has been downloaded.`,
    });
  } catch (error) {
    console.error('Download error:', error);
    toast({
      title: 'Download failed',
      description: 'There was an error downloading your file.',
      variant: 'destructive',
    });
  }
}
