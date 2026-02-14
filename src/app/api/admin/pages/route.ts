import { NextRequest, NextResponse } from 'next/server';

// Simulate database with in-memory storage
let pages: any[] = [
  {
    id: '1',
    slug: 'company-history',
    title_mn: 'Компанийн түүх',
    title_en: 'Company History',
    content_mn: 'Бичил Глобус ББСБ нь 2010 онд үүсгэн байгуулагдсан...',
    content_en: 'Bichil Globus NBFI was founded in 2010...',
    meta_description_mn: 'Манай компанийн түүхийн тухай',
    meta_description_en: 'About our company history',
    is_published: true,
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(pages);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.slug || !body.title_mn || !body.title_en || !body.content_mn || !body.content_en) {
      return NextResponse.json(
        { error: 'Шаардлагатай талбаруудыг бүрэн бөглөнө үү' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    if (pages.some(p => p.slug === body.slug)) {
      return NextResponse.json(
        { error: 'Энэ slug аль хэдийн ашиглагдаж байна' },
        { status: 400 }
      );
    }

    const newPage = {
      id: Date.now().toString(),
      slug: body.slug,
      title_mn: body.title_mn,
      title_en: body.title_en,
      content_mn: body.content_mn,
      content_en: body.content_en,
      meta_description_mn: body.meta_description_mn || '',
      meta_description_en: body.meta_description_en || '',
      is_published: body.is_published ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    pages.push(newPage);

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Хуудас үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
