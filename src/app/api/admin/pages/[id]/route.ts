import { NextRequest, NextResponse } from 'next/server';

// This would connect to your database
// For demo, we'll use the same in-memory storage pattern
let pages: any[] = [];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pageIndex = pages.findIndex(p => p.id === id);

    if (pageIndex === -1) {
      return NextResponse.json(
        { error: 'Хуудас олдсонгүй' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.slug || !body.title_mn || !body.title_en || !body.content_mn || !body.content_en) {
      return NextResponse.json(
        { error: 'Шаардлагатай талбаруудыг бүрэн бөглөнө үү' },
        { status: 400 }
      );
    }

    // Check if slug is taken by another page
    if (pages.some(p => p.slug === body.slug && p.id !== id)) {
      return NextResponse.json(
        { error: 'Энэ slug аль хэдийн ашиглагдаж байна' },
        { status: 400 }
      );
    }

    const updatedPage = {
      ...pages[pageIndex],
      slug: body.slug,
      title_mn: body.title_mn,
      title_en: body.title_en,
      content_mn: body.content_mn,
      content_en: body.content_en,
      meta_description_mn: body.meta_description_mn || '',
      meta_description_en: body.meta_description_en || '',
      is_published: body.is_published ?? true,
      updated_at: new Date().toISOString(),
    };

    pages[pageIndex] = updatedPage;

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Хуудас шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pageIndex = pages.findIndex(p => p.id === id);

    if (pageIndex === -1) {
      return NextResponse.json(
        { error: 'Хуудас олдсонгүй' },
        { status: 404 }
      );
    }

    pages.splice(pageIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Хуудас устгахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
