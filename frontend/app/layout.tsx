'use client';

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClientProviders } from './ClientProviders';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import {
  AxiosInterceptorContext,
  DappProvider,
  SignTransactionsModals,
  TransactionsToastList
  // ... other imports
} from '@/lib/sdkDappComponents';
import {
  apiTimeout,
  walletConnectV2ProjectId,
  environment,
  sampleAuthenticatedDomains
} from '@/config/config.devnet';
import { RouteNamesEnum } from '@/localConstants';
import { BatchTransactionsContextProvider } from '@/wrappers';
const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'DecentralStore - IPFS File Management',
//   description: 'Decentralized file storage powered by IPFS and MultiversX',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;

}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AxiosInterceptorContext.Provider>
            <AxiosInterceptorContext.Interceptor
              authenticatedDomains={sampleAuthenticatedDomains}
            >
              <BatchTransactionsContextProvider>
                <DappProvider
                  environment={environment}
                  customNetworkConfig={{
                    name: 'customConfig',
                    apiTimeout,
                    walletConnectV2ProjectId
                  }}
                  dappConfig={{
                    shouldUseWebViewProvider: true,
                    logoutRoute: RouteNamesEnum.unlock
                  }}
                  customComponents={{
                    transactionTracker: {
                      // uncomment this to use the custom transaction tracker
                      // component: TransactionsTracker,
                      props: {
                        onSuccess: (sessionId: string) => {
                          console.log(`Session ${sessionId} successfully completed`);
                        },
                        onFail: (sessionId: string, errorMessage: string) => {
                          console.log(`Session ${sessionId} failed. ${errorMessage ?? ''}`);
                        }
                      }
                    }
                  }}
                >
                  <AxiosInterceptorContext.Listener>
                    {children}
                    <SignTransactionsModals />
                    <TransactionsToastList 
                    transactionToastClassName='!bg-neutral-600	 text-white !rounded-lg border'
                    />

                    <Toaster />
                  </AxiosInterceptorContext.Listener>
                </DappProvider>
              </BatchTransactionsContextProvider>

            </AxiosInterceptorContext.Interceptor>
          </AxiosInterceptorContext.Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}