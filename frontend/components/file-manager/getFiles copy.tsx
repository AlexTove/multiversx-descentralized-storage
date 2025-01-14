"use client";

import { useState, useCallback, useEffect } from "react";
import { useSendDcscTransaction } from "@/hooks/transactions/decentralstoreTransaction";
import { useIsWebProvider } from "@/hooks/useIsWebProvider"; // Updated import

interface FileMetadata {
  file_hash: string;
  file_size: number | string;
  file_name: string;
  file_type: string;
  file_cid: string;
}

export function GetFiles() {
  const { sendGetUploadedFilesTransactionSimple } = useSendDcscTransaction();
  const { isWebProvider } = useIsWebProvider(); // Use the useIsWebProvider hook

  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUploadedFiles = useCallback(async () => {
    if (!isWebProvider) {
      console.log("Web provider not available. Waiting...");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching uploaded files...");
      const files = await sendGetUploadedFilesTransactionSimple({
        callbackRoute: "/dashboard", // route after success
      });
      console.log("Retrieved files:", files);
      // setUploadedFiles(files);
    } catch (err) {
      console.error("Error retrieving uploaded files:", err);
      setError("Failed to retrieve uploaded files. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [isWebProvider, sendGetUploadedFilesTransactionSimple]);

  useEffect(() => {
    if (isWebProvider) {
      fetchUploadedFiles();
    } else {
      console.log("Web provider is not ready. fetchUploadedFiles will be called once available.");
    }
  }, [isWebProvider, fetchUploadedFiles]);

}

export default GetFiles;