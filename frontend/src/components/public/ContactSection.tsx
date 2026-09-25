import { useState, useEffect, useRef } from 'react';
import { Phone, MapPin, Clock, Send, MessageCircle, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success('Thank you! Our Hindupur dispatch team will call you shortly.');
      setName('');
      setMobile('');
      setMessage('');
      setSending(false);
    }, 600);
  };

  return (
    <section id="contact" ref={sectionRef} className="py-24 sm:py-36 bg-white border-t border-slate-200/80">
      <div className="app-container space-y-16">
        
        {/* Section Grid with Generous Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Business Details */}
          <div className="reveal-on-scroll lg:col-span-5 space-y-8">
            <div className="space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700 uppercase tracking-wider">
                <Headphones className="w-3.5 h-3.5" />
                <span>LOCAL DISPATCH CONTACT</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Connect With Our Hindupur Dispatch Desk
              </h2>
              <p className="topic-desc text-base sm:text-lg text-slate-600 leading-relaxed mt-4">
                Need an immediate tanker load, regular schedule delivery, or a bulk commercial arrangement? We are ready to assist.
              </p>
            </div>

            <div className="space-y-5 pt-6 mt-4">
              {/* Phone Card with Generous 4-Sided Padding */}
              <div className="flex items-start gap-5 p-7 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-colors group shadow-2xs">
                <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Direct Hotline</div>
                  <a href="tel:9440523340" className="text-xl sm:text-2xl font-black text-slate-900 hover:text-sky-600 transition-colors tabular-nums block mt-1">
                    +91 94405 23340
                  </a>
                  <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Dispatch Operators On Duty</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Card with Generous 4-Sided Padding */}
              <div className="flex items-start gap-5 p-7 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors group shadow-2xs">
                <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">WhatsApp Fast Booking</div>
                  <a
                    href="https://wa.me/919440523340?text=Hi%20MS%20Water,%20I%20need%20a%20water%20tank%20delivery%20in%20Hindupur"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors block mt-1"
                  >
                    Send Delivery Address on WhatsApp →
                  </a>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">Share your location for immediate tanker assignment</div>
                </div>
              </div>

              {/* Location Card with Generous 4-Sided Padding */}
              <div className="flex items-start gap-5 p-7 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-colors group shadow-2xs">
                <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Central Dispatch Hub</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1 leading-relaxed">
                    Main Road, Near RTC Bus Stand & Melapuram Junction, Hindupur, Andhra Pradesh - 515201
                  </div>
                </div>
              </div>

              {/* Hours Card with Generous 4-Sided Padding */}
              <div className="flex items-start gap-5 p-7 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-colors group shadow-2xs">
                <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fleet Operating Hours</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">
                    6:00 AM – 9:00 PM (Monday through Sunday, 365 Days)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Callback Form */}
          <div className="reveal-on-scroll lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 space-y-8 shadow-sm" style={{ transitionDelay: '100ms' }}>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Request a Callback or Send an Inquiry
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                Enter your details and our Hindupur dispatch operator will call you back within 10 minutes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="input-field text-sm h-13"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    className="input-field text-sm h-13"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Delivery Address or Inquiry Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter street address, landmark in Hindupur or water requirement"
                  className="input-field text-sm py-3.5 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full h-13 text-sm sm:text-base font-bold shadow-md shadow-sky-600/20 flex items-center justify-center gap-2.5"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Sending to Dispatch...' : 'Submit Callback Request'}</span>
              </button>

              <div className="text-center text-xs text-slate-500 leading-relaxed">
                We respect your privacy. No spam. You will only be called regarding your delivery request.
              </div>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
