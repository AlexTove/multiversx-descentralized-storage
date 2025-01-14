export type ViewMode = "grid" | "list";
export type FileType = "all" | "image" | "video" | "document";

export interface File {
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

export interface Folder {
  id: string;
  name: string;
  createdAt?: Date;
  icon?: string;
}
