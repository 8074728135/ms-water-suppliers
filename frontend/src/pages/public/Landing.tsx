import Header from '../../components/public/Header';
import HeroSection from '../../components/public/HeroSection';
import CoverageBar from '../../components/public/CoverageBar';
import WaterPackages from '../../components/public/WaterPackages';
import HowItWorksSection from '../../components/public/HowItWorksSection';
import PriceEstimatorSection from '../../components/public/PriceEstimatorSection';
import QualitySection from '../../components/public/QualitySection';
import TestimonialsSection from '../../components/public/TestimonialsSection';
import FAQSection from '../../components/public/FAQSection';
import ContactSection from '../../components/public/ContactSection';
import Footer from '../../components/public/Footer';
import { Toaster } from 'react-hot-toast';

export default function Landing() {
  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-sky-500/20 selection:text-sky-800">
      <Toaster position="top-right" />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CoverageBar />
        <WaterPackages />
        <HowItWorksSection />
        <PriceEstimatorSection />
        <QualitySection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
