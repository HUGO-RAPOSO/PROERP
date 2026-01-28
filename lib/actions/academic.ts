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
            grades:Grade (*),
            subject:Subject (
                examWaiverPossible,
                waiverGrade,
                exclusionGrade
            )
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

export async function getClassGradesForReport(classId: string) {
    // 1. Fetch Class and Subject details
    if (!supabaseAdmin) {
        console.error("CRITICAL: Supabase Admin client is NOT initialized.");
        return { error: "Erro de Configuração: Chave de Administração (Service Role) não encontrada no servidor." };
    }

    console.log(`Fetching report data for class: ${classId}`);

    const { data: cls, error: classError } = await supabaseAdmin
        .from('Class')
        .select(`
            name,
            schedule,
            subject:Subject (
                name,
                year,
                semester,
                course:Course(name),
                examWaiverPossible,
                waiverGrade,
                exclusionGrade
            ),
            teacher:Teacher (name)
        `)
        .eq('id', classId)
        .single();

    if (classError) {
        console.error("Error fetching class for report:", classError);
        return { error: `Erro no Banco de Dados: ${classError.message}` };
    }

    if (!cls) {
        console.error(`Class not found with ID: ${classId}`);
        return { error: "Turma não encontrada com o ID fornecido." };
    }

    // 2. Fetch Enrollments explicitly LINKED to this class (and thus subject)
    const { data: enrollments, error } = await supabaseAdmin
        .from('Enrollment')
        .select(`
            id,
            studentId,
            student:Student (id, name, enrollmentSlipNumber),
            grades:Grade (*),
            status 
        `)
        .eq('classId', classId) // CRITICAL: Filter by ClassId, not SubjectId
        .order('student(name)', { ascending: true }); // Sort by Student Name

    if (error) {
        console.error("Error fetching report enrollments:", error);
        throw new Error(error.message);
    }

    return {
        classDetails: cls,
        enrollments: enrollments || []
    };
}
