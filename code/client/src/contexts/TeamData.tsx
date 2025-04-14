import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  PropsWithChildren,
} from 'react';
import fetchClient from '../utils/fetchClient';
import {
  Instructor,
  Studio,
  StudioParams,
  InstructorParams,
} from '../sharedTypes';
import { useUserContext } from './UserData';
import { uniqBy } from '../helpers';

interface TeamDataContextValue {
  instructors: Instructor[];
  studios: Studio[];
  isLoading: boolean;
  error: string | null;
  createInstructor: (params: InstructorParams) => Promise<void>;
  createSampleInstructors: () => Promise<void>;
  createStudio: (params: StudioParams) => Promise<void>;
  createSampleStudios: () => Promise<void>;
  refreshData: () => Promise<void>;
  studioById: (id: Studio['id']) => Studio;
  instructorById: (id: Instructor['id']) => Instructor;
}

const TeamDataContext = createContext<TeamDataContextValue | null>(null);

export const TeamDataProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useUserContext(); // Get the logged-in user from UserContext
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const [studiosResponse, instructorsResponse] = await Promise.all([
        fetchClient.get<{ studios: Studio[] }>('/studios'),
        fetchClient.get<{ instructors: Instructor[] }>('/instructors'),
      ]);

      setStudios(studiosResponse.data.studios);

      setInstructors(instructorsResponse.data.instructors);
    } catch (err: any) {
      console.error('Error fetching team data:', err);
      setError(err.message || 'Failed to fetch team data');
    } finally {
      setIsLoading(false);
    }
  };

  const createStudio = async (params: StudioParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchClient.post<Studio>('/studios', params);
      setStudios((prev) => [...prev, response.data]);
    } catch (err: any) {
      console.error('Error creating studio:', err);
      setError(err.message || 'Failed to create studio');
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleStudios = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchClient.post<{ studios: Studio[] }>(
        '/studios/quickstart'
      );
      const { studios } = response.data;
      setStudios((prev) =>
        uniqBy([...prev, ...studios], (studio) => studio.id)
      );
    } catch (err: any) {
      console.error('Error creating sample studios:', err);
      setError(err.message || 'Failed to create sample studios');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new instructor
  const createInstructor = async (params: InstructorParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchClient.post<Instructor>(
        '/instructors',
        params
      );
      setInstructors((prev) => [...prev, response.data]);
    } catch (err: any) {
      console.error('Error creating instructor:', err);
      setError(err.message || 'Failed to create instructor');
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleInstructors = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchClient.post<{ instructors: Instructor[] }>(
        '/instructors/quickstart'
      );
      const { instructors } = response.data;
      setInstructors((prev) =>
        uniqBy([...prev, ...instructors], (instructor) => instructor.id)
      );
    } catch (err: any) {
      console.error('Error creating instructor:', err);
      setError(err.message || 'Failed to create instructor');
    } finally {
      setIsLoading(false);
    }
  };

  const studioById = (id: Studio['id']): Studio => {
    const studio = studios.find((studio: Studio) => studio.id === id);
    if (!studio) {
      throw new Error(`Studio with id ${id} not found`);
    }
    return studio;
  };

  const instructorById = (id: Instructor['id']): Instructor => {
    const instructor = instructors.find(
      (instructor: Instructor) => instructor.id === id
    );
    if (!instructor) {
      throw new Error(`Instructor with id ${id} not found`);
    }
    return instructor;
  };

  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const value: TeamDataContextValue = {
    instructors,
    studios,
    isLoading,
    error,
    createInstructor,
    createStudio,
    createSampleStudios,
    createSampleInstructors,
    refreshData,
    studioById,
    instructorById,
  };

  return (
    <TeamDataContext.Provider value={value}>
      {children}
    </TeamDataContext.Provider>
  );
};

export const useTeamData = (): TeamDataContextValue => {
  const context = useContext(TeamDataContext);
  if (!context) {
    throw new Error('useTeamData must be used within a TeamDataProvider');
  }
  return context;
};
