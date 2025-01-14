"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileText, Upload, FolderOpen } from "lucide-react";
import { useGetIsLoggedIn } from '@/hooks';
import { RouteNamesEnum } from '@/localConstants';
import { logout } from '@/helpers';
import { useRouter } from 'next/navigation';
import { environment } from '@/config/config.devnet';
import { useGetAccountInfo, useGetNetworkConfig } from '@/hooks';
import { useState } from "react";
import Unlock from "@/components/unlock/page";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

const callbackUrl = window.location.origin;
const onRedirect = undefined; // use this to redirect with useNavigate to a specific page after logout
const shouldAttemptReLogin = false; // use for special cases where you want to re-login after logout
const options = {
  /*
   * @param {boolean} [shouldBroadcastLogoutAcrossTabs=true]
   * @description If your dApp supports multiple accounts on multiple tabs,
   * this param will broadcast the logout event across all tabs.
   */
  shouldBroadcastLogoutAcrossTabs: true,
  /*
   * @param {boolean} [hasConsentPopup=false]
   * @description Set it to true if you want to perform async calls before logging out on Safari.
   * It will open a consent popup for the user to confirm the action before leaving the page.
   */
  hasConsentPopup: false
};

export function Navbar() {
  const router = useRouter();
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const isLoggedIn = useGetIsLoggedIn();
  // const isUnlockRoute = Boolean(useMatch(RouteNamesEnum.unlock));

  // const ConnectButton = isUnlockRoute ? null : (
  //   <MxLink to={RouteNamesEnum.unlock}>Connect</MxLink>
  // );

  const { address, account } = useGetAccountInfo();

  const connect = () => {
    setIsUnlockModalOpen(true)
  };

  const handleLogout = () => {
    sessionStorage.clear();
    logout(
      callbackUrl,
      onRedirect,
      shouldAttemptReLogin,
      options
    );
  };

  return (
    <>
      <nav className="border-b">
        <div className="flex h-16 items-center px-4 container mx-auto">

          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="text-lg font-bold">DecentralStore</span>
          </Link>

          {isLoggedIn && (
            <div className="ml-8 flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <FolderOpen className="h-4 w-4" />
                <span>My Files</span>
              </Link>
            </div>
          )}

          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <p className=''>{environment}</p>
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <Button onClick={handleLogout} variant="outline">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connect}>Connect Wallet</Button>
            )}
          </div>
        </div>
      </nav>
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
}