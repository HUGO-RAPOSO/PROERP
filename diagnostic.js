
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://podcodwsxkluxzhdzcff.supabase.co';
const supabaseKey = 'sb_secret_yG4fyVX3YguU0LMhSYrNKw_3yuEKTBp';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Diagonistic starting...");
    const { data: students } = await supabase.from('Student').select('*, course:Course(*)').eq('status', 'ACTIVE');
    if (!students) {
        console.log("No active students found.");
        return;
    }

    for (const student of students) {
        const { data: tuitions } = await supabase.from('Tuition').select('*').eq('studentId', student.id);
        console.log(`Student: ${student.name}, Course: ${student.course?.name || 'NONE'}, Tuitions: ${tuitions?.length || 0}`);
        if (tuitions && tuitions.length > 0) {
            tuitions.forEach(t => console.log(`  - Due: ${t.dueDate}, Status: ${t.status}`));
        } else {
            console.log("  ! No tuitions generated for this student.");
        }
    }
}
check();
