import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { useTeamData } from '@/contexts/TeamData';
import { StudioParams, StudioParamsSchema } from '@/sharedTypes';

interface StudioFormProps {
  setOpen: (open: boolean) => void;
}

export function StudioForm({ setOpen }: StudioFormProps) {
  const { createStudio } = useTeamData();
  const { control, handleSubmit, formState } = useForm<StudioParams>({
    resolver: zodResolver(StudioParamsSchema),
    defaultValues: {
      name: '',
      maxCapacity: 10,
    },
  });

  const onSubmit = async (data: StudioParams) => {
    try {
      await createStudio(data);
      setOpen(false);
    } catch (error) {
      console.error('Error creating studio:', error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field
          control={control}
          name="name"
          label="Studio Name"
          placeholder="Red Lion"
        />
        <Field
          control={control}
          name="maxCapacity"
          label="Maximum Capacity"
          type="number"
        />
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full"
        >
          {formState.isSubmitting ? 'Creating...' : 'Create Studio'}
        </Button>
      </form>
    </>
  );
}

export default StudioForm;
