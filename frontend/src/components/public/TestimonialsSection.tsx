import { useEffect, useRef } from 'react';
import { Star, CheckCircle, ShieldCheck } from 'lucide-react';

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = sectionRef.current?.querySelectorAll('.reveal-on-scroll');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const reviews = [
    {
      name: 'Ramesh K.',
      location: 'Melapuram Ward 2, Hindupur',
      rating: 5,
      date: 'Delivered 3 days ago',
      packageOrdered: 'Full Tanker (10,000L)',
      review:
        'The tanker arrived at our independent house within 50 minutes of booking. The water was fresh, sweet, and clear. The driver unrolled long hoses directly into our underground sump. Paid ₹400 via PhonePe QR code. Super smooth service!',
    },
    {
      name: 'Sunitha Reddy',
      location: 'Penukonda Road, Hindupur',
      rating: 5,
      date: 'Delivered 1 week ago',
      packageOrdered: 'Full Tanker (10,000L)',
      review:
        'We manage a 12-flat apartment complex near Penukonda Road. During water shortages, MS Water Suppliers is our primary lifesaver. Always dependable, transparent fixed rates with no bargaining or last-minute delays.',
    },
    {
      name: 'Anand Kumar V.',
      location: 'Main Bazaar, Hindupur',
      rating: 5,
      date: 'Delivered 2 weeks ago',
      packageOrdered: 'Water Drums (100L × 4)',
      review:
        'Needed 4 drums of water for our retail showroom renovation. The drums were clean, properly sealed, and delivered right on time. Very polite driver who assisted with unloading and placement.',
    },
  ];

  return (
    <section id="reviews" ref={sectionRef} className="py-24 sm:py-36 bg-white border-t border-slate-200/80">
      <div className="app-container space-y-16">
        
        {/* Header & Amazon-Style Rating Summary with Generous Margins */}
        <div
          className="reveal-on-scroll section-header-block flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-24 pb-4"
          style={{ marginBottom: '4.5rem' }}
        >
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <span>CUSTOMER EXPERIENCES & TRUST</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Trusted by 850+ Families Across Hindupur
            </h2>
            <p className="topic-desc text-base sm:text-lg text-slate-600 leading-relaxed mt-4">
              Read verified feedback from genuine residents, apartment societies, and local businesses in Hindupur.
            </p>
          </div>

          {/* Amazon Rating Summary Box with Generous 4-Sided Space */}
          <div
            className="rounded-3xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-6 shrink-0"
            style={{ padding: '2rem 2.5rem', boxSizing: 'border-box' }}
          >
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900 tabular-nums">4.9</div>
              <div className="flex items-center text-amber-400 mt-1.5 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">850+ ratings</div>
            </div>

            <div className="h-14 w-px bg-slate-200" />

            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex items-center gap-2 font-bold text-emerald-700 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Verified Deliveries</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">96% 5-Star Ratings in Hindupur</div>
            </div>
          </div>
        </div>

        {/* 3 Review Cards Grid with Generous 4-Sided Padding */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 module-start-gap mt-16 sm:mt-24 pt-6"
          style={{ marginTop: '4rem' }}
        >
          {reviews.map((rev, idx) => (
            <div
              key={rev.name}
              className="reveal-on-scroll bg-white rounded-3xl border border-slate-200/90 testimonial-card space-y-7 flex flex-col justify-between group hover:border-sky-300 hover:shadow-md transition-all duration-300 shadow-xs"
              style={{
                padding: '2.75rem 2.5rem',
                transitionDelay: `${idx * 100}ms`,
                boxSizing: 'border-box',
              }}
            >
              <div className="space-y-4">
                {/* Rating Stars & Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{rev.date}</span>
                </div>

                {/* Review Text with Spacious Line Height */}
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic font-normal">
                  "{rev.review}"
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <span>{rev.name}</span>
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{rev.location}</div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-3.5 py-1.5 rounded-lg border border-sky-100">
                    {rev.packageOrdered}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
