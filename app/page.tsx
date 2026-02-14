import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import EducationModules from "@/components/landing/EducationModules";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import BackgroundDecoration from "@/components/landing/BackgroundDecoration";

export default function Home() {
    return (
        <main className="min-h-screen relative overflow-x-hidden">
            <BackgroundDecoration />
            <Hero />
            <Features />
            <EducationModules />
            <Pricing />
            <Testimonials />
            <CTA />
        </main>
    );
}
