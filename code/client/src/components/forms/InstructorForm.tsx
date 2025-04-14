import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { useTeamData } from '@/contexts/TeamData';
import { InstructorParams, InstructorParamsSchema } from '@/sharedTypes';
import { PROFILE_PHOTO_PLACEHOLDER } from '@/constants';

interface InstructorFormProps {
  setOpen: (open: boolean) => void;
}

export function InstructorForm({ setOpen }: InstructorFormProps) {
  const { createInstructor, refreshData } = useTeamData();
  const { control, handleSubmit, formState } = useForm<InstructorParams>({
    resolver: zodResolver(InstructorParamsSchema),
    defaultValues: {
      name: '',
      profilePhoto: PROFILE_PHOTO_PLACEHOLDER,
    },
  });

  const onSubmit = async (data: InstructorParams) => {
    try {
      await createInstructor(data);

      refreshData();
      setOpen(false);
    } catch (error) {
      console.error('Error creating instructor:', error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field
          control={control}
          name="name"
          label="Name"
          placeholder="Jenny Rosen"
        />
        <Field
          control={control}
          name="profilePhoto"
          label="Profile Photo URL"
          placeholder={PROFILE_PHOTO_PLACEHOLDER}
          type="url"
          description="Optional: A URL to the instructor's profile photo."
        />
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full"
        >
          {formState.isSubmitting ? 'Creating...' : 'Create Instructor'}
        </Button>
      </form>
    </>
  );
}

export default InstructorForm;
