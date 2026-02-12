"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { createTransaction } from "./financial";
import bcrypt from "bcryptjs";

export async function createStudent(data: {
    name: string;
    email?: string;
    phone?: string;
    courseId: string;
    classId?: string;
    tenantId: string;
    documentUrl?: string;
    enrollmentSlipUrl?: string;
    enrollmentSlipNumber?: string;
    accountId?: string;
    paymentDate?: Date;
}) {
    try {
        const { data: student, error } = await supabase
            .from('Student')
            .insert({
                name: data.name,
                email: data.email,
                phone: data.phone,
                courseId: data.courseId,
                classId: data.classId,
                tenantId: data.tenantId,
                documentUrl: data.documentUrl,
                enrollmentSlipUrl: data.enrollmentSlipUrl,
                enrollmentSlipNumber: data.enrollmentSlipNumber,
                status: "ACTIVE",
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating student:", error);
            return { success: false, error: error.message };
        }

        // --- Financial Integration: Record Enrollment Fee ---
        if (data.accountId) {
            try {
                // 1. Get the course to find the enrollment fee
                const { data: course } = await supabase
                    .from('Course')
                    .select('name, enrollmentFee')
                    .eq('id', data.courseId)
                    .single();

                if (course && Number(course.enrollmentFee) > 0) {
                    // 2. Find or Create the "Matrícula/Propina" category
                    let { data: category } = await supabase
                        .from('Category')
                        .select('id')
                        .eq('tenantId', data.tenantId)
                        .eq('name', 'Matrícula/Propina')
                        .eq('type', 'INCOME')
                        .maybeSingle();

                    if (!category) {
                        const { data: newCat, error: catError } = await supabase
                            .from('Category')
                            .insert({
                                name: 'Matrícula/Propina',
                                type: 'INCOME',
                                tenantId: data.tenantId,
                                color: '#10B981' // Success Green
                            })
                            .select()
                            .single();

                        if (!catError) category = newCat;
                    }

                    // 3. Create the Transaction
                    if (category) {
                        await createTransaction({
                            description: `Matrícula - ${student.name} (${course.name})`,
                            amount: Number(course.enrollmentFee),
                            type: 'INCOME',
                            categoryId: category.id,
                            accountId: data.accountId,
                            studentId: student.id,
                            tenantId: data.tenantId,
                            date: data.paymentDate || new Date()
                        });
                    }
                }
            } catch (finError) {
                console.error("Non-blocking error integrating with finance:", finError);
                // We don't fail student creation if financial integration fails
            }
        }

        // Also create/sync User account if email exists
        if (student.email) {
            try {
                const hashedPassword = await bcrypt.hash("Mudar@123", 10);
                const client = supabaseAdmin || supabase;
                const { error: userError } = await client
                    .from('User')
                    .upsert({
                        email: student.email,
                        name: student.name,
                        password: hashedPassword,
                        tenantId: student.tenantId,
                        role: 'STUDENT',
                        studentId: student.id
                    }, { onConflict: 'email' });

                if (userError) {
                    console.error("Error creating student user account:", userError);
                }
            } catch (hashError) {
                console.error("Error processing student user sync:", hashError);
            }
        }

        revalidatePath("/dashboard/academic");
        revalidatePath("/dashboard");
        return { success: true, data: student };
    } catch (globalError: any) {
        console.error("Critical error in createStudent:", globalError);
        return { success: false, error: globalError.message || "Erro interno do servidor" };
    }
}

export async function updateStudent(id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    status: string;
    courseId: string;
    classId: string;
    documentUrl: string;
    enrollmentSlipUrl: string;
    enrollmentSlipNumber: string;
}>) {
    try {
        const { data: student, error } = await supabase
            .from('Student')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating student:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        return { success: true, data: student };
    } catch (error: any) {
        console.error("Critical error in updateStudent:", error);
        return { success: false, error: error.message || "Erro ao atualizar aluno" };
    }
}

