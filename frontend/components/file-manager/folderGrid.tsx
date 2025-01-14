import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Folder } from "@/types/fileTypes";

interface FolderGridProps {
  folders: Folder[];
  onSelectFolder: (folderId: string) => void;
}

export function FolderGrid({ folders, onSelectFolder }: FolderGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {folders.map((folder) => (
        <Button
          key={folder.id}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
          onClick={() => onSelectFolder(folder.id)}
        >
          <FileText className="h-8 w-8" />
          <span className="font-medium">{folder.name}</span>
          <span className="text-xs text-muted-foreground">
            {format(folder.createdAt, "MMM d, yyyy")}
          </span>
        </Button>
      ))}
    </div>
  );
}
