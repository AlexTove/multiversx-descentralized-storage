import { FileText, Download, Trash2, Tag, TrashIcon, TagIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { File } from "@/types/fileTypes";
import { formatSize } from "@/utils/formatSize";
import { AddTagForm } from "./addTagForm";
import { useEffect, useState } from "react";

interface FileGridProps {
  files: File[];
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string) => void;
  onDownload: (cid: string, fileName: string) => void;
  onRemoveFile: (fileId: string) => void;
  onAddTag: (fileId: string, tag: string) => void;
  onRemoveTag: (fileId: string, tag: string) => void;
}

// Function to get folder ID based on MIME type
const getType = (mimeType: string): string => {
  const primaryType = mimeType.split('/')[0];

  switch (primaryType) {
    case 'image':
      return 'images';
    case 'video':
      return 'videos';
    case 'audio':
      return 'audio';
    case 'text':
      return 'documents';
    case 'application':
      // Further categorize application types
      if (
        mimeType === 'application/pdf' ||
        mimeType === 'application/msword' ||
        mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/vnd.ms-excel' ||
        mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimeType === 'application/vnd.ms-powerpoint' ||
        mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ) {
        return 'documents';
      } else if (
        mimeType === 'application/zip' ||
        mimeType === 'application/x-rar-compressed' ||
        mimeType === 'application/gzip' ||
        mimeType === 'application/x-7z-compressed'
      ) {
        return 'archives';
      } else {
        return 'others';
      }
    default:
      return 'others';
  }
};

export function FileGrid({ files, selectedFiles, onSelectFile, onDownload, onRemoveFile, onAddTag, onRemoveTag }: FileGridProps) {
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    files.forEach(async (file) => {
      if (getType(file.type) == 'images' && file.ipfsHash && !imageUrls[file.id]) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
          const response = await fetch(`${backendUrl}/file/${file.ipfsHash}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setImageUrls((prev: any) => ({ ...prev, [file.id]: url }));
        } catch (error) {
          console.error('Error fetching thumbnail:', error);
        }
      }
    });

    // Cleanup function to revoke object URLs when component unmounts or files change
    return () => {
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files, imageUrls]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="group relative border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="absolute top-2 left-2">
            {/* <Checkbox
              checked={selectedFiles.has(file.id)}
              onCheckedChange={() => onSelectFile(file.id)}
            /> */}
          </div>
          <div className="aspect-square mb-4 rounded-md bg-muted flex items-center justify-center overflow-hidden">
            {getType(file.type) == 'images' && imageUrls[file.id] ? (
              <img
                src={imageUrls[file.id]}
                alt={file.name}
                className="object-cover"
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
            <div className="flex flex-wrap gap-2 mt-1">
              {file.tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm"
                >
                  <span>{tag}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Tag</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove the tag "
                          <strong>{tag}</strong>" from this file?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button
                          variant="destructive"
                          onClick={() => onRemoveTag(file.ipfsHash, tag)}
                        >
                          Remove
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
            {/* Additional file actions/buttons (tag, download, delete) here */}
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <TagIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Tag</DialogTitle>
                    <DialogDescription>
                      {/* Tag adding form */}
                      <AddTagForm onAddTag={(tag) => onAddTag(file.ipfsHash, tag)} />
                    </DialogDescription>
                  </DialogHeader>
                  {/* <DialogFooter>
                    <Button type="button">Cancel</Button>
                    <Button type="submit">Add Tag</Button>
                  </DialogFooter> */}
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDownload(file.ipfsHash, file.name)}
              >
                <Download className="h-4 w-4" />
              </Button>
              {/* Remove File Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove File</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to remove <strong>{file.name}</strong>?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button type="button">Cancel</Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onRemoveFile(file.ipfsHash)}
                    >
                      Remove
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
