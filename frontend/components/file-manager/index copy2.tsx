"use client";

import { useState, useCallback, useEffect } from "react";
import { Grid, List, FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";
import { useGetFilesTransaction } from "./getFiles";

import { StatsDashboard } from "./statsDashboard";
import { SearchSortBar } from "./searchSortBar";
import { FileUpload } from "@/components/file-upload";
import { FileGrid } from "./fileGrid";
import { FileList } from "./fileList";
import { FolderGrid } from "./folderGrid";

import { ViewMode, File } from "@/types/fileTypes";
import { downloadFile } from "@/utils/downloadFile";

import { useGetNetworkConfig, useGetAccount } from '@/hooks';
import { Address, AddressValue, ContractFunction, ResultsParser, ProxyNetworkProvider } from '@/utils';
import { smartContract } from '@/utils/smartContract';
import { useSendDcscTransaction } from "@/hooks/transactions";

const resultsParser = new ResultsParser();

// Helper function to decode Buffer data to string
const decodeBuffer = (bufferData: number[]): string => {
  const uint8Array = new Uint8Array(bufferData);
  return new TextDecoder('utf-8').decode(uint8Array);
};

// Function to parse raw files data into File objects
const parseFiles = (rawFiles: any[]): File[] => {
  return rawFiles.map((rawFile) => {
    console.log('Raw File:', rawFile);
    const mimeType = decodeBuffer(rawFile.file_type);
    const folderId = getFolderIdByMimeType(mimeType);

    return {
      id: decodeBuffer(rawFile.file_hash),
      name: decodeBuffer(rawFile.file_name),
      type: mimeType,
      size: Number(rawFile.file_size),
      ipfsHash: decodeBuffer(rawFile.file_cid),
      fileHash: decodeBuffer(rawFile.file_hash),
      uploadDate: new Date(Number(rawFile.timestamp) * 1000), // Convert seconds to milliseconds
      tags: rawFile.file_tags.map((tag: number[]) => decodeBuffer(tag)), // Decode each tag
      folderId: folderId,
      uploader: rawFile.uploader.bech32,
    };
  });
};

interface Folder {
  id: string;
  name: string;
}

// Define folder categories based on MIME types
const folderCategories: { [key: string]: string } = {
  images: 'Images',
  videos: 'Videos',
  audio: 'Audio',
  documents: 'Documents',
  archives: 'Archives',
  others: 'Others',
};

// Function to get folder ID based on MIME type
const getFolderIdByMimeType = (mimeType: string): string => {
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

export function FileManager() {
  const { toast } = useToast();
  const { network } = useGetNetworkConfig();
  const proxy = new ProxyNetworkProvider(network.apiAddress);
  const { address } = useGetAccount();

  // State variables
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'images', name: 'Images' },
    { id: 'videos', name: 'Videos' },
    { id: 'audio', name: 'Audio' },
    { id: 'documents', name: 'Documents' },
    { id: 'archives', name: 'Archives' },
    { id: 'others', name: 'Others' },
  ]);
  // Populate as needed, e.g., from static data
  const [dataLoaded, setDataLoaded] = useState(false);

  // Additional UI state variables (filters, selection, search, etc.)
  const [fileType, setFileType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("date-desc");
  const { sendAddTagTransactionSimple, sendRemoveFileTransactionSimple, sendRemoveTagTransactionSimple } = useSendDcscTransaction();

  // Handle loading files on button click
  const handleLoadFiles = useCallback(async () => {
    try {
      // Create the query for the 'userFiles' endpoint
      const query = smartContract.createQuery({
        func: new ContractFunction('userFiles'),
        args: [new AddressValue(new Address(address))], // Ensure 'address' is defined in your scope
      });

      // Execute the query using the proxy
      const queryResponse = await proxy.queryContract(query);

      // Get the endpoint definition for 'userFiles'
      const endpointDefinition = smartContract.getEndpoint('userFiles');

      // Parse the query response to extract files
      const { firstValue: rawFiles } = resultsParser.parseQueryResponse(
        queryResponse,
        endpointDefinition
      );

      console.log('Raw Files Data:', rawFiles?.valueOf());

      // Check if rawFiles exists and has data
      if (rawFiles && rawFiles.valueOf().length > 0) {
        // Parse the raw files into File objects
        const parsedFiles = parseFiles(rawFiles.valueOf());
        console.log('Parsed Files:', parsedFiles);

        // Update the state with the parsed files
        setFiles(parsedFiles);
        setDataLoaded(true);
      } else {
        console.log('No files retrieved from the contract.');
        setFiles([]);
        setDataLoaded(true);
      }

      return '';
    } catch (err) {
      console.error('Unable to call getUserFiles:', err);
      toast({
        title: 'Error',
        description: 'Failed to load files.',
        variant: 'destructive',
      });
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      handleLoadFiles();
    }
  }, [address, handleLoadFiles]);

  // Stats calculation based on loaded files
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((acc, file) => acc + file.size, 0),
    fileTypes: {
      images: files.filter(f => getFolderIdByMimeType(f.type) === "images").length,
      videos: files.filter(f => getFolderIdByMimeType(f.type) === "videos").length,
      documents: files.filter(f => getFolderIdByMimeType(f.type) === "documents").length
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

  // Handler to remove a file
  const handleRemoveFile = useCallback(
    async (ipfsHash: string) => {
      try {
        await sendRemoveFileTransactionSimple({ file_cid: ipfsHash, callbackRoute: "/dashboard" });
        toast({
          title: "File Removed",
          description: "The file has been successfully removed.",
          variant: "default",
        });
        handleLoadFiles(); // Refresh the files list after removal
      } catch (error) {
        console.error("Error removing file:", error);
        toast({
          title: "Error",
          description: "Failed to remove the file.",
          variant: "destructive",
        });
      }
    },
    [sendRemoveFileTransactionSimple, handleLoadFiles, toast]
  );

  // Handler to add a tag to a file
  const handleAddTag = useCallback(
    async (ipsfHash: string, tag: string) => {
      try {
        await sendAddTagTransactionSimple({file_cid: ipsfHash, tag: tag, callbackRoute: "/dashboard"});
        toast({
          title: "Tag Added",
          description: `Tag "${tag}" has been added to the file.`,
          variant: "default",
        });
        handleLoadFiles(); // Refresh the files list after adding a tag
      } catch (error) {
        console.error("Error adding tag:", error);
        toast({
          title: "Error",
          description: "Failed to add the tag.",
          variant: "destructive",
        });
      }
    },
    [sendAddTagTransactionSimple, handleLoadFiles, toast]
  );

  // Handler to remove a tag from a file
  const handleRemoveTag = useCallback(
    async (ipsfHash: string, tag: string) => {
      try {
        await sendRemoveTagTransactionSimple({file_cid: ipsfHash, tag: tag, callbackRoute: "/dashboard"});
        toast({
          title: "Tag Removed",
          description: `Tag "${tag}" has been removed from the file.`,
          variant: "default",
        });
        handleLoadFiles(); // Refresh the files list after removing a tag
      } catch (error) {
        console.error("Error removing tag:", error);
        toast({
          title: "Error",
          description: "Failed to remove the tag.",
          variant: "destructive",
        });
      }
    },
    [sendRemoveTagTransactionSimple, handleLoadFiles, toast]
  );
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
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog> */}
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
          onRemoveFile={handleRemoveFile}
          onAddTag={handleAddTag} // Pass the add tag handler
          onRemoveTag={handleRemoveTag} // Pass the remove tag handler
        />
      ) : (
        <FileList
          files={filteredFiles}
          selectedFiles={selectedFiles}
          onSelectFile={handleSelectFile}
          onDownload={(cid: string, fileName: string) => downloadFile(cid, fileName, toast)}
          onSelectAll={handleSelectAll}
          onRemoveFile={handleRemoveFile}
          onAddTag={handleAddTag} // Pass the add tag handler
          onRemoveTag={handleRemoveTag} // Pass the remove tag handler
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
