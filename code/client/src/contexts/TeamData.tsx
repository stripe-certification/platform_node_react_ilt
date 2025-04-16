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
  //These two collections are private state to facilitate finding by id and are not
  //exposed to the context
  const [instructorsById, setInstructorsById] = useState<
    Map<string, Instructor>
  >(new Map());
  const [studiosById, setStudiosById] = useState<Map<string, Studio>>(
    new Map()
  );
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studiosById) setStudios(Array.from(studiosById.values()));
    if (instructorsById) setInstructors(Array.from(instructorsById.values()));
  }, [studiosById, instructorsById]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const [studiosResponse, instructorsResponse] = await Promise.all([
        fetchClient.get<{ studios: Studio[] }>('/studios'),
        fetchClient.get<{ instructors: Instructor[] }>('/instructors'),
      ]);
      const newStudiosById = new Map<string, Studio>();
      studiosResponse.data.studios.forEach((studio) => {
        newStudiosById.set(studio.id, studio);
      });

      const newInstructorsById = new Map<string, Instructor>();
      instructorsResponse.data.instructors.forEach((instructor) => {
        newInstructorsById.set(instructor.id, instructor);
      });

      setStudiosById(newStudiosById);
      setInstructorsById(newInstructorsById);
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
      setStudiosById(new Map(studiosById).set(response.data.id, response.data));
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
      const newStudiosById = new Map<string, Studio>();
      response.data.studios.forEach((studio) => {
        newStudiosById.set(studio.id, studio);
      });

      setStudiosById(newStudiosById);
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
      setInstructorsById(
        new Map(instructorsById).set(response.data.id, response.data)
      );
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
      const newInstructorsById = new Map<string, Instructor>();
      instructors.forEach((instructor) => {
        newInstructorsById.set(instructor.id, instructor);
      });

      setInstructorsById(newInstructorsById);
    } catch (err: any) {
      console.error('Error creating instructor:', err);
      setError(err.message || 'Failed to create instructor');
    } finally {
      setIsLoading(false);
    }
  };

  const studioById = (id: Studio['id']): Studio => {
    if (!studiosById || !studiosById.size) {
      throw new Error('Studios are not available');
    }
    const studio = studiosById.get(id);
    if (!studio) {
      throw new Error(`Studio with id ${id} not found`);
    }
    return studio;
  };

  const instructorById = (id: Instructor['id']): Instructor => {
    if (!instructorsById || !instructorsById.size) {
      throw new Error('Instructors are not available');
    }
    const instructor = instructorsById.get(id);

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
