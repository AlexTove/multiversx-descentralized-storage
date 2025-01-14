// pages/interactive-tutorial.tsx

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Joyride, { CallBackProps, Step } from "react-joyride";
import { Button } from "@/components/ui/button";

import Unlock from "@/components/unlock/page";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

const InteractiveTutorial: React.FC = () => {
  const [runTour, setRunTour] = useState<boolean>(true);
  const router = useRouter();
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const steps: Step[] = [
    {
      target: "#wallet-connect",
      content: "Connect your MultiversX wallet here to access all features!",
    },
    {
      target: "#file-upload",
      content: "Drag and drop files here to upload them to IPFS.",
    },
    {
      target: "#file-sharing",
      content: "Click here to share your uploaded files with others.",
    },
  ];

  const connect = () => {
    setIsUnlockModalOpen(true)
  };

  const handleTourCallback = (data: CallBackProps) => {
    if (data.status === "finished") {
      setRunTour(false);
      router.push("/dashboard"); // Redirect to dashboard after tutorial
    }
  };

  return (
    <>
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Interactive Tutorial</h1>
          <p className="text-lg mb-6">
            Learn how to use the platform with this step-by-step guide.
          </p>

          {/* Wallet Connection Example */}
          <div id="wallet-connect" className="mb-6">
          <Button onClick={connect}>Connect Wallet</Button>
          </div>

          {/* File Upload Example */}
          <div id="file-upload" className="mb-6">
            <div className="border-dashed border-2 p-4">
              Drag and drop files here to upload.
            </div>
          </div>

          {/* File Sharing Example */}
          <div id="file-sharing" className="mb-6">
            <button className="btn btn-secondary">Share File</button>
          </div>

          {/* Joyride Tour */}
          <Joyride
            steps={steps}
            continuous
            run={runTour}
            showProgress
            showSkipButton
            styles={{
              options: {
                zIndex: 1000,
              },
            }}
            callback={handleTourCallback}
          />
        </div>
      </section>
      <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
        <DialogContent className="max-w-6xl w-full max-h-screen overflow-auto p-6">
          <DialogHeader>
            <DialogTitle>Unlock Your Wallet</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Unlock />
          </div>
          <DialogClose className="mt-6 flex justify-end">
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InteractiveTutorial;