export async function deleteStudent(id: string) {
    try {
        const { error } = await supabase
            .from('Student')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting student:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Critical error in deleteStudent:", error);
        return { success: false, error: error.message || "Erro ao excluir aluno" };
    }
}

// Helper for conflict detection
async function checkRoomConflict(tenantId: string, roomId: string, scheduleString: string, excludeLessonId?: string) {
    if (!roomId || !scheduleString) return null;

    // Fetch lessons in the same room
    let query = supabase
        .from('Lesson')
        .select('id, schedule, class:Class(name), room:Room(name)')
        .eq('tenantId', tenantId)
        .eq('roomId', roomId);

    if (excludeLessonId) {
        query = query.neq('id', excludeLessonId);
    }

    const { data: existingLessons, error } = await query;

    if (error) {
        console.error("Error checking room conflict:", error);
        return null;
    }

    return checkOverlap(existingLessons, scheduleString, (existing, newSlot, oldSlot) => {
        const className = (existing as any).class?.name || "Outra turma";
        const roomName = (existing as any).room?.name || "sala";
        return `Conflito de Sala! A sala "${roomName}" já está ocupada pela turma "${className}" (${newSlot.day} ${oldSlot.start}-${oldSlot.end}).`;
    });
}

// Room Management Actions
export async function getRooms(tenantId: string) {
    try {
        const { data, error } = await supabase
            .from('Room')
            .select('*')
            .eq('tenantId', tenantId)
            .order('name', { ascending: true });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createRoom(data: { name: string; capacity?: number; tenantId: string }) {
    try {
        const { data: room, error } = await supabase
            .from('Room')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        revalidatePath("/dashboard/academic");
        return { success: true, data: room };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRoom(id: string, data: Partial<{ name: string; capacity: number }>) {
    try {
        const { data: room, error } = await supabase
            .from('Room')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        revalidatePath("/dashboard/academic");
        return { success: true, data: room };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRoom(id: string) {
    try {
        const { error } = await supabase.from('Room').delete().eq('id', id);
        if (error) throw error;
        revalidatePath("/dashboard/academic");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Helper for Lesson conflict within the same Turma
async function checkTurmaConflict(tenantId: string, classId: string, scheduleString: string, excludeLessonId?: string) {
    if (!classId || !scheduleString) return null;

    let query = supabase
        .from('Lesson')
        .select('id, schedule, subject:Subject(name)')
        .eq('tenantId', tenantId)
        .eq('classId', classId);

    if (excludeLessonId) {
        query = query.neq('id', excludeLessonId);
    }

    const { data: existingLessons, error } = await query;

    if (error) {
        console.error("Error checking turma conflict:", error);
        return null;
    }

    return checkOverlap(existingLessons, scheduleString, (existing, newSlot, oldSlot) => {
        const subjectName = (existing as any).subject?.name || "Outra disciplina";
        return `Conflito de Horário! Esta turma já tem aula de "${subjectName}" agendada para ${newSlot.day} ${oldSlot.start}-${oldSlot.end}.`;
    });
}

async function checkTeacherConflict(tenantId: string, teacherId: string, scheduleString: string, excludeLessonId?: string) {
    if (!teacherId || !scheduleString) return null;

    let query = supabase
        .from('Lesson')
        .select('id, schedule, teacher:Teacher(name), class:Class(name)')
        .eq('tenantId', tenantId)
        .eq('teacherId', teacherId);

    if (excludeLessonId) {
        query = query.neq('id', excludeLessonId);
    }

    const { data: existingLessons, error } = await query;

    if (error) {
        console.error("Error checking teacher conflict:", error);
        return null;
    }

    return checkOverlap(existingLessons, scheduleString, (existing, newSlot, oldSlot) => {
        const teacherName = (existing as any).teacher?.name || "O professor";
        const className = (existing as any).class?.name || "outra turma";
        return `Conflito de Professor! ${teacherName} já tem aula na ${className} para ${newSlot.day} ${oldSlot.start}-${oldSlot.end}.`;
    });
}

function checkOverlap(
    existing: any[],
    newScheduleString: string,
    onOverlap: (existing: any, newSlot: any, oldSlot: any) => string
): string | null {
    let newSchedules: { day: string, start: string, end: string }[] = [];
    try { newSchedules = JSON.parse(newScheduleString); } catch { return null; }

    if (Array.isArray(newSchedules)) {
        for (const item of existing) {
            if (!item.schedule) continue;
            let existingSchedules: any[] = [];
            try { existingSchedules = JSON.parse(item.schedule); } catch { continue; }

            if (!Array.isArray(existingSchedules)) continue;

            for (const newSlot of newSchedules) {
                for (const oldSlot of existingSchedules) {
                    if (newSlot.day === oldSlot.day) {
                        // Check time overlap
                        if (newSlot.start < oldSlot.end && newSlot.end > oldSlot.start) {
                            return onOverlap(item, newSlot, oldSlot);
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
    courseId: string;
    tenantId: string;
}) {
    try {
        const { data: cls, error } = await supabase
            .from('Class')
            .insert(data)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/academic");
        return { success: true, data: cls };
    } catch (error: any) {
        return { success: false, error: error.message || "Erro ao criar turma" };
    }
}

export async function updateClass(id: string, data: Partial<{
    name: string;
    courseId: string;
}>) {
    try {
        const { data: cls, error } = await supabase
            .from('Class')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/academic");
        return { success: true, data: cls };
    } catch (error: any) {
        return { success: false, error: error.message || "Erro ao atualizar turma" };
    }
}

export async function createLesson(data: {
    classId: string;
    subjectId: string;
    teacherId?: string;
    roomId?: string;
    room?: string; // Kept for backward compatibility or if no roomId is provided
    schedule: string;
    tenantId: string;
}) {
    try {
        const { classId, subjectId, teacherId, roomId, schedule, tenantId } = data;

        // 1. Conflict Checks
        if (roomId) {
            const roomError = await checkRoomConflict(tenantId, roomId, schedule);
            if (roomError) return { success: false, error: roomError };
        }

        const turmaError = await checkTurmaConflict(tenantId, classId, schedule);
        if (turmaError) return { success: false, error: turmaError };

        if (teacherId) {
            const teacherError = await checkTeacherConflict(tenantId, teacherId, schedule);
            if (teacherError) return { success: false, error: teacherError };
        }

        // 2. Insert Lesson
        const { data: lesson, error } = await supabase
            .from('Lesson')
            .insert(data)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/academic");
        return { success: true, data: lesson };
    } catch (error: any) {
        console.error("Error creating lesson:", error);
        return { success: false, error: error.message || "Erro ao criar aula" };
    }
}

export async function updateLesson(id: string, data: Partial<{
    subjectId: string;
    teacherId: string;
    roomId: string;
    room: string;
    schedule: string;
}>) {
    try {
        const { data: current, error: fetchError } = await supabase
            .from('Lesson')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !current) return { success: false, error: "Aula não encontrada" };

        const finalRoomId = data.roomId !== undefined ? data.roomId : current.roomId;
        const finalSchedule = data.schedule !== undefined ? data.schedule : current.schedule;
        const finalTeacherId = data.teacherId !== undefined ? data.teacherId : current.teacherId;

        // Conflict Checks
        if (finalSchedule) {
            if (finalRoomId) {
                const roomError = await checkRoomConflict(current.tenantId, finalRoomId, finalSchedule, id);
                if (roomError) return { success: false, error: roomError };
            }

            const turmaError = await checkTurmaConflict(current.tenantId, current.classId, finalSchedule, id);
            if (turmaError) return { success: false, error: turmaError };

            if (finalTeacherId) {
                const teacherError = await checkTeacherConflict(current.tenantId, finalTeacherId, finalSchedule, id);
                if (teacherError) return { success: false, error: teacherError };
            }
        }

        const { data: lesson, error } = await supabase
            .from('Lesson')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/academic");
        return { success: true, data: lesson };
    } catch (error: any) {
        return { success: false, error: error.message || "Erro ao atualizar aula" };
    }
}

export async function deleteLesson(id: string) {
    try {
        const { error } = await supabase.from('Lesson').delete().eq('id', id);
        if (error) throw error;
        revalidatePath("/dashboard/academic");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Erro ao excluir aula" };
    }
}

export async function deleteClass(id: string) {
    try {
        const { error } = await supabase
            .from('Class')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting class:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        return { success: true };
    } catch (error: any) {
        console.error("Critical error in deleteClass:", error);
        return { success: false, error: error.message || "Erro ao excluir turma" };
    }
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

        // 2. Fetch Students in this course
        const { data: students, error: studentError } = await supabase
            .from('Student')
            .select(`
                *,
                enrollments:Enrollment (year, status),
                turma:Class(name)
            `)
            .eq('courseId', courseId)
            .order('name', { ascending: true });

        if (studentError) throw studentError;

        // 3. Fetch Turmas (Classes) for this course
        const { data: turmas, error: turmasError } = await supabase
            .from('Class')
            .select(`
                *,
                lessons:Lesson (
                    *,
                    subject:Subject (*),
                    teacher:Teacher (name)
                ),
                _count: {
                    students:Student (id)
                }
            `)
            .eq('courseId', courseId);

        if (turmasError) throw turmasError;

        return {
            success: true,
            course,
            students: students || [],
            turmas: turmas || []
        };
    } catch (error: any) {
        console.error("Error fetching course dashboard data:", error);
        return { success: false, error: error.message };
    }
}

export async function getTeacherLessons(teacherId: string) {
    try {
        const { data: lessons, error } = await supabase
            .from('Lesson')
            .select(`
                *,
                subject:Subject (
                    *,
                    course:Course (name)
                ),
                class:Class (name)
            `)
            .eq('teacherId', teacherId);

        if (error) throw error;
        return { success: true, data: lessons || [] };
    } catch (error: any) {
        console.error("Error fetching teacher lessons:", error);
        return { success: false, error: error.message };
    }
}

export async function getLessonStudentsWithGrades(lessonId: string) {
    try {
        // 1. Get the subjectId and classId for this lesson
        const { data: lesson, error: lessonError } = await supabase
            .from('Lesson')
            .select('subjectId, classId')
            .eq('id', lessonId)
            .single();

        if (lessonError || !lesson) {
            console.error("Error fetching lesson details:", lessonError);
            return { success: false, error: "Aula não encontrada" };
        }

        // 2. Fetch all students in the Turma (Class) and their grades for this specific Subject
        const { data: students } = await supabase
            .from('Student')
            .select('id')
            .eq('classId', lesson.classId);

        const studentIds = students?.map(s => s.id) || [];

        const { data: enrollments, error } = await supabase
            .from('Enrollment')
            .select(`
                id,
                studentId,
                student:Student (id, name),
                grades:Grade (*),
                subject:Subject (
                    examWaiverPossible,
                    waiverGrade,
                    exclusionGrade
                )
            `)
            .eq('subjectId', lesson.subjectId)
            .in('studentId', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000']);

        if (error) throw error;
        return { success: true, data: enrollments || [] };
    } catch (error: any) {
        console.error("Error fetching lesson students with grades:", error);
        return { success: false, error: error.message };
    }
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
                code,
                year,
                semester,
                examWaiverPossible,
                waiverGrade,
                exclusionGrade
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
export async function enrollStudentInSubjects(data: {
    studentId: string;
    subjectIds: string[];
    year: number;
    tenantId: string;
}) {
    try {
        const enrollments = data.subjectIds.map(subjectId => ({
            studentId: data.studentId,
            subjectId: subjectId,
            year: data.year,
            tenantId: data.tenantId,
            status: 'ACTIVE'
        }));

        const { data: inserted, error } = await supabase
            .from('Enrollment')
            .insert(enrollments)
            .select();

        if (error) {
            console.error("Error batch enrolling student:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        return { success: true, data: inserted };
    } catch (error: any) {
        console.error("Critical error in enrollStudentInSubjects:", error);
        return { success: false, error: error.message || "Erro ao realizar matrícula" };
    }
}

export async function createStudentDocuments(documents: {
    studentId: string;
    type: string;
    url: string;
    tenantId: string;
}[]) {
    try {
        const client = supabaseAdmin || supabase;
        const { error } = await client
            .from('StudentDocument')
            .insert(documents);

        if (error) {
            console.error("Error creating student documents:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Critical error in createStudentDocuments:", error);
        return { success: false, error: error.message || "Erro ao salvar documentos" };
    }
}
export async function getStudentFullProfile(studentId: string) {
    try {
        // 1. Fetch Student with Course
        const { data: student, error: studentError } = await supabase
            .from('Student')
            .select(`
                *,
                course:Course (*)
            `)
            .eq('id', studentId)
            .single();

        if (studentError) throw studentError;

        // 2. Fetch Enrollments with Subjects and Grades
        const { data: enrollments, error: enrollError } = await supabase
            .from('Enrollment')
            .select(`
                *,
                subject:Subject (*),
                grades:Grade (*)
            `)
            .eq('studentId', studentId);

        if (enrollError) throw enrollError;

        // 3. Fetch Tuitions (Financials)
        const { data: tuitions, error: tuitionError } = await supabase
            .from('Tuition')
            .select('*, account:Account(name)')
            .eq('studentId', studentId)
            .order('dueDate', { ascending: false });

        // 4. Fetch Student Documents
        const { data: documents } = await supabase
            .from('StudentDocument')
            .select('*')
            .eq('studentId', studentId);

        // Note: Tuitions might not exist if financial module hasn't generated them yet
        // but we want to return what we have.

        return {
            success: true,
            student,
            enrollments: enrollments || [],
            tuitions: tuitions || [],
            documents: documents || []
        };
    } catch (error: any) {
        console.error("Error fetching student full profile:", error);
        return { success: false, error: error.message };
    }
}

export async function getLessonGradesForReport(lessonId: string) {
    try {
        // 1. Fetch Lesson and Context details
        if (!supabaseAdmin) {
            console.error("CRITICAL: Supabase Admin client is NOT initialized.");
            return { success: false, error: "Erro de Configuração: Chave de Administração não encontrada no servidor." };
        }

        const { data: lesson, error: lessonError } = await supabaseAdmin
            .from('Lesson')
            .select(`
                room,
                schedule,
                subjectId,
                classId,
                subject:Subject (
                    name,
                    year,
                    semester,
                    course:Course(name),
                    examWaiverPossible,
                    waiverGrade,
                    exclusionGrade
                ),
                class:Class (name),
                teacher:Teacher (name)
            `)
            .eq('id', lessonId)
            .single();

        if (lessonError || !lesson) {
            return { success: false, error: "Aula não encontrada" };
        }

        // 2. Fetch Students in the Turma
        const { data: students } = await supabaseAdmin
            .from('Student')
            .select('id')
            .eq('classId', lesson.classId);

        const studentIds = students?.map(s => s.id) || [];

        // 3. Fetch Enrollments for these students in this subject
        const { data: enrollments, error } = await supabaseAdmin
            .from('Enrollment')
            .select(`
                id,
                studentId,
                student:Student (id, name, enrollmentSlipNumber),
                grades:Grade (*),
                status 
            `)
            .eq('subjectId', lesson.subjectId)
            .in('studentId', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000'])
            .order('student(name)', { ascending: true });

        if (error) throw error;

        return {
            success: true,
            data: {
                lessonDetails: {
                    ...lesson,
                    name: (lesson.class as any)?.name
                },
                enrollments: enrollments || []
            }
        };
    } catch (error: any) {
        console.error("Error fetching report enrollments:", error);
        return { success: false, error: error.message };
    }
}
