
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://podcodwsxkluxzhdzcff.supabase.co';
const supabaseKey = 'sb_secret_yG4fyVX3YguU0LMhSYrNKw_3yuEKTBp';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("Checking Courses...");
    const { data: courses } = await supabase.from('Course').select('*');
    if (courses) {
        console.table(courses.map(c => ({
            id: c.id.slice(0, 8),
            name: c.name,
            start: c.paymentStartDay,
            end: c.paymentEndDay,
            fee: c.lateFeeValue
        })));
    }

    console.log("\nChecking Tuitions...");
    const { data: tuitions } = await supabase
        .from('Tuition')
        .select('*, student:Student(name), course:Course(name)')
        .order('dueDate', { ascending: false });

    if (!tuitions || tuitions.length === 0) {
        console.log("No tuitions found.");
    } else {
        console.table(tuitions.map(t => ({
            id: t.id.slice(0, 8),
            student: t.student?.name,
            course: t.course?.name,
            amount: t.amount,
            dueDate: t.dueDate,
            status: t.status,
            lateFee: t.lateFee
        })));
    }

    console.log("\nChecking Total Debt in Summary...");
    // This part is to see if our logic matches what we expect
    const today = new Date();
    const currentDay = today.getDate();
    console.log(`Current Date: ${today.toISOString()}, Day: ${currentDay}`);
}

debug();
