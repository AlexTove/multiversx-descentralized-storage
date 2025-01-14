"use client";

import { useState } from "react";
import { Grid, List, FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";
import { useSendDcscTransaction } from "@/hooks/transactions";

import { StatsDashboard } from "./statsDashboard";
import { SearchSortBar } from "./searchSortBar";
import { FileUpload } from "@/components/file-upload";
import { FileGrid } from "./fileGrid";
import { FileList } from "./fileList";
import { FolderGrid } from "./folderGrid";

import { ViewMode, File, Folder } from "@/types/fileTypes";
import { downloadFile } from "@/utils/downloadFile";

export function FileManager() {
  const { toast } = useToast();
  const { sendGetUploadedFilesTransactionSimple } = useSendDcscTransaction();

  // State variables
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]); // Populate as needed, e.g., from static data
  const [dataLoaded, setDataLoaded] = useState(false);

  // Additional UI state variables (filters, selection, search, etc.)
  const [fileType, setFileType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("date-desc");

  // Handle loading files on button click
  const handleLoadFiles = async () => {
    try {
      const fetchedFiles: File[] = await sendGetUploadedFilesTransactionSimple({
        callbackRoute: "/dashboard",
      });
      // Assume fetchedFiles is an array of File objects
      setFiles(fetchedFiles);
      setDataLoaded(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    }
  };

  // Stats calculation based on loaded files
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((acc, file) => acc + file.size, 0),
    fileTypes: {
      images: files.filter(f => f.type === "image").length,
      videos: files.filter(f => f.type === "video").length,
      documents: files.filter(f => f.type === "document").length
    }
  };

  // Derive a list of tags from loaded files
  const allTags = Array.from(
    new Set(files.flatMap(file => file.tags))
  ).sort();

  // Filter and sort files based on current UI state
  const filteredFiles = files
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

  // Handlers for file selection, download, etc.
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

  // If data hasn't been loaded, show a button to load files
  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Button onClick={handleLoadFiles}>See Files</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Display stats dashboard */}
      <StatsDashboard stats={stats} />

      {/* File upload section */}
      <section className="py-5 px-4">
        <div className="container mx-auto max-w-4xl">
          <FileUpload />
        </div>
      </section>

      {/* Header actions and view toggles */}
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
              {/* Folder creation form can go here */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
            onClick={() => {
              const newTags = new Set(selectedTags);
              if (newTags.has(tag)) {
                newTags.delete(tag);
              } else {
                newTags.add(tag);
              }
              setSelectedTags(newTags);
            }}
            className="gap-2"
          >
            {tag}
          </Button>
        ))}
      </div>

      {/* Display folders if not in a specific folder */}
      {!currentFolder && folders.length > 0 && (
        <FolderGrid
          folders={folders}
          onSelectFolder={(folderId: string) => setCurrentFolder(folderId)}
        />
      )}

      {/* Render files in grid or list view based on viewMode */}
      {viewMode === "grid" ? (
        <FileGrid
          files={filteredFiles}
          selectedFiles={selectedFiles}
          onSelectFile={handleSelectFile}
          onDownload={(cid: string, fileName: string) => downloadFile(cid, fileName, toast)}
        />
      ) : (
        <FileList
          files={filteredFiles}
          selectedFiles={selectedFiles}
          onSelectFile={handleSelectFile}
          onSelectAll={handleSelectAll}
          onDownload={(cid: string, fileName: string) => downloadFile(cid, fileName, toast)}
        />
      )}

      {/* Display message when no files match the criteria */}
      {filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">No files found</p>
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
