import { useEffect, useState } from 'react';
import { type StripeConnectInstance } from '@stripe/connect-js/pure';
import { loadConnectAndInitialize } from '@stripe/connect-js/pure';
import fetchClient from '../utils/fetchClient';
import { useUserContext } from '@/contexts/UserData';
import { ConnectComponentsProvider } from '@stripe/react-connect-js';
import LoaderPage from '../components/ui/LoaderPage';

export const EmbeddedComponentContext = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [stripeConnectInstance, setStripeConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const { isLoggedIn } = useUserContext();
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey)
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');

  useEffect(() => {
    const fetchClientSecret = async () => {
      const { data } = await fetchClient.post('/account-sessions');
      if (!data.client_secret) {
        return;
      }

      return data.client_secret;
    };

    if (!isLoggedIn) return;
    if (stripeConnectInstance !== null) return;
    setStripeConnectInstance(
      loadConnectAndInitialize({
        publishableKey,
        fetchClientSecret,
        appearance: {
          overlays: 'dialog',
          variables: {
            fontFamily: 'Sohne, inherit',

            colorPrimary: '#312356',

            buttonPrimaryColorBackground: '#312356',
            buttonPrimaryColorText: '#f4f4f5',

            badgeSuccessColorBackground: '#D7F4CC',
            badgeSuccessColorText: '#264F47',
            badgeSuccessColorBorder: '#BDDAB3',

            badgeWarningColorBackground: '#FFEACC',
            badgeWarningColorText: '#C95B4D',
            badgeWarningColorBorder: '#FFD28C',

            badgeDangerColorBackground: '#FFEACC',
            badgeDangerColorText: '#C95B4D',
            badgeDangerColorBorder: '#FFD28C',
          },
        },
      })
    );
  }, [stripeConnectInstance, isLoggedIn, publishableKey]);

  if (!isLoggedIn) return children;

  if (stripeConnectInstance === null) {
    return <LoaderPage />;
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      {children}
    </ConnectComponentsProvider>
  );
};
