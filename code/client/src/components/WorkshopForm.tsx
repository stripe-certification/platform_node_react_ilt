'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, LoaderPage } from '@/components/ui';
import { Field } from './ui/Field';
import fetchClient from '../utils/fetchClient';
import {
  checkForConflicts,
  computeStartEnd,
  formatCurrency,
  getDurationOptions,
  timeOptions,
} from '@/helpers';
import {
  WorkshopParams,
  WorkshopParamsSchema,
  Instructor,
  Studio,
  Workshop,
} from '@/sharedTypes';

export default function WorkshopForm({
  setFormOpen,
  fetchWorkshops,
  workshops,
  instructors,
  studios,
}: {
  setFormOpen: Dispatch<SetStateAction<boolean>>;
  fetchWorkshops: () => void;
  workshops: Workshop[];
  instructors: Instructor[];
  studios: Studio[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState, setValue, watch } =
    useForm<WorkshopParams>({
      resolver: zodResolver(WorkshopParamsSchema),
      defaultValues: {
        name: '',
        instructorName: '',
        resourceName: '',
        resourceId: '',
        capacity: 0,
        date: new Date().toISOString().split('T')[0],
        startTime: '9:00',
        duration: 15,
      },
    });
  const startTime = watch('startTime');
  const durationOptions = getDurationOptions(startTime);

  const onSubmit = async (values: z.infer<typeof WorkshopParamsSchema>) => {
    const conflictError = checkForConflicts(workshops, values);

    if (conflictError) {
      setError(conflictError);
      return;
    }

    const { start, end } = computeStartEnd(values);

    const { date, startTime, duration, ...rest } = values;
    const transformedValues = {
      ...rest,
      start,
      end,
    };

    setLoading(true);
    try {
      await fetchClient.post('/workshops', transformedValues);

      fetchWorkshops();
      setFormOpen(false);
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Failed to create workshop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoaderPage />;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="mb-3 flex justify-center rounded-md bg-red-100 p-2 text-red-500">
            {error}
          </div>
        )}
        <Field
          control={control}
          name="name"
          label="Name"
          placeholder="Yoga Workshop"
        />

        <Field
          control={control}
          name="instructorName"
          label="Instructor"
          as="select"
          options={instructors.map((instructor) => ({
            value: instructor.name,
            label: instructor.name,
          }))}
        />
        <Field
          control={control}
          name="resourceName"
          label="Studio"
          as="select"
          options={studios.map((studio) => ({
            value: studio.name,
            label: studio.name,
          }))}
          setValues={(studioName, field) => {
            const studio = studios.find((s) => s.name === studioName);
            if (studio) {
              setValue('resourceId', studio.id);
              field.onChange(studio.name);
            }
          }}
        />
        <Field
          type="number"
          control={control}
          name="capacity"
          label="Capacity"
          placeholder="10"
        />
        <Field
          type="number"
          control={control}
          name="amount"
          label="Amount"
          placeholder={formatCurrency(0)}
        />
        <Field
          type="date"
          control={control}
          name="date"
          label="Date"
          placeholder="2021-01-01"
        />
        <Field
          control={control}
          name="startTime"
          label="Start Time"
          placeholder="Select a time"
          as="select"
          options={timeOptions}
        />
        <Field
          control={control}
          name="duration"
          label="Duration"
          placeholder="15"
          as="select"
          options={durationOptions}
        />
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full"
        >
          {formState.isSubmitting ? 'Creating...' : 'Create Workshop'}
        </Button>
      </form>
    </>
  );
}
