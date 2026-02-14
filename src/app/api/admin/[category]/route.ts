import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    const { category } = await params;

    try {
        const pool = getPool();
        const client = await pool.connect();

        let result;

        // Route to appropriate table based on category
        if (category === 'products') {
            result = await client.query(`
                SELECT 
                    lp.loan_product_id as id,
                    lp.loan_product_name as title,
                    lpt.loan_type_name as category,
                    lpd.loan_product_amount,
                    lpd.loan_product_fee,
                    lpd.loan_product_interest_rate,
                    lpd.loan_product_term_months,
                    lpd.loan_product_processing_minute
                FROM loan_products lp
                LEFT JOIN loan_product_type lpt ON lp.loan_product_type_id = lpt.loan_product_type_id
                LEFT JOIN loan_product_details lpd ON lp.loan_product_id = lpd.loan_product_id
                ORDER BY lp.loan_product_id
            `);
        } else if (category === 'branches') {
            result = await client.query(`
                SELECT 
                    b.branch_id as id,
                    b.branch_name as name,
                    b.address,
                    b.work_days,
                    b.work_hours,
                    b.latitude as lat,
                    b.longitude as lng,
                    p.province_name,
                    d.district_name,
                    r.region_name,
                    ARRAY_AGG(bp.phone_number) FILTER (WHERE bp.phone_number IS NOT NULL) as phone_numbers
                FROM branch b
                LEFT JOIN province p ON b.province_id = p.province_id
                LEFT JOIN district d ON b.district_id = d.district_id
                LEFT JOIN region r ON p.region_id = r.region_id
                LEFT JOIN branch_phone bp ON b.branch_id = bp.branch_id
                GROUP BY b.branch_id, b.branch_name, b.address, b.work_days, b.work_hours, 
                         b.latitude, b.longitude, p.province_name, d.district_name, r.region_name
                ORDER BY b.branch_id
            `);
            // Transform to match expected format
            const items = result.rows.map(row => ({
                ...row,
                phone: row.phone_numbers?.[0] || '',
            }));
            client.release();
            return NextResponse.json({ items });
        } else if (category === 'news') {
            result = await client.query(`
                SELECT 
                    n.news_id as id,
                    n.news_title as title,
                    n.slug,
                    n.excerpt,
                    n.news_content as content,
                    n.thumbnail as "coverImage",
                    ncr.news_category_ref_name,
                    ntr.news_type_ref_name
                FROM news n
                LEFT JOIN news_category_reference ncr ON n.news_category_ref_id = ncr.news_category_ref_id
                LEFT JOIN news_type_reference ntr ON ncr.news_type_ref_id = ntr.news_type_ref_id
                ORDER BY n.news_id DESC
            `);

            // Map database category names back to frontend values
            const categoryReverseMapping: { [key: string]: string } = {
                'Company News': 'company',
                'Product Updates': 'product'
            };

            const items = result.rows.map(row => ({
                ...row,
                category: categoryReverseMapping[row.news_category_ref_name] || 'company',
                publishedAt: new Date().toISOString(), // Add timestamp
                isActive: true // Default to active
            }));

            client.release();
            return NextResponse.json({ items });
        } else {
            // Fallback to original admin_items table for other categories
            result = await client.query(
                'SELECT * FROM admin_items WHERE category = $1 ORDER BY created_at DESC',
                [category]
            );
        }

        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    const { category } = await params;
    const body = await request.json();

    try {
        const pool = getPool();
        const client = await pool.connect();
        let result;

        if (category === 'products') {
            // Insert into loan_products and related tables
            const { title, category: productCategory, slug, shortDescription, heroImage, interestRate, maxAmount, maxTerm, isActive } = body;

            // Generate a unique product ID
            const productId = `LP${Date.now().toString().slice(-6)}`;

            // Use default loan product type (you can expand this mapping later)
            const defaultTypeId = 'LPT001'; // Salary Loan as default

            // Insert into loan_products
            result = await client.query(
                'INSERT INTO loan_products (loan_product_id, loan_product_name, loan_product_type_id) VALUES ($1, $2, $3) RETURNING *',
                [productId, title, defaultTypeId]
            );

            // Optionally insert into loan_product_details if you want to store additional info
            // For now, we'll just store the basic product info
        } else if (category === 'branches') {
            const { name, address, phone, weekdayHours, saturdayHours, sundayHours, lat, lng, image } = body;

            result = await client.query(
                'INSERT INTO branch (branch_name, address, work_days, work_hours, province_id, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [name, address, 'Mon-Fri', weekdayHours, 1, lat, lng] // Note: province_id hardcoded to 1, adjust as needed
            );
        } else if (category === 'news') {
            const { title, slug, excerpt, content, coverImage, category: newsCategory } = body;

            // Generate a unique news_id
            const newsId = `NEWS${Date.now().toString().slice(-6)}`;

            // Map frontend category names to database category IDs
            const categoryMapping: { [key: string]: string } = {
                'company': 'NC001',
                'product': 'NC002',
                'event': 'NC001',  // Default to Company News
                'other': 'NC001'   // Default to Company News
            };

            const categoryId = categoryMapping[newsCategory] || 'NC001';

            result = await client.query(
                'INSERT INTO news (news_id, news_title, news_content, thumbnail, news_category_ref_id, slug, excerpt) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [newsId, title, content, coverImage || '', categoryId, slug || '', excerpt || '']
            );
        } else {
            // Fallback to original admin_items table
            const { title, image_url, payload } = body;

            if (!title) {
                client.release();
                return NextResponse.json({ error: 'Title is required' }, { status: 400 });
            }

            result = await client.query(
                'INSERT INTO admin_items (category, title, image_url, payload) VALUES ($1, $2, $3, $4) RETURNING *',
                [category, title, image_url, payload]
            );
        }

        client.release();
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error creating item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    const { category } = await params;
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const pool = getPool();
        const client = await pool.connect();
        let result;

        if (category === 'news') {
            const { title, slug, excerpt, content, coverImage, category: newsCategory } = body;

            // Map frontend category names to database category IDs
            const categoryMapping: { [key: string]: string } = {
                'company': 'NC001',
                'product': 'NC002',
                'event': 'NC001',
                'other': 'NC001'
            };

            const categoryId = categoryMapping[newsCategory] || 'NC001';

            result = await client.query(
                'UPDATE news SET news_title = $1, news_content = $2, thumbnail = $3, news_category_ref_id = $4, slug = $5, excerpt = $6 WHERE news_id = $7 RETURNING *',
                [title, content, coverImage || '', categoryId, slug || '', excerpt || '', id]
            );
        } else if (category === 'products') {
            const { title, category: productCategory, slug, shortDescription, heroImage, interestRate, maxAmount, maxTerm, isActive } = body;

            // Update loan_products
            result = await client.query(
                'UPDATE loan_products SET loan_product_name = $1 WHERE loan_product_id = $2 RETURNING *',
                [title, id]
            );
        } else {
            // Fallback for other categories
            const { title, image_url, payload } = body;
            result = await client.query(
                'UPDATE admin_items SET title = $1, image_url = $2, payload = $3 WHERE id = $4 RETURNING *',
                [title, image_url, payload, id]
            );
        }

        client.release();

        if (result.rows.length === 0) {
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
    { params }: { params: Promise<{ category: string }> }
) {
    const { category } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const pool = getPool();
        const client = await pool.connect();
        let result;

        if (category === 'news') {
            result = await client.query('DELETE FROM news WHERE news_id = $1 RETURNING *', [id]);
        } else if (category === 'products') {
            // Delete from loan_products
            result = await client.query('DELETE FROM loan_products WHERE loan_product_id = $1 RETURNING *', [id]);
        } else if (category === 'branches') {
            // Delete from branch
            result = await client.query('DELETE FROM branch WHERE branch_id = $1 RETURNING *', [id]);
        } else {
            // Fallback for other categories
            result = await client.query('DELETE FROM admin_items WHERE id = $1 RETURNING *', [id]);
        }

        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
