'use client';

import { CustomPage } from '@/data/mockPages';

interface PreviewProps {
  data: Partial<CustomPage>;
  lang: 'mn' | 'en';
}

// 🟦 Default - Center, calm, readable
export function DefaultPreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const content = lang === 'mn' ? data.content_mn : data.content_en;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      {/* Image */}
      {data.image_url && (
        <img
          src={data.image_url}
          alt="Preview"
          className="w-full h-64 object-cover rounded-lg"
        />
      )}

      {/* Content */}
      <div className="text-center space-y-6">
        <h1
          style={{
            color: data.title_color || '#1F2937',
            fontSize: `${data.title_size || 28}px`,
            fontWeight: data.title_weight || '600',
            fontFamily: data.title_family || 'Inter, system-ui, -apple-system, sans-serif',
            lineHeight: '1.3'
          }}
          className="font-bold"
        >
          {title}
        </h1>

        <div
          style={{
            color: data.content_color || '#374151',
            fontSize: `${data.content_size || 16}px`,
            fontWeight: data.content_weight || '400',
            fontFamily: data.content_family || 'Inter, system-ui, -apple-system, sans-serif',
            lineHeight: '1.6'
          }}
          className="whitespace-pre-wrap"
        >
          {content}
        </div>
      </div>
    </div>
  );
}

//  Landing - Hero, attention-grabbing
export function LandingPreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const content = lang === 'mn' ? data.content_mn : data.content_en;

  return (
    <div className="w-full space-y-0">
      {/* Hero Section */}
      <div className="relative w-full h-80 bg-linear-to-b from-gray-900 to-gray-800 overflow-hidden">
        {data.image_url && (
          <img
            src={data.image_url}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center space-y-4">
          <h1
            style={{
              fontSize: `${(data.title_size || 28) + 12}px`,
              fontWeight: '700',
              fontFamily: data.title_family || 'Inter, system-ui, -apple-system, sans-serif',
            }}
            className="font-bold"
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: `${(data.content_size || 16) + 2}px`,
              fontFamily: data.content_family || 'Inter, system-ui, -apple-system, sans-serif',
            }}
            className="max-w-2xl"
          >
            {content}
          </p>
        </div>
      </div>

      {/* CTA Area */}
      <div className="bg-linear-to-r from-teal-50 to-blue-50 px-6 py-8 text-center">
        <p className="text-sm text-gray-600">
           Энэ landing page хлик авахаар баригдсан
        </p>
      </div>
    </div>
  );
}

// 🧠 Article - Readable, serif, long-form
export function ArticlePreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const content = lang === 'mn' ? data.content_mn : data.content_en;

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* Meta Info */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span> Article</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString('mn-MN')}</span>
        </div>

        {/* Title */}
        <h1
          style={{
            color: data.title_color || '#111827',
            fontSize: `${data.title_size || 32}px`,
            fontWeight: data.title_weight || '600',
            fontFamily: data.title_family || "'Georgia', serif",
            lineHeight: '1.3'
          }}
        >
          {title}
        </h1>
      </div>

      {/* Image */}
      {data.image_url && (
        <img
          src={data.image_url}
          alt="Article"
          className="w-full h-96 object-cover rounded-lg mb-8"
        />
      )}

      {/* Content - Long form optimized */}
      <div
        style={{
          color: data.content_color || '#1F2937',
          fontSize: `${data.content_size || 18}px`,
          fontWeight: data.content_weight || '400',
          fontFamily: data.content_family || "'Georgia', serif",
          lineHeight: '1.8'
        }}
        className="prose prose-lg text-gray-700 space-y-6 whitespace-pre-wrap leading-relaxed"
      >
        {content}
      </div>
    </article>
  );
}

// 📸 Image - Visual storytelling
export function ImagePreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const content = lang === 'mn' ? data.content_mn : data.content_en;

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Full Image Background */}
      {data.image_url && (
        <img
          src={data.image_url}
          alt="Story"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent"></div>

      {/* Content Overlay */}
      <div className="absolute bottom-12 left-8 right-8 text-white max-w-2xl">
        <h1
          style={{
            fontSize: `${(data.title_size || 34) + 6}px`,
            fontWeight: '700',
            fontFamily: data.title_family || 'Inter, system-ui, -apple-system, sans-serif',
          }}
          className="font-bold mb-4"
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: `${(data.content_size || 16) + 2}px`,
            fontFamily: data.content_family || 'Inter, system-ui, -apple-system, sans-serif',
            lineHeight: '1.6'
          }}
          className="leading-relaxed"
        >
          {content}
        </p>
      </div>
    </div>
  );
}

