import { Transaction } from '@/types/sdkCoreTypes';

type Address = string; // Simple alias, adjust as needed
// Define the FileMetadata structure based on the ABI
export interface FileMetadata {
  file_hash: string;      // bytes
  file_size: number;      // u64
  file_name: string;      // bytes
  file_type: string;      // bytes
  file_tags: string[];    // List<bytes>
  file_cid: string;       // bytes
  timestamp: number;      // u64
  uploader: Address;
}

// Input type for the uploadFile endpoint
export interface UploadFileInput {
  file_hash: string; // bytes
  file_size: number; // u64
  file_name: string; // bytes
  file_type: string; // bytes
  file_cid: string;  // bytes
}

// Input type for the addTag endpoint
export interface AddTagInput {
  tag: string; // bytes
}

// Output type for the files endpoint
export type FilesOutput = Record<string, FileMetadata[]>; // variadic<multi<Address,List<FileMetadata>>>

// Output type for the getUploadedFiles endpoint
export type GetUploadedFilesOutput = FileMetadata[];