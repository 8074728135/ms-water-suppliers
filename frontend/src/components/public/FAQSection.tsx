import { useState, useEffect, useRef } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
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

  const faqs = [
    {
      q: 'How do I order water with MS Water Suppliers in Hindupur?',
      a: 'You can order online in 60 seconds by clicking "Book Delivery Online" or by calling our direct hotline at +91 94405 23340. Select your package (Full Tanker 10,000L, Half Tanker 5,000L, or 100L Water Drums), enter your Hindupur delivery street, and select your preferred delivery time slot.',
    },
    {
      q: 'What water capacities and fixed rates are offered?',
      a: 'We have three standard, honest packages: Full Tanker (10,000 Litres for ₹400), Half Tanker (5,000 Litres for ₹200), and individual 100-Litre Water Drums (₹50 per drum). All prices include delivery and discharge hose pumping within Hindupur.',
    },
    {
      q: 'Which areas in Hindupur do you deliver to?',
      a: 'We deliver across all municipal wards and surrounding localities in Hindupur, including Melapuram, Kotnoor, Clock Tower, Main Bazaar, Penukonda Road, RTC Bus Stand, Railway Colony, Parigi Road, and the Industrial Estate.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Cash on Delivery upon tanker arrival, instant UPI (PhonePe, Google Pay, Paytm) via driver QR code, as well as Khata credit accounts for verified recurring business clients and apartment associations.',
    },
    {
      q: 'Can I track my water delivery status?',
      a: 'Yes! Once your booking is confirmed, you can log in to view real-time delivery status: Order Confirmed → Driver Assigned → Driver On The Way → Arrived at Gate → Delivered.',
    },
    {
      q: 'Can I place an urgent phone order right now?',
      a: 'Yes, our dispatch operators take immediate phone bookings daily from 6:00 AM to 9:00 PM at +91 94405 23340 for fast local delivery across Hindupur.',
    },
  ];

  return (
    <section id="faqs" ref={sectionRef} className="py-24 sm:py-36 bg-slate-50 border-t border-slate-200/80">
      <div className="app-container max-w-4xl space-y-16">
        
        {/* Section Header */}
        <div
          className="reveal-on-scroll section-header-block text-center space-y-4 mb-16 sm:mb-24 pb-4"
          style={{ marginBottom: '4.5rem' }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-sky-700 uppercase tracking-wider shadow-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Everything You Need to Know
          </h2>
          <p className="topic-desc text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mt-4">
            Quick answers about water tanker delivery, capacity, pricing, and timing in Hindupur.
          </p>
        </div>

        {/* FAQ Accordion List with Generous Breathing Room */}
        <div
          className="space-y-4 module-start-gap mt-16 sm:mt-24 pt-6"
          style={{ marginTop: '4rem' }}
        >
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`reveal-on-scroll bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-sky-300 ring-2 ring-sky-100 shadow-sm' : 'border-slate-200/90 shadow-xs'
                }`}
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-7 sm:p-8 text-left flex items-center justify-between gap-6 group"
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {faq.q}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600'
                  }`}>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-7 pb-8 pt-6 sm:px-8 sm:pb-8 sm:pt-6 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
