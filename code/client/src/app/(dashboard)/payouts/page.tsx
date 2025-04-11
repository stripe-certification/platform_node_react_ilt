'use client';

import { ConnectPayouts } from '@stripe/react-connect-js';
import Container from '@/components/Container';

export default function Payouts() {
  return (
    <>
      <h1 className="text-3xl font-bold">Payouts</h1>
      <Container>
        <ConnectPayouts />
      </Container>
    </>
  );
}
