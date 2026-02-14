import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ category: string; id: string }> }
) {
    const { category, id } = await params;
    const body = await request.json();
    const { title, image_url, payload } = body;

    try {
        const pool = getPool();
        const client = await pool.connect();
        const result = await client.query(
            'UPDATE admin_items SET title = $1, image_url = $2, payload = $3, updated_at = now() WHERE id = $4 AND category = $5 RETURNING *',
            [title, image_url, payload, id, category]
        );
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ category: string; id: string }> }
) {
    const { category, id } = await params;

    try {
        const pool = getPool();
        const client = await pool.connect();
        const result = await client.query(
            'DELETE FROM admin_items WHERE id = $1 AND category = $2 RETURNING *',
            [id, category]
        );
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
