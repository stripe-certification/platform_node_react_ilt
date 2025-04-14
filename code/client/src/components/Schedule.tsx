import { useEffect, useState } from 'react';
import fetchClient from '../utils/fetchClient';
import { Studio, Workshop } from '@/sharedTypes';
import { calendarCss } from '@/constants';
import {
  Calendar,
  Components,
  EventProps,
  momentLocalizer,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { css, Global } from '@emotion/react';
import { Button } from '@/components/ui/Button';
import {
  CalendarPlus as PlusIcon,
  ArrowUpFromLine as QuickSetupIcon,
} from 'lucide-react';
import WorkshopDayEvent from '@/components/WorkshopDayEvent';
import WorkshopAgendaEvent from '@/components/WorkshopAgendaEvent';
import { LoaderPage, Modal } from './ui';
import WorkshopForm from './WorkshopForm';
import { useUserContext } from '@/contexts/UserData';
import { useTeamData } from '@/contexts/TeamData';

moment.locale('en-GB');

const Schedule = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [workshopsLoading, setWorkshopsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const { isChargesEnabled } = useUserContext();
  const { studios, isLoading: isTeamLoading } = useTeamData();
  const [error, setError] = useState<any>(null);

  const fetchWorkshops = async () => {
    setError(null);
    setWorkshopsLoading(true);
    try {
      const workshops = await fetchClient.get('/workshops');

      setWorkshops(workshops.data.workshops);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      setError('Failed to fetch workshops. Please try again.');
    } finally {
      setWorkshopsLoading(false);
    }
  };
  useEffect(() => {
    fetchWorkshops();
  }, []);

  const components: Components<Workshop, Studio> = {
    event: ({ event }: { event: Workshop }) => {
      return <WorkshopDayEvent event={event} />;
    },
    agenda: {
      event: ({ event }: EventProps<Workshop>) => {
        return <WorkshopAgendaEvent {...event} />;
      },
    },
  };

  if (workshopsLoading || isTeamLoading) {
    return <LoaderPage />;
  }

  return (
    <>
      <Global
        styles={css`
          ${calendarCss}
        `}
      />
      {error && (
        <div className="mb-3 flex justify-center rounded-md bg-red-100 p-2 text-red-500">
          {error}
        </div>
      )}
      <div className="mb-3 flex gap-3">
        <h1 className="flex-1 text-3xl font-bold">Workshops</h1>
        <Button
          onClick={async () => {
            setWorkshopsLoading(true);
            try {
              await fetchClient.post('/workshops/quickstart');
              fetchWorkshops();
            } catch (err) {
              setError('Failed to seed workshops. Please try again.');
              console.error(err);
            } finally {
              setWorkshopsLoading(false);
            }
          }}
          className="gap-2 bg-white text-base font-medium text-primary shadow transition hover:shadow-md"
          disabled={
            workshopsLoading || !isChargesEnabled || workshops.length > 0
          }
        >
          <QuickSetupIcon className="h-5 w-5"></QuickSetupIcon>
          Quick Setup
        </Button>
        <Button
          onClick={() => {
            setFormOpen(true);
          }}
          className="gap-2 bg-[#312356] text-base font-bold shadow transition hover:shadow-md"
          disabled={workshopsLoading || !isChargesEnabled}
        >
          <PlusIcon className="h-5 w-5"></PlusIcon>
          Create Class
        </Button>
      </div>
      <Calendar
        components={components}
        events={workshops}
        defaultView={'agenda'}
        views={['day', 'agenda']}
        resources={studios}
        titleAccessor={(event) => event.name}
        startAccessor={(event) => new Date(event.start)}
        endAccessor={(event) => new Date(event.end)}
        resourceAccessor={(event) => event.studioId}
        resourceTitleAccessor={(resource) => resource.name}
        resourceIdAccessor={(resource) => resource.id}
        defaultDate={new Date()}
        max={moment().hours(18).minutes(0).seconds(0).toDate()}
        min={moment().hours(9).minutes(0).seconds(0).toDate()}
        step={60}
        timeslots={1}
        localizer={momentLocalizer(moment)}
        style={{
          minHeight: `800px`,
          overflow: 'auto',
          height: 'auto',
        }}
      />
      <Modal
        title="Create Workshop"
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
      >
        <WorkshopForm
          setFormOpen={setFormOpen}
          fetchWorkshops={fetchWorkshops}
          workshops={workshops}
        />
      </Modal>
    </>
  );
};

export default Schedule;
