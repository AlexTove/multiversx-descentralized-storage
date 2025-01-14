'use client';
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Features } from "@/components/features";
import { Shield, Upload, Database } from "lucide-react";
import EducationalMode from "@/components/main/educationalMode";
import InteractiveTutorial from "@/components/main/interactiveTutorial";

export default function Home() {
  
  const scrollToSection = (id: string) => {
    // Return early if we're on the server
    if (typeof window === 'undefined') return;
  
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold mb-6">
              Decentralized File Storage for the Future
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Store your files securely on IPFS with MultiversX wallet authentication.
              Fast, reliable, and truly decentralized.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => scrollToSection('interactive')}>Get Started</Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('educational-mode')}>Learn More</Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <Features />
        
        {/* Interactive Tutorial Section */}
        <div id="interactive">
          <InteractiveTutorial />
        </div>
        
        {/* Educational Mode Section */}
        <div id="educational-mode">
          <EducationalMode />
        </div>
       
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 DecentralStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
}