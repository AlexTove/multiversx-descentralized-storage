import { FileText, Download, Trash2, Tag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { File } from "@/types/fileTypes";
import { formatSize } from "@/utils/formatSize";

interface FileGridProps {
  files: File[];
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string) => void;
  onDownload: (cid: string, fileName: string) => void;
  // Add any additional callbacks and props as needed
}

export function FileGrid({ files, selectedFiles, onSelectFile, onDownload }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="group relative border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="absolute top-2 left-2">
            <Checkbox
              checked={selectedFiles.has(file.id)}
              onCheckedChange={() => onSelectFile(file.id)}
            />
          </div>
          <div className="aspect-square mb-4 rounded-md bg-muted flex items-center justify-center overflow-hidden">
            {file.thumbnail ? (
              <img
                src={file.thumbnail}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FileText className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <div>
              <h3 className="font-medium truncate">{file.name}</h3>
              <p className="text-sm text-muted-foreground">
                {format(file.uploadDate, "MMM d, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground">
                Size: {formatSize(file.size)}
              </p>
            </div>
            {/* Additional file actions/buttons (tag, download, delete) here */}
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Tag className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Tag</DialogTitle>
                  </DialogHeader>
                  {/* Tag adding form */}
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDownload(file.ipfsHash, file.name)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
