"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createStudent(data: {
    name: string;
    email?: string;
    phone?: string;
    courseId: string;
    tenantId: string;
}) {
    const { data: student, error } = await supabase
        .from('Student')
        .insert({
            ...data,
            status: "ACTIVE",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating student:", error);
        throw new Error(error.message);
    }

    // Also create/sync User account if email exists
    if (student.email) {
        const hashedPassword = await bcrypt.hash("Mudar@123", 10);
        const { error: userError } = await supabase
            .from('User')
            .upsert({
                email: student.email,
                name: student.name,
                password: hashedPassword,
                tenantId: student.tenantId,
                role: 'STUDENT',
                studentId: student.id
            }, { onConflict: 'email' });

        if (userError) console.error("Error creating student user:", userError);
    }

    revalidatePath("/dashboard/academic");
    revalidatePath("/dashboard");
    return student;
}

export async function updateStudent(id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    status: string;
    courseId: string;
}>) {
    const { data: student, error } = await supabase
        .from('Student')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating student:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/academic");
    return student;
}

export async function deleteStudent(id: string) {
    const { error } = await supabase
        .from('Student')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting student:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/academic");
    revalidatePath("/dashboard");
}

// Helper for conflict detection
async function checkRoomConflict(tenantId: string, room: string, scheduleString: string, excludeClassId?: string) {
    if (!room || !scheduleString) return null;

    const normalizedRoom = room.trim();

    // Fetch classes in the same room
    let query = supabase
        .from('Class')
        .select('name, schedule')
        .eq('tenantId', tenantId)
        .eq('room', normalizedRoom);

    if (excludeClassId) {
        query = query.neq('id', excludeClassId);
    }

    const { data: existingClasses, error } = await query;

    if (error) {
        console.error("Error checking room conflict:", error);
        return null;
    }

    return checkOverlap(existingClasses, scheduleString, (existing, newSlot, oldSlot) => {
        return `Conflito de Sala! A sala "${normalizedRoom}" já está ocupada por "${existing.name}" (${newSlot.day} ${oldSlot.start}-${oldSlot.end}).`;
    });
}

// Helper for Class Name (Student Group) conflict
async function checkClassConflict(tenantId: string, className: string, scheduleString: string, excludeClassId?: string) {
    if (!className || !scheduleString) return null;

    // Fetch classes with the same Name (Cohort)
    let query = supabase
        .from('Class')
        .select('*, subject:Subject(*)')
        .eq('tenantId', tenantId)
        .eq('name', className);

    if (excludeClassId) {
        query = query.neq('id', excludeClassId);
    }

    const { data: existingClasses, error } = await query;

    if (error) {
        console.error("Error checking class conflict:", error);
        return null;
    }

    return checkOverlap(existingClasses, scheduleString, (existing, newSlot, oldSlot) => {
        const subjectName = (existing as any).subject?.name || "Outra disciplina";
        return `Conflito de Turma! A turma "${className}" já tem aula de "${subjectName}" agendada para ${newSlot.day} ${oldSlot.start}-${oldSlot.end}.`;
    });
}

function checkOverlap(
    existingClasses: { name: string, schedule: string | null }[],
    newScheduleString: string,
    onOverlap: (existing: any, newSlot: any, oldSlot: any) => string
): string | null {
    let newSchedules: { day: string, start: string, end: string }[] = [];
    try { newSchedules = JSON.parse(newScheduleString); } catch { return null; }

    if (Array.isArray(newSchedules)) {
        for (const existing of existingClasses) {
            if (!existing.schedule) continue;
            let existingSchedules: any[] = [];
            try { existingSchedules = JSON.parse(existing.schedule); } catch { continue; }

            if (!Array.isArray(existingSchedules)) continue;

            for (const newSlot of newSchedules) {
                for (const oldSlot of existingSchedules) {
                    if (newSlot.day === oldSlot.day) {
                        // Check time overlap
                        if (newSlot.start < oldSlot.end && newSlot.end > oldSlot.start) {
                            return onOverlap(existing, newSlot, oldSlot);
                        }
                    }
                }
            }
        }
    }
    return null;
}

export async function createClass(data: {
    name: string;
    subjectId: string;
    schedule?: string;
    room?: string;
    teacherId?: string;
    tenantId: string;
}) {
    try {
        const cleanData = { ...data, room: data.room?.trim() };

        if (cleanData.schedule) {
            if (cleanData.room) {
                const roomError = await checkRoomConflict(cleanData.tenantId, cleanData.room, cleanData.schedule);
                if (roomError) return { success: false, error: roomError };
            }
            const classError = await checkClassConflict(cleanData.tenantId, cleanData.name, cleanData.schedule);
            if (classError) return { success: false, error: classError };
        }

        const { data: cls, error } = await supabase
            .from('Class')
            .insert(cleanData)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/academic");
        return { success: true, data: cls };
    } catch (error: any) {
        return { success: false, error: error.message || "Erro desconhecido" };
    }
}

