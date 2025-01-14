"use client";

import { FileText, Image, Video, HardDrive } from "lucide-react";
import { formatSize } from "./formatSize";

interface FileStats {
  totalFiles: number;
  totalSize: number;
  fileTypes: {
    images: number;
    videos: number;
    documents: number;
  };
}



export function StatsDashboard({ stats }: { stats: FileStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Total Files</h3>
        </div>
        <p className="text-2xl font-bold">{stats.totalFiles}</p>
      </div>
      
      <div className="bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Storage Used</h3>
        </div>
        <p className="text-2xl font-bold">{formatSize(stats.totalSize)}</p>
      </div>

      <div className="bg-card p-4 rounded-lg border col-span-2">
        <h3 className="font-medium mb-2">File Types</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Images:</span>
            <span className="font-bold">{stats.fileTypes.images}</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Videos:</span>
            <span className="font-bold">{stats.fileTypes.videos}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Documents:</span>
            <span className="font-bold">{stats.fileTypes.documents}</span>
          </div>
        </div>
      </div>
    </div>
  );
}