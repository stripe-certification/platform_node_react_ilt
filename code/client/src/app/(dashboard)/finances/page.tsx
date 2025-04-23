'use client';
import {
  ConnectCapitalFinancing,
  ConnectCapitalFinancingApplication,
  ConnectCapitalFinancingPromotion,
} from '@stripe/react-connect-js';
import Container from '@/components/Container';

export default function Finances() {
  return (
    <>
      <h1 className="text-3xl font-bold">Finance</h1>
      <Container>
        <ConnectCapitalFinancing />
        <ConnectCapitalFinancingPromotion />
      </Container>
    </>
  );
}
