"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, FileText, Users, MessageSquare, FolderCheck, CheckCircle2,
  UserPlus, Upload, Briefcase, Mic, FileDigit, PlaneTakeoff,
  PhoneCall, Scale, FileSignature, Landmark, ShieldCheck, FileCheck
} from "lucide-react";

import { useTranslations } from "next-intl";

const getTabsData = (t: any) => [
  {
    id: "companii",
    label: t("tabs.companies"),
    steps: [
      { id: 1, title: t("steps.companies.step1"), icon: Building2 },
      { id: 2, title: t("steps.companies.step2"), icon: FileText },
      { id: 3, title: t("steps.companies.step3"), icon: Users },
      { id: 4, title: t("steps.companies.step4"), icon: MessageSquare },
      { id: 5, title: t("steps.companies.step5"), icon: FolderCheck },
      { id: 6, title: t("steps.companies.step6"), icon: CheckCircle2 },
    ]
  },
  {
    id: "candidati",
    label: t("tabs.candidates"),
    steps: [
      { id: 1, title: t("steps.candidates.step1"), icon: UserPlus },
      { id: 2, title: t("steps.candidates.step2"), icon: Upload },
      { id: 3, title: t("steps.candidates.step3"), icon: Briefcase },
      { id: 4, title: t("steps.candidates.step4"), icon: Mic },
      { id: 5, title: t("steps.candidates.step5"), icon: FileDigit },
      { id: 6, title: t("steps.candidates.step6"), icon: PlaneTakeoff },
    ]
  },
  {
    id: "imigrare",
    label: t("tabs.immigration"),
    steps: [
      { id: 1, title: t("steps.immigration.step1"), icon: PhoneCall },
      { id: 2, title: t("steps.immigration.step2"), icon: Scale },
      { id: 3, title: t("steps.immigration.step3"), icon: FileSignature },
      { id: 4, title: t("steps.immigration.step4"), icon: Landmark },
      { id: 5, title: t("steps.immigration.step5"), icon: ShieldCheck },
      { id: 6, title: t("steps.immigration.step6"), icon: FileCheck },
    ]
  }
];

export default function HowItWorksPage() {
  const t = useTranslations("howItWorks");
  const tabsData = getTabsData(t);
  const [activeTab, setActiveTab] = useState(tabsData[0].id);

  const activeSteps = tabsData.find(t => t.id === activeTab)?.steps || [];

  return (
    <main className="min-h-screen pt-24 pb-16 bg-navy-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-navy-900 mb-6"
        >
          {t("title")}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          {t("subtitle")}
        </motion.p>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
          {tabsData.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-navy-900 text-white shadow-xl transform scale-105"
                  : "bg-white text-navy-600 hover:bg-navy-50 shadow"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-coral rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Steps Content */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-navy-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
            >
              {activeSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex flex-col items-center text-center p-6 bg-navy-50 rounded-xl hover:shadow-lg transition-shadow border border-navy-100"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-6 relative">
                      <Icon className="w-8 h-8 text-coral border-none" />
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-navy-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                        {step.id}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 mb-2">
                      {step.title}
                    </h3>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
