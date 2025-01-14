import { PropsWithChildren, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { RouteNamesEnum } from '@/localConstants';
import { useGetIsLoggedIn } from '../../hooks';
import { useRouter } from 'next/navigation';

interface AuthRedirectWrapperPropsType extends PropsWithChildren {
  requireAuth?: boolean;
}

export const AuthRedirectWrapper = ({
  children,
  requireAuth = true
}: AuthRedirectWrapperPropsType) => {
  const isLoggedIn = useGetIsLoggedIn();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && !requireAuth) {
      router.push(RouteNamesEnum.dashboard);

      return;
    }

    if (!isLoggedIn && requireAuth) {
      router.push(RouteNamesEnum.unlock);
    }
  }, [isLoggedIn]);

  return <>{children}</>;
};