//  Legal - Document, mono, scannable
export function LegalPreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const content = lang === 'mn' ? data.content_mn : data.content_en;

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-gray-300">
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
          ⚠️Legal Document
        </div>
        <h1
          style={{
            color: data.title_color || '#111827',
            fontSize: `${data.title_size || 24}px`,
            fontWeight: data.title_weight || '600',
            fontFamily: data.title_family || "'Roboto Mono', monospace",
          }}
          className="font-bold"
        >
          {title}
        </h1>
      </div>

      {/* Content - Compact, scannable */}
      <div
        style={{
          color: data.content_color || '#1F2937',
          fontSize: `${data.content_size || 14}px`,
          fontWeight: data.content_weight || '400',
          fontFamily: data.content_family || "'Roboto Mono', monospace",
          lineHeight: '1.7'
        }}
        className="space-y-4 text-left font-mono whitespace-pre-wrap"
      >
        {content}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-500">
        <p>Баримт: {new Date().toLocaleDateString('mn-MN')} | Версион 1.0</p>
      </div>
    </div>
  );
}

//  Minimal - Announcement, breathing room
export function MinimalPreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const content = lang === 'mn' ? data.content_mn : data.content_en;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-linear-to-br from-gray-50 to-white">
      <div className="text-center max-w-2xl space-y-8">
        {/* Icon */}
        <div className="text-5xl"></div>

        {/* Title */}
        <h1
          style={{
            color: data.title_color || '#111827',
            fontSize: `${(data.title_size || 26) + 4}px`,
            fontWeight: data.title_weight || '600',
            fontFamily: data.title_family || 'Inter, system-ui, -apple-system, sans-serif',
            lineHeight: '1.3'
          }}
          className="font-bold"
        >
          {title}
        </h1>

        {/* Content - Brief */}
        <div
          style={{
            color: data.content_color || '#4B5563',
            fontSize: `${data.content_size || 15}px`,
            fontWeight: data.content_weight || '400',
            fontFamily: data.content_family || 'Inter, system-ui, -apple-system, sans-serif',
            lineHeight: '1.6'
          }}
          className="whitespace-pre-wrap"
        >
          {content}
        </div>

        {/* Breathing room */}
        <div className="pt-4 text-xs text-gray-400">
          ✔ Чамд хакаж санаа идэвхтэй
        </div>
      </div>
    </div>
  );
}

