-- Performance Optimization Indexes (Final Corrected Version)

-- 1. Tenant ID Indexes (Crucial for Multi-tenancy performance)
CREATE INDEX IF NOT EXISTS "idx_role_tenant" ON "Role"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_contract_tenant" ON "Contract"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_employee_tenant" ON "Employee"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_teacher_tenant" ON "Teacher"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_category_tenant" ON "Category"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_transaction_tenant" ON "Transaction"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_course_tenant" ON "Course"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_subject_tenant" ON "Subject"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_student_tenant" ON "Student"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_class_tenant" ON "Class"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_event_tenant" ON "Event"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_book_tenant" ON "Book"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_loan_tenant" ON "Loan"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_message_tenant" ON "Message"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_enrollment_tenant" ON "Enrollment"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_grade_tenant" ON "Grade"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_tuition_tenant" ON "Tuition"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_student_doc_tenant" ON "StudentDocument"("tenantId");

-- 2. Foreign Key Indexes
CREATE INDEX IF NOT EXISTS "idx_employee_role" ON "Employee"("roleId");
CREATE INDEX IF NOT EXISTS "idx_employee_contract" ON "Employee"("contractId");
CREATE INDEX IF NOT EXISTS "idx_employee_doc_employee" ON "EmployeeDocument"("employeeId");
CREATE INDEX IF NOT EXISTS "idx_payroll_employee" ON "Payroll"("employeeId");
CREATE INDEX IF NOT EXISTS "idx_transaction_category" ON "Transaction"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_subject_course" ON "Subject"("courseId");
CREATE INDEX IF NOT EXISTS "idx_student_course" ON "Student"("courseId");
CREATE INDEX IF NOT EXISTS "idx_class_subject" ON "Class"("subjectId");
CREATE INDEX IF NOT EXISTS "idx_class_teacher" ON "Class"("teacherId");
CREATE INDEX IF NOT EXISTS "idx_enrollment_student" ON "Enrollment"("studentId");
CREATE INDEX IF NOT EXISTS "idx_enrollment_subject" ON "Enrollment"("subjectId");
CREATE INDEX IF NOT EXISTS "idx_grade_enrollment" ON "Grade"("enrollmentId");
CREATE INDEX IF NOT EXISTS "idx_tuition_student" ON "Tuition"("studentId");
CREATE INDEX IF NOT EXISTS "idx_tuition_course" ON "Tuition"("courseId");
CREATE INDEX IF NOT EXISTS "idx_loan_book" ON "Loan"("bookId");
CREATE INDEX IF NOT EXISTS "idx_loan_student" ON "Loan"("studentId");

-- 3. Filter/Sorting Indexes
CREATE INDEX IF NOT EXISTS "idx_employee_status" ON "Employee"("status");
CREATE INDEX IF NOT EXISTS "idx_student_status" ON "Student"("status");
CREATE INDEX IF NOT EXISTS "idx_transaction_date" ON "Transaction"("date");
CREATE INDEX IF NOT EXISTS "idx_transaction_type" ON "Transaction"("type");
CREATE INDEX IF NOT EXISTS "idx_event_date" ON "Event"("date");
CREATE INDEX IF NOT EXISTS "idx_enrollment_year" ON "Enrollment"("year");
