// app/page.tsx
'use client';

import { useState, ChangeEvent } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [cidInput, setCidInput] = useState('');
  const [uploadedCid, setUploadedCid] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.cid) {
      setUploadedCid(data.cid);
    } else {
      console.error('Upload failed', data.error);
    }
  };

  const getFile = async () => {
    if (!cidInput) return;

    const response = await fetch(`/api/getFile?cid=${cidInput}`);
    if (!response.ok) {
      console.error('Error fetching file');
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <main>
      <h1>IPFS File Upload & Retrieve</h1>

      <section>
        <h2>Upload a File</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadFile}>Upload to IPFS</button>
        {uploadedCid && <p>Uploaded File CID: {uploadedCid}</p>}
      </section>

      <section>
        <h2>Retrieve a File</h2>
        <input
          type="text"
          placeholder="Enter CID"
          value={cidInput}
          onChange={(e) => setCidInput(e.target.value)}
        />
        <button onClick={getFile}>Fetch File from IPFS</button>
      </section>
    </main>
  );
}
