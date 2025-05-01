'use client';
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
          { /* Training TODO: Prompt the user to onboard their account if needed. */}
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
        {/* Training TODO: Display the onboarding form to the user if needed. */}
      </Container>
      <Container>
        <header className="mb-8 ml-2">
          <h1 className="text-xl font-semibold">Tax Settings</h1>
          <h2 className="text-subdued">Tax Account</h2>
        </header>
        {/* Training TODO: Display the tax settings. */}
      </Container>
    </>
  );
}
