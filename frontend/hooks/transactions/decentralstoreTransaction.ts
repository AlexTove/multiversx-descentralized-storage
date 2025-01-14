import { useState, useCallback } from 'react';
import {
  removeAllSignedTransactions,
  removeAllTransactionsToSign,
  deleteTransactionToast
} from '@multiversx/sdk-dapp/services/transactions/clearTransactions';
import { signAndSendTransactions } from '@/helpers/signAndSendTransactions';
import { newTransaction } from '@/helpers/sdkDappHelpers';

import {
  useGetAccountInfo,
  useGetNetworkConfig,
  useTrackTransactionStatus
} from '@/hooks/sdkDappHooks';
import { GAS_PRICE, VERSION } from '@/localConstants';
import { getChainId } from '@/utils/getChainId';
import { smartContract } from '@/utils/smartContract';
import { Address } from '@/utils/sdkDappCore';
import { Transaction } from '@multiversx/sdk-core';

// If your contract address is defined elsewhere, import it here:
import { contractAddress } from '@/config';

const toHex = (str: string): string => {
  return Array.from(new TextEncoder().encode(str))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Contract endpoints:
 *  1) uploadFile
 *  2) addTag
 *  3) getUploadedFiles
 */
interface UploadFileProps {
  file_hash: string;
  file_size: number | string;
  file_name: string;
  file_type: string;
  file_cid: string;
  callbackRoute: string;
}

interface AddTagProps {
  tag: string;
  file_cid: string;
  callbackRoute: string;
}

interface GetUploadedFilesProps {
  callbackRoute: string;
}

/**
 * Service-based approach expects the user to build transaction(s) themselves
 */
interface DcscServiceProps {
  transactions: Transaction[];
  callbackRoute: string;
}

interface RemoveFileProps {
  file_cid: string;
  callbackRoute: string;
}

interface RemoveTagProps {
  file_cid: string;
  tag: string;
  callbackRoute: string;
}

const REMOVE_FILE_TRANSACTION_INFO = {
  processingMessage: 'Processing removeFile transaction',
  errorMessage: 'An error occurred during file removal',
  successMessage: 'File removal transaction successful'
};

const REMOVE_TAG_TRANSACTION_INFO = {
  processingMessage: 'Processing removeTag transaction',
  errorMessage: 'An error occurred during tag removal',
  successMessage: 'Tag removal transaction successful'
};

const UPLOAD_TRANSACTION_INFO = {
  processingMessage: 'Processing uploadFile transaction',
  errorMessage: 'An error occurred during file upload',
  successMessage: 'File upload transaction successful'
};

const ADD_TAG_TRANSACTION_INFO = {
  processingMessage: 'Processing addTag transaction',
  errorMessage: 'An error occurred while adding tag',
  successMessage: 'Add tag transaction successful'
};

const GET_UPLOADED_FILES_TRANSACTION_INFO = {
  processingMessage: 'Processing getUploadedFiles transaction',
  errorMessage: 'An error occurred while fetching uploaded files',
  successMessage: 'Fetch uploaded files transaction successful'
};

