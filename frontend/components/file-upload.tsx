"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetIsLoggedIn, useGetAccountInfo} from '@/hooks';

// 1) IMPORT YOUR TRANSACTION HOOK HERE:
import { useSendDcscTransaction } from "@/hooks/transactions/decentralstoreTransaction";

// const client = create({ url: "https://ipfs.infura.io:5001/api/v0" });

interface FileUploadResponse {
  cid: string;
  fileHash: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  message: string;
}

export function FileUpload() {
  const { toast } = useToast();
  const { address, account } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  
  const { sendUploadFileTransactionSimple } = useSendDcscTransaction();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ipfsHash, setIpfsHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileData, setFileData] = useState<FileUploadResponse | null>(null);


  const handleUpload = useCallback(async (acceptedFiles: File[]) => {
    if (!isLoggedIn) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to upload files.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setFileData(null); // Reset previous file data

      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);

      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      xhr.open('POST', 'http://localhost:3001/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded / event.total) * 100);
          setProgress(percentCompleted);
        }
      };

      // 3) MAKE THIS ONLOAD ASYNC SO YOU CAN AWAIT YOUR TRANSACTION:
      xhr.onload = async () => {
        if (xhr.status === 200) {
          const data: FileUploadResponse = JSON.parse(xhr.responseText);
          const { cid, fileHash, fileName, fileSize, fileType, message } =
            data;

          // SEND TRANSACTION TO BLOCKCHAIN:
          try {
            await sendUploadFileTransactionSimple({
              file_hash: fileHash,
              file_size: fileSize,
              file_name: fileName,
              file_type: fileType,
              file_cid: cid,
              callbackRoute: "/upload-confirmed" // route after success
            });
          } catch (txError) {
            console.error("Blockchain transaction error:", txError);
            toast({
              title: "Transaction failed",
              description: "Could not record file upload on-chain.",
              variant: "destructive",
            });
          }

          // Continue normal UI handling
          setFileData(data);
          setIpfsHash(cid); 
          console.log("Upload successful:", data);

          toast({
            title: "Upload successful",
            description: message,
          });
        } else {
          console.error("Upload failed with status:", xhr.status);
          toast({
            title: "Upload failed",
            description: "There was an error uploading your file.",
            variant: "destructive",
          });
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        console.error("Upload error");
        toast({
          title: "Upload failed",
          description: "There was an error uploading your file.",
          variant: "destructive",
        });
        setUploading(false);
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
      setUploading(false);
    }
  }, [isLoggedIn, toast, sendUploadFileTransactionSimple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    multiple: false,
  });

  const copyHash = async () => {
    if (!fileData?.cid) return;
    try {
      await navigator.clipboard.writeText(`https://ipfs.io/ipfs/${fileData.cid}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "IPFS hash has been copied.",
      });
    } catch (err) {
      console.error("Copy failed:", err);
      toast({
        title: "Copy failed",
        description: "Unable to copy IPFS hash.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}
          ${!address ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">
          {isDragActive
            ? "Drop the file here"
            : "Drag and drop a file here, or click to select"}
        </p>
        <p className="text-sm text-muted-foreground">
          Supported files: Images, videos, documents (max 50MB)
        </p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            Uploading... {Math.round(progress)}
          </p>
        </div>
      )}

      {ipfsHash && !uploading && (
        <div className="p-4 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">IPFS Hash:</span>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={copyHash}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
          <code className="block w-full p-2 bg-muted rounded text-sm break-all">
            {ipfsHash}
          </code>
        </div>
      )}

      {!address && (
        <p className="text-sm text-muted-foreground text-center">
          Connect your wallet to start uploading files
        </p>
      )}
    </div>
  );
}