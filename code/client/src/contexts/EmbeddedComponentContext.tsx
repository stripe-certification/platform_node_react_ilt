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
    // Training TODO: Configure a StripeConectInstance that can be used with the
    // ConnectComponentsProvider.
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
