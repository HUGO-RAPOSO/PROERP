
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://podcodwsxkluxzhdzcff.supabase.co';
const supabaseKey = 'sb_secret_yG4fyVX3YguU0LMhSYrNKw_3yuEKTBp';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("Checking Students and their direct Courses...");
    const { data: students, error } = await supabase
        .from('Student')
        .select('*, course:Course(name)')
        .eq('status', 'ACTIVE');

    if (error) {
        console.error("Error fetching students:", error);
        return;
    }

    if (students) {
        console.table(students.map(s => ({
            id: s.id.slice(0, 8),
            name: s.name,
            course: s.course?.name || 'No Course',
            courseId: s.courseId ? s.courseId.slice(0, 8) : 'null'
        })));
    }
}

debug();
