import { FileText, Download, Trash2, Tag, TrashIcon, TagIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { File } from "@/types/fileTypes";
import { formatSize } from "@/utils/formatSize";
import { AddTagForm } from "./addTagForm";

interface FileListProps {
  files: File[];
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string) => void;
  onSelectAll: () => void;
  onDownload: (cid: string, fileName: string) => void;
  onRemoveFile: (fileId: string) => void;
  onAddTag: (fileId: string, tag: string) => void;
  onRemoveTag: (fileId: string, tag: string) => void; // Optionally add onDelete, onAddTag, etc. as needed
}

export function FileList({ files, selectedFiles, onSelectFile, onSelectAll, onDownload, onRemoveFile, onAddTag, onRemoveTag }: FileListProps) {
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
                                onClick={() => onRemoveTag(file.id, tag)}
                              >
                                Remove
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                    <AddTagForm onAddTag={(tag) => onAddTag(file.id, tag)} />
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="button">Cancel</Button>
                  <Button type="submit">Add Tag</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
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
                    onClick={() => onRemoveFile(file.id)}
                  >
                    Remove
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ))}
    </div>
  );
}
