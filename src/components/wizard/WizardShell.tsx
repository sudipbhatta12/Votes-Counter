"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useElectionStore } from "@/store/electionStore";
import type { WizardStep } from "@/lib/types";

const STEP_LABELS: Record<WizardStep, string> = {
    login: "लगइन",
    "select-type": "निर्वाचन प्रकार",
    "select-location": "मतदान स्थल",
    tally: "मत गणना",
    upload: "मुचुल्का",
    confirmation: "पुष्टि",
};

const STEP_ORDER: WizardStep[] = [
    "login",
    "select-type",
    "select-location",
    "tally",
    "upload",
    "confirmation",
];

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
    }),
};

interface WizardShellProps {
    children: Record<WizardStep, React.ReactNode>;
}

export default function WizardShell({ children }: WizardShellProps) {
    const { currentStep, direction } = useElectionStore();
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const totalSteps = STEP_ORDER.length;

    // Hide progress bar on login (step 0) and confirmation (last step)
    const showProgress = currentIndex > 0 && currentIndex < totalSteps - 1;

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Step Progress Bar */}
            {showProgress && (
                <div className="px-4 py-2 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-1 mb-1">
                        {STEP_ORDER.slice(1, -1).map((step, idx) => (
                            <div
                                key={step}
                                className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${idx < currentIndex
                                        ? "bg-blue-600"
                                        : idx === currentIndex - 1
                                            ? "bg-blue-600"
                                            : "bg-slate-200"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                        {STEP_LABELS[currentStep]} ({currentIndex}/{totalSteps - 2})
                    </p>
                </div>
            )}

            {/* Animated Step Content */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.15 },
                        }}
                        className="absolute inset-0 flex flex-col overflow-y-auto"
                    >
                        {children[currentStep]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
