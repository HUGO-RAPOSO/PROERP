"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createBook(data: {
    title: string;
    author: string;
    isbn?: string;
    type: 'PHYSICAL' | 'DIGITAL' | 'BOTH';
    quantity: number;
    available: number;
    publisher?: string;
    publishYear?: number;
    pages?: number;
    coverUrl?: string;
    fileUrl?: string;
    description?: string;
    tenantId: string;
}) {
    const { data: book, error } = await supabase
        .from('Book')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error("Error creating book:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/library");
    return book;
}

export async function updateBook(id: string, data: Partial<{
    title: string;
    author: string;
    isbn: string;
    type: 'PHYSICAL' | 'DIGITAL' | 'BOTH';
    quantity: number;
    available: number;
    publisher: string;
    publishYear: number;
    pages: number;
    coverUrl: string;
    fileUrl: string;
    description: string;
}>) {
    const { data: book, error } = await supabase
        .from('Book')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating book:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/library");
    return book;
}

export async function deleteBook(id: string) {
    const { error } = await supabase
        .from('Book')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting book:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/library");
}

export async function createLoan(data: {
    bookId: string;
    dueDate: Date;
    tenantId: string;
}) {
    // 1. Check if book is available
    const { data: book, error: bookError } = await supabase
        .from('Book')
        .select('*')
        .eq('id', data.bookId)
        .single();

    if (bookError || !book || book.available <= 0) {
        throw new Error("Livro não disponível para empréstimo");
    }

    // 2. Create loan
    const { data: loan, error: loanError } = await supabase
        .from('Loan')
        .insert({
            bookId: data.bookId,
            dueDate: data.dueDate,
            tenantId: data.tenantId,
            status: "BORROWED"
        })
        .select()
        .single();

    if (loanError) {
        console.error("Error creating loan:", loanError);
        throw new Error(loanError.message);
    }

    // 3. Decrement availability
    const { error: updateError } = await supabase
        .from('Book')
        .update({ available: book.available - 1 })
        .eq('id', data.bookId);

    if (updateError) {
        console.error("Error updating book availability:", updateError);
        // Rollback loan if possible or just log (in real app, use RPC)
    }

    revalidatePath("/dashboard/library");
    return loan;
}

export async function returnLoan(id: string) {
    const { data: loan, error: loanError } = await supabase
        .from('Loan')
        .select('*, book:Book(*)')
        .eq('id', id)
        .single();

    if (loanError || !loan || (loan as any).status === "RETURNED") return;

    // 1. Update loan status
    const { error: updateLoanError } = await supabase
        .from('Loan')
        .update({
            status: "RETURNED",
            returnDate: new Date()
        })
        .eq('id', id);

    if (updateLoanError) {
        console.error("Error updating loan status:", updateLoanError);
        throw new Error(updateLoanError.message);
    }

    // 2. Increment availability
    const { error: updateBookError } = await supabase
        .from('Book')
        .update({ available: (loan as any).book.available + 1 })
        .eq('id', loan.bookId);

    if (updateBookError) {
        console.error("Error updating book availability:", updateBookError);
    }

    revalidatePath("/dashboard/library");
}
