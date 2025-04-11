'use client';

import {
  ConnectAccountManagement,
  ConnectAccountOnboarding,
  ConnectNotificationBanner,
  ConnectTaxRegistrations,
  ConnectTaxSettings,
} from '@stripe/react-connect-js';
import Container from '@/components/Container';
import { useUserContext } from '@/contexts/UserData';

export default function Settings() {
  const { user, detailsSubmitted } = useUserContext();

  if (!user) throw new Error('User not found');

  return (
    <>
      <Container className="px-5 py-4">
        <h1 className="mb-4 text-xl font-semibold">Basic Details</h1>
        <div className="mb-4">
          <ConnectNotificationBanner />
        </div>
        <div className="flex flex-row space-x-20">
          <div>
            <div className="text-subdued">Studio Name</div>
            <div className="font-medium">Practice</div>
          </div>
          <div>
            <div className="text-subdued">Email</div>
            <div className="font-medium">{user.email}</div>
          </div>
        </div>
      </Container>
      <Container>
        <header className="mb-8 ml-2">
          <h1 className="text-xl font-semibold">Account Settings</h1>
          <h2 className="text-subdued">
            Account {detailsSubmitted ? 'Management' : 'Onboarding'}
          </h2>
        </header>
        {detailsSubmitted ? (
          <ConnectAccountManagement />
        ) : (
          <ConnectAccountOnboarding
            onExit={() => (window.location.href = '/account')}
          />
        )}
      </Container>
      <Container>
        <header className="mb-8 ml-2">
          <h1 className="text-xl font-semibold">Tax Settings</h1>
          <h2 className="text-subdued">Tax Account</h2>
        </header>

        <ConnectTaxSettings />
        <div className="h-8"> </div>
        <ConnectTaxRegistrations />
      </Container>
    </>
  );
}
