import {
  Folder as FolderIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  FileText as FileTextIcon,
  Archive as ArchiveIcon,
  MoreHorizontal as OthersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Folder } from "@/types/fileTypes";

interface FolderGridProps {
  folders: Folder[];
  onSelectFolder: (folderId: string) => void;
}

// Mapping of folder IDs to their corresponding icons
const folderIconMapping: { [key: string]: React.ReactNode } = {
  images: <ImageIcon className="h-8 w-8" />,
  videos: <VideoIcon className="h-8 w-8" />,
  audio: <MusicIcon className="h-8 w-8" />,
  documents: <FileTextIcon className="h-8 w-8" />,
  archives: <ArchiveIcon className="h-8 w-8" />,
  others: <OthersIcon className="h-8 w-8" />,
};

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
          {/* Render the corresponding icon based on the folder ID */}
          {folderIconMapping[folder.id] || <FolderIcon className="h-8 w-8" />}
          <span className="font-medium">{folder.name}</span>
          {/* Example: Uncomment to show creation date if available */}
          {/* <span className="text-xs text-muted-foreground">
            {format(folder.createdAt, "MMM d, yyyy")}
          </span> */}
        </Button>
      ))}
    </div>
  );
}