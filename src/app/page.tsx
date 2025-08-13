"use client";

import { Bell, Home as HomeIcon, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { StarBorder } from "@/components/ui/star-border";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import HeroFuturistic from "@/components/ui/hero-futuristic";

const tabs = [
  { title: "Dashboard", icon: HomeIcon },
  { title: "Notifications", icon: Bell },
  { type: "separator" as const },
  { title: "Settings", icon: Settings },
  { title: "Support", icon: HelpCircle },
  { title: "Security", icon: Shield },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedGradientBackground 
        Breathing={true}
        startingGap={120}
        breathingRange={10}
        animationSpeed={0.015}
      />
      
      {/* Navigation */}
      <div className="container mx-auto py-8 relative z-50">
        <div className="flex justify-center">
          <StarBorder as="div" className="w-fit">
            <ExpandableTabs 
              tabs={tabs}
              className="w-fit"
            />
          </StarBorder>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10">
        <HeroFuturistic />
      </div>
    </main>
  )
}
