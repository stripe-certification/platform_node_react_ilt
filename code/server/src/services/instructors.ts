import crypto from 'crypto';
import { dbService } from './db';
import { Instructor, InstructorParams } from '../sharedTypes';
import { faker } from '@faker-js/faker';

export async function createInstructor(data: InstructorParams, userId: string) {
    const id = `instrct_${crypto.randomUUID()}`;

    const instructor: Instructor = {
        ...data,
        id,
        userId,
    };

    await dbService.saveData('instructors', id, instructor);

    return instructor;
}

export async function createSampleInstructor(userId: string) {
    const sex = faker.person.sexType();
    const sampleInstructorParams: InstructorParams = {
        name: `${faker.person.firstName(sex)} ${faker.person.lastName(sex)}`,
        profilePhoto: faker.image.personPortrait({ sex })
    };

    return createInstructor(sampleInstructorParams, userId);
}

export async function getInstructor(instructorId: string) {
    const instructor = dbService.loadData('instructors', instructorId);
    if (!instructor) throw new Error('Instructor not found');
    return instructor;
}

export async function listInstructors(userId: string) {
    const instructors = dbService.searchData(
        'instructors',
        (item) => item.userId === userId
    );
    if (!instructors) throw new Error('Instructors not found');

    return instructors;
}

export default {
    createInstructor,
    createSampleInstructor,
    getInstructor,
    listInstructors,
};