export async function updateClass(id: string, data: Partial<{
    name: string;
    subjectId: string;
    schedule: string;
    room: string;
    teacherId: string;
}>) {
    try {
        const { data: currentClass, error: fetchError } = await supabase
            .from('Class')
            .select('tenantId, room, schedule, name')
            .eq('id', id)
            .single();

        if (fetchError || !currentClass) return { success: false, error: "Turma não encontrada" };

        const finalRoom = (data.room !== undefined ? data.room : currentClass.room)?.trim();
        const finalSchedule = data.schedule !== undefined ? data.schedule : currentClass.schedule;
        const finalName = data.name || currentClass.name;

        if (finalSchedule) {
            if (finalRoom) {
                const roomError = await checkRoomConflict(currentClass.tenantId, finalRoom, finalSchedule, id);
                if (roomError) return { success: false, error: roomError };
            }
            const classError = await checkClassConflict(currentClass.tenantId, finalName, finalSchedule, id);
            if (classError) return { success: false, error: classError };
        }

        const { data: cls, error: updateError } = await supabase
            .from('Class')
            .update({ ...data, room: data.room?.trim() })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        revalidatePath("/dashboard/academic");
        return { success: true, data: cls };
    } catch (error: any) {
        return { success: false, error: error.message || "Erro desconhecido" };
    }
}

export async function deleteClass(id: string) {
    const { error } = await supabase
        .from('Class')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting class:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/academic");
}

export async function getCourseDashboardData(courseId: string) {
    try {
        // 1. Fetch Course & Subjects
        const { data: course, error: courseError } = await supabase
            .from('Course')
            .select(`
                *,
                subjects:Subject (*)
            `)
            .eq('id', courseId)
            .single();

        if (courseError) throw courseError;

        // 2. Fetch Students in this course with their active enrollment year
        const { data: students, error: studentError } = await supabase
            .from('Student')
            .select(`
                *,
                enrollments:Enrollment (year, status)
            `)
            .eq('courseId', courseId)
            .order('name', { ascending: true });

        if (studentError) throw studentError;

        // 3. Fetch Classes for the course's subjects
        const subjectIds = course.subjects.map((s: any) => s.id);
        const { data: classes, error: classesError } = await supabase
            .from('Class')
            .select(`
                *,
                subject:Subject (*),
                teacher:Teacher (name)
            `)
            .in('subjectId', subjectIds.length > 0 ? subjectIds : ['00000000-0000-0000-0000-000000000000']);

        if (classesError) throw classesError;

        return {
            success: true,
            course,
            students: students || [],
            classes: classes || []
        };
    } catch (error: any) {
        console.error("Error fetching course dashboard data:", error);
        return { success: false, error: error.message };
    }
}

export async function getTeacherClasses(teacherId: string) {
    const { data: classes, error } = await supabase
        .from('Class')
        .select(`
            *,
            subject:Subject (
                *,
                course:Course (name)
            )
        `)
        .eq('teacherId', teacherId);

    if (error) {
        console.error("Error fetching teacher classes:", error);
        throw new Error(error.message);
    }

    return classes;
}

export async function getClassStudentsWithGrades(classId: string) {
    // 1. First get the subjectId for this class
    const { data: cls, error: classError } = await supabase
        .from('Class')
        .select('subjectId')
        .eq('id', classId)
        .single();

    if (classError || !cls) {
        console.error("Error fetching class subject:", classError);
        return [];
    }

    // 2. Fetch all enrollments for this specific Subject
    const { data: enrollments, error } = await supabase
        .from('Enrollment')
        .select(`
            id,
            studentId,
            student:Student (id, name),
            grades:Grade (*)
        `)
        .eq('subjectId', cls.subjectId);

    if (error) {
        console.error("Error fetching class students with grades:", error);
        throw new Error(error.message);
    }

    return enrollments;
}

export async function saveGrade(data: {
    enrollmentId: string;
    value: number;
    type: string;
    tenantId: string;
}) {
    // Check if grade already exists for this type
    const { data: existing } = await supabase
        .from('Grade')
        .select('id')
        .eq('enrollmentId', data.enrollmentId)
        .eq('type', data.type)
        .single();

    let result;
    if (existing) {
        result = await supabase
            .from('Grade')
            .update({ value: data.value })
            .eq('id', existing.id);
    } else {
        result = await supabase
            .from('Grade')
            .insert(data);
    }

    if (result.error) {
        console.error("Error saving grade:", result.error);
        throw new Error(result.error.message);
    }

    return { success: true };
}

export async function getStudentGrades(studentId: string) {
    const { data: enrollments, error } = await supabase
        .from('Enrollment')
        .select(`
            id,
            year,
            subject:Subject (
                id,
                name,
                code
            ),
            grades:Grade (*)
        `)
        .eq('studentId', studentId);

    if (error) {
        console.error("Error fetching student grades:", error);
        throw new Error(error.message);
    }

    return enrollments;
}

export async function createEnrollment(data: {
    studentId: string;
    subjectId: string;
    year: number;
    tenantId: string;
}) {
    const { data: enrollment, error } = await supabase
        .from('Enrollment')
        .insert({
            ...data,
            status: 'ACTIVE'
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating enrollment:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/academic");
    return enrollment;
}
