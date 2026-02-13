"use server";

import { revalidatePath } from "next/cache";

/**
 * Fetches book cover URL from Open Library Covers API
 * @param isbn - ISBN-10 or ISBN-13
 * @param size - S (small), M (medium), or L (large)
 * @returns Cover image URL or null if not found
 */
export async function getBookCoverFromISBN(isbn: string, size: 'S' | 'M' | 'L' = 'L'): Promise<string | null> {
    if (!isbn) return null;

    // Clean ISBN (remove hyphens and spaces)
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    try {
        // Open Library Covers API
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-${size}.jpg`;

        // Check if cover exists by making a HEAD request
        const response = await fetch(coverUrl, { method: 'HEAD' });

        if (response.ok && response.headers.get('content-type')?.includes('image')) {
            return coverUrl;
        }

        return null;
    } catch (error) {
        console.error('Error fetching book cover:', error);
        return null;
    }
}

/**
 * Fetches book metadata from Open Library API
 * @param isbn - ISBN-10 or ISBN-13
 * @returns Book metadata or null if not found
 */
export async function getBookMetadataFromISBN(isbn: string) {
    if (!isbn) return null;

    const cleanISBN = isbn.replace(/[-\s]/g, '');

    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`);

        if (!response.ok) return null;

        const data = await response.json();
        const bookData = data[`ISBN:${cleanISBN}`];

        if (!bookData) return null;

        return {
            title: bookData.title || null,
            authors: bookData.authors?.map((a: any) => a.name).join(', ') || null,
            publisher: bookData.publishers?.[0]?.name || null,
            publishYear: bookData.publish_date ? parseInt(bookData.publish_date) : null,
            pages: bookData.number_of_pages || null,
            coverUrl: bookData.cover?.large || bookData.cover?.medium || null,
            subjects: bookData.subjects?.map((s: any) => s.name).slice(0, 5) || [],
        };
    } catch (error) {
        console.error('Error fetching book metadata:', error);
        return null;
    }
}
