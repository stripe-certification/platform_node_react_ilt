import { useState } from 'react';
import { Copy as CopyIcon } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

export const CopyButton = ({
  paymentLinkUrl,
  isChargesEnabled,
}: {
  paymentLinkUrl: string;
  isChargesEnabled: boolean;
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(paymentLinkUrl);
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
  };

  return (
    <Tooltip
      title="Copied to clipboard!"
      open={tooltipOpen}
      onClose={() => setTooltipOpen(false)}
    >
      <span>
        <IconButton
          disabled={!isChargesEnabled}
          onClick={handleClick}
          color="primary"
        >
          <CopyIcon className="h-5 w-5" color="black" />
        </IconButton>
      </span>
    </Tooltip>
  );
};
