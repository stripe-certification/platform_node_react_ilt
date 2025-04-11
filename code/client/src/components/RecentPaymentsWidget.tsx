'use client';

import React from 'react';
import Link from 'next/link';
import Container from './Container';
import { ChevronRight } from 'lucide-react';

const BalanceWidget = () => {
  return (
    <Container className="px-5">
      <div className="space-y-1">
        <div className="flex flex-row justify-between">
          <div>
            <h1 className="font-bold text-subdued">Recent Payments</h1>
          </div>
          <div>
            <Link href={`/payments`} className="flex flex-row items-center">
              <div className="text-sm font-bold text-primary">View All</div>
              <ChevronRight color="#221b35" size={18} className="mt-[1px]" />
            </Link>
          </div>
        </div>
        <div>
          <ul>
            {/* TODO: charges will not be stored in the database */}
            {/* {session?.user.charges.map((charge, i) => (
              <li
                key={i}
                className="flex flex-row justify-between text-subdued"
              >
                <div>{charge.description}</div>
                <div>
                  {currencyToCurrencySign(charge.currency)}
                  {(
                    charge.amount / (charge.currency !== 'jpy' ? 100 : 1)
                  ).toFixed(2)}
                </div>
              </li>
            ))} */}
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default BalanceWidget;