// 📑 Sectioned - Multi-section, structured
export function SectionedPreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const sections = data.sections || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Hero Title */}
      <div className="text-center space-y-4">
        <h1
          style={{
            color: data.title_color || '#111827',
            fontSize: `${data.title_size || 28}px`,
            fontWeight: data.title_weight || '600',
            fontFamily: data.title_family,
          }}
          className="font-bold"
        >
          {title}
        </h1>
      </div>

      {/* Sections Grid */}
      <div className="grid md:grid-cols-2 gap-12">
        {sections.map((section, idx) => {
          const secTitle = lang === 'mn' ? section.title_mn : section.title_en;
          const secContent = lang === 'mn' ? section.content_mn : section.content_en;
          return (
            <div key={idx} className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3
                style={{
                  color: data.title_color || '#111827',
                  fontSize: `${(data.title_size || 28) - 4}px`,
                  fontWeight: '600',
                  fontFamily: data.title_family,
                }}
              >
                {secTitle}
              </h3>
              <div
                style={{
                  color: data.content_color || '#374151',
                  fontSize: `${data.content_size || 16}px`,
                  fontFamily: data.content_family,
                  lineHeight: '1.6'
                }}
                className="whitespace-pre-wrap text-sm"
              >
                {secContent}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

//  FAQ - Accordion style questions
export function FAQPreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const faqs = data.faqs || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <h1
        style={{
          color: data.title_color || '#111827',
          fontSize: `${data.title_size || 24}px`,
          fontWeight: '600',
          fontFamily: data.title_family,
        }}
        className="text-center font-bold"
      >
        {title}
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const q = lang === 'mn' ? faq.question_mn : faq.question_en;
          const a = lang === 'mn' ? faq.answer_mn : faq.answer_en;
          return (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-100 cursor-pointer hover:bg-gray-200">
                <p
                  style={{
                    color: data.title_color || '#111827',
                    fontSize: `${data.title_size || 16}px`,
                    fontWeight: '600',
                  }}
                >
                  Q: {q}
                </p>
              </div>
              <div className="p-4 bg-white space-y-2">
                <p
                  style={{
                    color: data.content_color || '#1F2937',
                    fontSize: `${data.content_size || 14}px`,
                    lineHeight: '1.6'
                  }}
                  className="whitespace-pre-wrap"
                >
                  {a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ⏳ Timeline - Chronological events
export function TimelinePreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const events = data.timeline_events || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <h1
        style={{
          color: data.title_color || '#111827',
          fontSize: `${data.title_size || 26}px`,
          fontWeight: '600',
          fontFamily: data.title_family,
        }}
        className="text-center font-bold"
      >
        {title}
      </h1>

      <div className="space-y-8 relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-linear-to-b from-teal-400 to-blue-500" />

        {events.map((event, idx) => {
          const evTitle = lang === 'mn' ? event.title_mn : event.title_en;
          const evDesc = lang === 'mn' ? event.description_mn : event.description_en;
          return (
            <div key={idx} className="pl-24 space-y-2">
              {/* Year circle */}
              <div className="absolute left-0 w-16 h-16 bg-white border-4 border-teal-500 rounded-full flex items-center justify-center font-bold text-teal-600">
                {event.year}
              </div>
              
              <h3
                style={{
                  color: data.title_color || '#111827',
                  fontSize: `${(data.title_size || 26) - 4}px`,
                  fontWeight: '600',
                }}
              >
                {evTitle}
              </h3>
              <p
                style={{
                  color: data.content_color || '#4B5563',
                  fontSize: `${data.content_size || 15}px`,
                  lineHeight: '1.6'
                }}
                className="whitespace-pre-wrap text-sm"
              >
                {evDesc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Comparison - Table/feature comparison
export function ComparisonPreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const items = data.comparison_items || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <h1
        style={{
          color: data.title_color || '#111827',
          fontSize: `${data.title_size || 22}px`,
          fontWeight: '600',
        }}
        className="text-center font-bold"
      >
        {title}
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {items.map((item, idx) => {
              const itemName = lang === 'mn' ? item.name_mn : item.name_en;
              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4 font-bold border border-gray-200" style={{ color: data.title_color || '#111827' }}>
                    {itemName}
                  </td>
                  {Object.entries(item.features).map(([key, value]) => (
                    <td key={key} className="p-4 border border-gray-200" style={{ color: data.content_color || '#1F2937' }}>
                      {value}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 💬 Testimonial - Quotes and reviews
export function TestimonialPreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const testimonials = data.testimonials || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
      <h1
        style={{
          color: data.title_color || '#111827',
          fontSize: `${data.title_size || 28}px`,
          fontWeight: '600',
          fontFamily: data.title_family,
        }}
        className="text-center font-bold"
      >
        {title}
      </h1>

      <div className="space-y-8">
        {testimonials.map((testimonial, idx) => {
          const quote = lang === 'mn' ? testimonial.quote_mn : testimonial.quote_en;
          const author = lang === 'mn' ? testimonial.author_mn : testimonial.author_en;
          return (
            <div key={idx} className="bg-linear-to-r from-blue-50 to-indigo-50 p-8 rounded-lg border-l-4 border-blue-500">
              <blockquote
                style={{
                  color: data.content_color || '#4B5563',
                  fontSize: `${data.content_size || 16}px`,
                  fontFamily: data.content_family || 'Georgia, serif',
                  lineHeight: '1.8',
                }}
                className="italic whitespace-pre-wrap mb-4"
              >
                "{quote}"
              </blockquote>
              <div
                style={{
                  color: data.title_color || '#111827',
                  fontWeight: '600',
                }}
              >
                — {author}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 🖼️ Gallery - Image gallery/masonry
export function GalleryPreview({ data, lang }: PreviewProps) {
  const title = lang === 'mn' ? data.title_mn : data.title_en;
  const images = data.gallery_images || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <h1
        style={{
          color: data.title_color || '#111827',
          fontSize: `${data.title_size || 24}px`,
          fontWeight: '600',
        }}
        className="text-center font-bold"
      >
        {title}
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        {images.map((image, idx) => {
          const caption = lang === 'mn' ? image.caption_mn : image.caption_en;
          return (
            <div key={idx} className="space-y-2 group cursor-pointer">
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    📷 No image
                  </div>
                )}
              </div>
              {caption && (
                <p
                  style={{
                    color: data.content_color || '#1F2937',
                    fontSize: `${data.content_size || 14}px`,
                  }}
                  className="text-center text-sm"
                >
                  {caption}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
