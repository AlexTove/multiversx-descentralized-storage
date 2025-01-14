"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Filter, Grid, List, Image, FileText, Video, Download, Share, Trash2, FolderPlus, Tag, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { StatsDashboard } from "./statsDashboard";
import { SearchSortBar } from "./searchSortBar";
import { FileUpload } from "@/components/file-upload";
import { formatSize } from "./formatSize";
import { GetFiles } from "./getFiles";

type ViewMode = "grid" | "list";
type FileType = "all" | "image" | "video" | "document";

interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  ipfsHash: string;
  fileHash: string;
  uploadDate: Date;
  thumbnail?: string;
  folderId?: string;
  tags: string[];
}

interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

const mockFolders: Folder[] = [
  { id: "folder-1", name: "Documents", createdAt: new Date() },
  { id: "folder-2", name: "Images", createdAt: new Date() }
];

const mockFiles: File[] = [
  {
    id: "1",
    name: "presentation.pdf",
    type: "document",
    size: 2500000,
    ipfsHash: "QmXEQVe88px3D3LjSWR1qv1qFCUJM1FrbsfeRqCKe3g2mn",
    fileHash: "QmX7b5rh9v4KHEEjVZcE9JKpHUv8",
    uploadDate: new Date("2024-03-15"),
    folderId: "folder-1",
    tags: ["work", "presentation"]
  },
  {
    id: "2",
    name: "requirements.txt",
    type: "text/plain",
    ipfsHash: "QmdtCZx6fe5CJb87oCi2fWdCMeq8LEJgL3oxMpAjjuxDbM",
    fileHash: "2062c638030d9a2cb95ac5a82a5f6d580a26e20862b31ef1a34b7adab336bb1d",
    uploadDate: new Date("2024-03-15"),
    folderId: "folder-1",
    size: 47,
    tags: ["work", "presentation"]
  }
];

export function FileManager() {
  const { toast } = useToast();
 
  GetFiles();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [fileType, setFileType] = useState<FileType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("date-desc");

  const allTags = Array.from(
    new Set(mockFiles.flatMap(file => file.tags))
  ).sort();

  // Add the stats calculation
  const stats = {
    totalFiles: mockFiles.length,
    totalSize: mockFiles.reduce((acc, file) => acc + file.size, 0),
    fileTypes: {
      images: mockFiles.filter(f => f.type === "image").length,
      videos: mockFiles.filter(f => f.type === "video").length,
      documents: mockFiles.filter(f => f.type === "document").length
    }
  };


  // Update the filteredFiles to include sorting
  const filteredFiles = mockFiles
    .filter(file => {
      if (currentFolder && file.folderId !== currentFolder) return false;
      if (fileType !== "all" && file.type !== fileType) return false;
      if (searchQuery && !(
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.ipfsHash.toLowerCase().includes(searchQuery.toLowerCase())
      )) return false;
      if (selectedTags.size > 0 && !file.tags.some(tag => selectedTags.has(tag))) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date-desc":
          return b.uploadDate.getTime() - a.uploadDate.getTime();
        case "date-asc":
          return a.uploadDate.getTime() - b.uploadDate.getTime();
        case "size-desc":
          return b.size - a.size;
        case "size-asc":
          return a.size - b.size;
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  // const filteredFiles = mockFiles.filter(file => {
  //   if (currentFolder && file.folderId !== currentFolder) return false;
  //   if (fileType !== "all" && file.type !== fileType) return false;
  //   if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
  //   if (selectedTags.size > 0 && !file.tags.some(tag => selectedTags.has(tag))) return false;
  //   return true;
  // });

  const handleSelectFile = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleDownload = async (cid: string, fileName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/file/${cid}`);
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
  };

  const handleBulkDownload = () => {
    // Implementation for bulk download
    toast({
      title: "Downloading files",
      description: `Downloading ${selectedFiles.size} files...`
    });
  };

  const handleBulkDelete = () => {
    // Implementation for bulk delete
    toast({
      title: "Deleting files",
      description: `${selectedFiles.size} files will be deleted`
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    // Implementation for folder creation
    toast({
      title: "Folder created",
      description: `Created folder: ${newFolderName}`
    });
    setNewFolderName("");
  };

  const handleAddTag = (fileId: string) => {
    if (!newTag.trim()) return;
    // Implementation for adding tags
    toast({
      title: "Tag added",
      description: `Added tag: ${newTag}`
    });
    setNewTag("");
  };

  const handleToggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      {/* Stats Dashboard */}
      <StatsDashboard stats={stats} />

      {/* Header with actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* ... existing header code ... */}
      </div>
      {/* File Upload Section */}
      <section className="py-5 px-4">
        <div className="container mx-auto max-w-4xl">
          <FileUpload />
        </div>
      </section>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Your Files</h1>
          {currentFolder && (
            <Button
              variant="ghost"
              onClick={() => setCurrentFolder(null)}
            >
              Back to Root
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>

          {/* New folder dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                />
                <Button onClick={handleCreateFolder}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and filters
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={fileType} onValueChange={(value: FileType) => setFileType(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Files</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      {/* Search and sort bar */}
      <SearchSortBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Tags filter */}
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <Button
            key={tag}
            variant={selectedTags.has(tag) ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleTag(tag)}
            className="gap-2"
          >
            <Tag className="h-3 w-3" />
            {tag}
          </Button>
        ))}
      </div>


      {/* Bulk actions */}
      {selectedFiles.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedFiles.size} files selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDelete}
            className="gap-2 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete All
          </Button>
        </div>
      )}

      {/* Folders grid */}
      {!currentFolder && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {mockFolders.map((folder) => (
            <Button
              key={folder.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setCurrentFolder(folder.id)}
            >
              <FileText className="h-8 w-8" />
              <span className="font-medium">{folder.name}</span>
              <span className="text-xs text-muted-foreground">
                {format(folder.createdAt, "MMM d, yyyy")}
              </span>
            </Button>
          ))}
        </div>
      )}

      {/* Files grid/list */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedFiles.has(file.id)}
                  onCheckedChange={() => handleSelectFile(file.id)}
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
                  {/* Display File Size */}
                  <p className="text-sm text-muted-foreground">
                    Size: {formatSize(file.size)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {file.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Tag</DialogTitle>
                      </DialogHeader>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="New tag"
                        />
                        <Button onClick={() => handleAddTag(file.id)}>Add</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(file.ipfsHash, file.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          <div className="p-4 bg-muted">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedFiles.size === filteredFiles.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="font-medium">Name</span>
            </div>
          </div>
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center p-4 hover:bg-muted/50"
            >
              <div className="flex items-center gap-4 flex-1">
                <Checkbox
                  checked={selectedFiles.has(file.id)}
                  onCheckedChange={() => handleSelectFile(file.id)}
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
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Tag</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="New tag"
                      />
                      <Button onClick={() => handleAddTag(file.id)}>Add</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(file.ipfsHash, file.name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No files found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Upload some files to get started"}
          </p>
        </div>
      )}
    </div>
  );
}