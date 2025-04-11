import { Workshop } from '@/sharedTypes';
import { Popover, Typography } from '@mui/material';
import { useState } from 'react';
import { formatCurrency } from '@/helpers';

const WorkshopDayEvent = ({ event }: { event: Workshop }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <div
        onClick={handleClick}
        className="h-full w-full cursor-pointer truncate px-1 py-0.5 text-xs"
      ></div>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div className="flex max-w-xs flex-col gap-2 rounded-xl bg-[#fffaf6] px-4 py-3 text-xl shadow-lg ring-1 ring-[#f26552]/20">
          <Typography
            variant="subtitle2"
            className="text-xl font-semibold text-[#f26552]"
          >
            {event.name}
          </Typography>
          <Typography variant="body2" className="text-lg text-gray-700">
            Instructor: {event.instructorName}
          </Typography>
          <Typography variant="body2" className="text-lg text-gray-700">
            Attendees: {event.attendees}/{event.capacity}
          </Typography>
          <Typography variant="body2" className="text-lg text-gray-700">
            {formatCurrency(event.amount)}
          </Typography>
        </div>
      </Popover>
    </>
  );
};

export default WorkshopDayEvent;
