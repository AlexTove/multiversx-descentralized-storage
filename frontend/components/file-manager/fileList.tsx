import { FileText, Download, Trash2, Tag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { File } from "@/types/fileTypes";
import { formatSize } from "@/utils/formatSize";

interface FileListProps {
  files: File[];
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string) => void;
  onSelectAll: () => void;
  onDownload: (cid: string, fileName: string) => void;
  // Optionally add onDelete, onAddTag, etc. as needed
}

export function FileList({ files, selectedFiles, onSelectFile, onSelectAll, onDownload }: FileListProps) {
  return (
    <div className="border rounded-lg divide-y">
      <div className="p-4 bg-muted">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedFiles.size === files.length}
            onCheckedChange={onSelectAll}
          />
          <span className="font-medium">Name</span>
        </div>
      </div>
      {files.map((file) => (
        <div key={file.id} className="flex items-center p-4 hover:bg-muted/50">
          <div className="flex items-center gap-4 flex-1">
            <Checkbox
              checked={selectedFiles.has(file.id)}
              onCheckedChange={() => onSelectFile(file.id)}
            />
            <div className="flex items-center gap-4">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{file.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{format(file.uploadDate, "MMM d, yyyy")}</span>
                  <span>•</span>
                  <span>Size: {formatSize(file.size)}</span>
                  <div className="flex gap-1">
                    {file.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-muted px-2 py-0.5 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Tag className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Tag</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2">
                  <Input placeholder="New tag" />
                  <Button>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDownload(file.ipfsHash, file.name)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
