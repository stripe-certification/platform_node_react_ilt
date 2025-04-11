import { Workshop } from '@/sharedTypes';
import { CopyButton } from './CopyButton';
import { useUserContext } from '@/contexts/UserData';
import { formatCurrency } from '@/helpers';

const WorkshopAgendaEvent = (event: Workshop) => {
  const {
    name,
    attendees,
    capacity,
    id,
    paymentLinkUrl,
    instructorName,
    resourceName,
    amount,
  } = event;

  const { isChargesEnabled } = useUserContext();
  return (
    <div className="flex h-auto flex-col justify-between gap-2" key={id}>
      <div className="flex justify-center bg-[#fffaf6] text-lg font-bold text-[#f26552]">
        {resourceName}
      </div>
      <div className="flex flex-1 flex-row gap-4">
        <div className="flex basis-1/2 flex-col gap-2">
          <div className="flex items-center gap-2 text-wrap text-sm font-bold">
            {name}
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            Instructor: <span className="text-gray-500">{instructorName}</span>
          </div>
        </div>

        <div className="flex basis-1/2 flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-bold">
            Attendees:{' '}
            <span className="text-gray-500">
              {attendees}/{capacity}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="text-gray-500">{formatCurrency(amount)}</span>
          </div>
        </div>
        <div className="flex items-start">
          <CopyButton
            paymentLinkUrl={paymentLinkUrl}
            isChargesEnabled={isChargesEnabled}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkshopAgendaEvent;
