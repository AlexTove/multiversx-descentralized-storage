"use client";
import {
  type ExtensionLoginButtonPropsType,
  type WebWalletLoginButtonPropsType,
  type OperaWalletLoginButtonPropsType,
  type LedgerLoginButtonPropsType,
  type WalletConnectLoginButtonPropsType
} from '@multiversx/sdk-dapp/UI';
import {
  ExtensionLoginButton,
  LedgerLoginButton,
  OperaWalletLoginButton,
  WalletConnectLoginButton,
  WebWalletLoginButton as WebWalletUrlLoginButton,
  CrossWindowLoginButton
} from '@/components/sdkDappComponents';
import { nativeAuth } from '@/config/config.devnet';
import { RouteNamesEnum } from '@/localConstants';
import { AuthRedirectWrapper } from '@/wrappers';
import {
  IframeButton,
  WebWalletLoginWrapper,
  XaliasLoginWrapper
} from './components';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { useIframeLogin } from '@multiversx/sdk-dapp/hooks/login/useIframeLogin';
import { useWindowSize } from '@/hooks';
import { useRouter } from 'next/navigation';

type CommonPropsType =
  | OperaWalletLoginButtonPropsType
  | ExtensionLoginButtonPropsType
  | WebWalletLoginButtonPropsType
  | LedgerLoginButtonPropsType
  | WalletConnectLoginButtonPropsType;

// choose how you want to configure connecting to the web wallet
const USE_WEB_WALLET_CROSS_WINDOW = true;

const WebWalletLoginButton = USE_WEB_WALLET_CROSS_WINDOW
  ? CrossWindowLoginButton
  : WebWalletUrlLoginButton;

export default function Unlock() {
  const router = useRouter();
  const { width } = useWindowSize();

  const [onInitiateLogin, { isLoading }] = useIframeLogin({
    callbackRoute: RouteNamesEnum.dashboard,
    nativeAuth,
    onLoginRedirect: () => {
      router.push(RouteNamesEnum.dashboard);
    }
  });

  const isMobile = width < 768;
  const commonProps: CommonPropsType = {
    callbackRoute: RouteNamesEnum.dashboard,
    nativeAuth,
    onLoginRedirect: () => {
      router.push(RouteNamesEnum.dashboard);
    },
    disabled: isLoading
  };

  return (
    <AuthRedirectWrapper requireAuth={false}>
      <div className='flex justify-center items-center '>
        <div
          className='flex flex-col p-6 items-center justify-center gap-4 rounded-xl'
          data-testid='unlockPage'
        >
          <div className='flex flex-col items-center gap-1'>
            <h2 className='text-2xl'>Login</h2>

            <p className='text-center text-gray-400'>Choose a login method</p>
          </div>

          <div className='flex flex-col md:flex-row'>
            <WalletConnectLoginButton
              className='!bg-white !text-black'
              loginButtonText='xPortal App'
              {...commonProps}
            />
            <LedgerLoginButton 
              className='!bg-white !text-black'
              loginButtonText='Ledger' {...commonProps} />
            <ExtensionLoginButton
              className='!bg-white !text-black'
              loginButtonText='DeFi Wallet'
              {...commonProps}
            />
            <OperaWalletLoginButton
              className='!bg-white !text-black'
              loginButtonText='Opera Crypto Wallet - Beta'
              {...commonProps}
            />
              
            <XaliasLoginWrapper  className='!bg-white !text-black' {...commonProps} />
            <WebWalletLoginWrapper className='!bg-white !text-black' {...commonProps} />
            {isMobile && (
              <IframeButton
                loginButtonText='Passkey Proxy'
                className='!bg-white !text-black'
                {...commonProps}
                onClick={() => onInitiateLogin(IframeLoginTypes.passkey)}
              />
            )}

            <IframeButton
              loginButtonText='Metamask Proxy'
              className='!bg-white !text-black'
              {...commonProps}
              onClick={() => onInitiateLogin(IframeLoginTypes.metamask)}
            />
          </div>
        </div>
      </div>
    </AuthRedirectWrapper>
  );
};