export const useSendDcscTransaction = () => {
  const [sessionId, setSessionId] = useState<string | null>(
    sessionStorage.getItem('dcscSessionId')
  );

  const { network } = useGetNetworkConfig();
  const { address, account } = useGetAccountInfo();

  // For tracking the status of the last-sent transaction
  const transactionStatus = useTrackTransactionStatus({
    transactionId: sessionId ?? '0'
  });

  const clearAllTransactions = () => {
    removeAllSignedTransactions();
    removeAllTransactionsToSign();
    if (sessionId) {
      deleteTransactionToast(sessionId);
    }
  };

  // ---------------------------------------------------------------------
  // 1) UPLOAD FILE
  // ---------------------------------------------------------------------

  /**
   * A) From ABI
   */
  const sendUploadFileTransactionFromAbi = useCallback(
    async ({
      file_hash,
      file_size,
      file_name,
      file_type,
      file_cid,
      callbackRoute
    }: UploadFileProps) => {
      clearAllTransactions();

      const transaction = smartContract.methodsExplicit
        .uploadFile(file_hash, file_size, file_name, file_type, file_cid)
        .withSender(new Address(address))
        .withValue('0')
        .withGasLimit(60_000_000)
        .withGasPrice(GAS_PRICE)
        .withChainID(getChainId())
        .withVersion(VERSION)
        .buildTransaction();

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: UPLOAD_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address]
  );

  /**
   * B) From Service
   */
  const sendUploadFileTransactionFromService = useCallback(
    async ({ transactions, callbackRoute }: DcscServiceProps) => {
      clearAllTransactions();

      const newSessionId = await signAndSendTransactions({
        transactions,
        callbackRoute,
        transactionsDisplayInfo: UPLOAD_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    []
  );

  /**
   * C) Simple (like old code)
   *    Using newTransaction directly
   */
  const sendUploadFileTransactionSimple = useCallback(
    async ({
      file_hash,
      file_size,
      file_name,
      file_type,
      file_cid,
      callbackRoute
    }: UploadFileProps) => {
      clearAllTransactions();

      // Below is just a placeholder "data" field. In a real contract,
      // you'd typically encode parameters (file_hash, file_size, etc.)
      // in a base64 or hex string, separated by '@', or similarly.
      // Adjust as needed.
      // Encode each element to hex
      const encodedFileHash = toHex(file_hash);
      const encodedFileSize = toHex(file_size.toString());
      const encodedFileName = toHex(file_name);
      const encodedFileType = toHex(file_type);
      const encodedFileCid = toHex(file_cid);
      const dataField = `uploadFile@${encodedFileHash}@${encodedFileSize}@${encodedFileName}@${encodedFileType}@${encodedFileCid}`;
      console.log('Encoded Data Field:', dataField);

      const transaction = newTransaction({
        value: '0',
        data: dataField,
        receiver: contractAddress,
        gasLimit: 30000000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });
      console.log('Built Transaction:', transaction);

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: UPLOAD_TRANSACTION_INFO
      });
      console.log('New Session ID:', newSessionId);

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address, account?.nonce, network?.chainId]
  );

  // ---------------------------------------------------------------------
  // 2) ADD TAG
  // ---------------------------------------------------------------------

  /**
   * A) From ABI
   */
  const sendAddTagTransactionFromAbi = useCallback(
    async ({ tag, callbackRoute }: AddTagProps) => {
      clearAllTransactions();

      const transaction = smartContract.methodsExplicit
        .addTag(tag)
        .withSender(new Address(address))
        .withValue('0')
        .withGasLimit(60_000_000)
        .withGasPrice(GAS_PRICE)
        .withChainID(getChainId())
        .withVersion(VERSION)
        .buildTransaction();

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: ADD_TAG_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address]
  );

  /**
   * B) From Service
   */
  const sendAddTagTransactionFromService = useCallback(
    async ({ transactions, callbackRoute }: DcscServiceProps) => {
      clearAllTransactions();

      const newSessionId = await signAndSendTransactions({
        transactions,
        callbackRoute,
        transactionsDisplayInfo: ADD_TAG_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    []
  );

  /**
   * C) Simple
   */
  const sendAddTagTransactionSimple = useCallback(
    async ({ file_cid, tag, callbackRoute }: AddTagProps) => {
      clearAllTransactions();

      // As with uploadFile, you'll typically encode the tag in the data.
      // This is just a placeholder approach:
      const encodedTag = toHex(tag);
      const encodedFileCid = toHex(file_cid);
      const dataField = `addTag@${encodedFileCid}@${encodedTag}`;

      const transaction = newTransaction({
        value: '0',
        data: dataField,
        receiver: contractAddress,
        gasLimit: 60_000_000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: ADD_TAG_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address, account?.nonce, network?.chainId]
  );

  // ---------------------------------------------------------------------
  // 3) GET UPLOADED FILES
  // ---------------------------------------------------------------------

  /**
   * A) From ABI
   */
  const sendGetUploadedFilesTransactionFromAbi = useCallback(
    async ({ callbackRoute }: GetUploadedFilesProps) => {
      clearAllTransactions();

      const transaction = smartContract.methodsExplicit
        .getUploadedFiles()
        .withSender(new Address(address))
        .withValue('0')
        .withGasLimit(60_000_000)
        .withGasPrice(GAS_PRICE)
        .withChainID(getChainId())
        .withVersion(VERSION)
        .buildTransaction();

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: GET_UPLOADED_FILES_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address]
  );

  /**
   * B) From Service
   */
  const sendGetUploadedFilesTransactionFromService = useCallback(
    async ({ transactions, callbackRoute }: DcscServiceProps) => {
      clearAllTransactions();

      const newSessionId = await signAndSendTransactions({
        transactions,
        callbackRoute,
        transactionsDisplayInfo: GET_UPLOADED_FILES_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    []
  );

  /**
   * C) Simple
   */
  const sendGetUploadedFilesTransactionSimple = useCallback(
    async ({ callbackRoute }: GetUploadedFilesProps) => {
      clearAllTransactions();

      // If your contract expects data for reading, you might encode it here.
      // Often, "get" endpoints are read-only, but here's a "simple" approach:
      const dataField = 'getUploadedFiles';

      const transaction = newTransaction({
        value: '0',
        data: dataField,
        receiver: contractAddress,
        gasLimit: 60000000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: GET_UPLOADED_FILES_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address, account?.nonce, network?.chainId]
  );

  // ---------------------------------------------------------------------
  // 4) REMOVE FILE
  // ---------------------------------------------------------------------

  /**
   * A) From ABI - Remove File
   */
  const sendRemoveFileTransactionFromAbi = useCallback(
    async ({ file_cid, callbackRoute }: RemoveFileProps) => {
      clearAllTransactions();

      const transaction = smartContract.methodsExplicit
        .removeFile(file_cid)
        .withSender(new Address(address))
        .withValue('0')
        .withGasLimit(60_000_000)
        .withGasPrice(GAS_PRICE)
        .withChainID(getChainId())
        .withVersion(VERSION)
        .buildTransaction();

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: REMOVE_FILE_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address]
  );

  /**
 * B) From Service - Remove File
 */
  const sendRemoveFileTransactionFromService = useCallback(
    async ({ transactions, callbackRoute }: DcscServiceProps) => {
      clearAllTransactions();

      const newSessionId = await signAndSendTransactions({
        transactions,
        callbackRoute,
        transactionsDisplayInfo: REMOVE_FILE_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    []
  );

  /**
   * C) Simple - Remove File
   */
  const sendRemoveFileTransactionSimple = useCallback(
    async ({ file_cid, callbackRoute }: RemoveFileProps) => {
      clearAllTransactions();

      const encodedFileCid = toHex(file_cid);

      const dataField = `removeFile@${encodedFileCid}`;

      const transaction = newTransaction({
        value: '0',
        data: dataField,
        receiver: contractAddress,
        gasLimit: 60_000_000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: REMOVE_FILE_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address, account?.nonce, network?.chainId]
  );

  // ---------------------------------------------------------------------
  // 5) REMOVE TAG
  // ---------------------------------------------------------------------

  /**
   * A) From ABI - Remove Tag
   */
  const sendRemoveTagTransactionFromAbi = useCallback(
    async ({ file_cid, tag, callbackRoute }: RemoveTagProps) => {
      clearAllTransactions();

      const transaction = smartContract.methodsExplicit
        .removeTag(file_cid, tag)
        .withSender(new Address(address))
        .withValue('0')
        .withGasLimit(60_000_000)
        .withGasPrice(GAS_PRICE)
        .withChainID(getChainId())
        .withVersion(VERSION)
        .buildTransaction();

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: REMOVE_TAG_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address]
  );

  /**
 * B) From Service - Remove Tag
 */
  const sendRemoveTagTransactionFromService = useCallback(
    async ({ transactions, callbackRoute }: DcscServiceProps) => {
      clearAllTransactions();

      const newSessionId = await signAndSendTransactions({
        transactions,
        callbackRoute,
        transactionsDisplayInfo: REMOVE_TAG_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    []
  );

  /**
   * C) Simple - Remove Tag
   */
  const sendRemoveTagTransactionSimple = useCallback(
    async ({ file_cid, tag, callbackRoute }: RemoveTagProps) => {
      clearAllTransactions();
      const encodedFileCid = toHex(file_cid);
      const encodedTag = toHex(tag);

      const dataField = `removeTag@${encodedFileCid}@${encodedTag}`;

      const transaction = newTransaction({
        value: '0',
        data: dataField,
        receiver: contractAddress,
        gasLimit: 60_000_000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: REMOVE_TAG_TRANSACTION_INFO
      });

      sessionStorage.setItem('dcscSessionId', newSessionId);
      setSessionId(newSessionId);
    },
    [address, account?.nonce, network?.chainId]
  );




  // ---------------------------------------------------------------------

  return {
    transactionStatus,

    // UPLOAD FILE
    sendUploadFileTransactionFromAbi,
    sendUploadFileTransactionFromService,
    sendUploadFileTransactionSimple,

    // ADD TAG
    sendAddTagTransactionFromAbi,
    sendAddTagTransactionFromService,
    sendAddTagTransactionSimple,

    // GET UPLOADED FILES
    sendGetUploadedFilesTransactionFromAbi,
    sendGetUploadedFilesTransactionFromService,
    sendGetUploadedFilesTransactionSimple,

    // REMOVE FILE
    sendRemoveFileTransactionFromAbi,
    sendRemoveFileTransactionFromService,
    sendRemoveFileTransactionSimple,

    // REMOVE TAG
    sendRemoveTagTransactionFromAbi,
    sendRemoveTagTransactionFromService,
    sendRemoveTagTransactionSimple
  };
};
