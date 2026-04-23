'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Check, Shield, FileText, Upload, CheckCircle2 } from 'lucide-react'

interface AppealStepperProps {
    currentStep: number
    steps: { label: string; icon: 'verify' | 'details' | 'upload' | 'confirm' }[]
}

const STEP_ICONS = {
    verify: Shield,
    details: FileText,
    upload: Upload,
    confirm: CheckCircle2
} as const

/**
 * Multi-step progress indicator with animated transitions.
 */
export function AppealStepper({ currentStep, steps }: AppealStepperProps) {
    return (
        <div className='flex items-center justify-between gap-2'>
            {steps.map((step, index) => {
                const StepIcon = STEP_ICONS[step.icon]
                const isCompleted = index < currentStep
                const isActive = index === currentStep

                return (
                    <div key={step.label} className='flex flex-1 items-center'>
                        {/* Step circle */}
                        <div className='flex flex-col items-center gap-1.5'>
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    backgroundColor: isCompleted
                                        ? '#000000'
                                        : isActive
                                          ? '#000000'
                                          : '#f5f5f5',
                                    borderColor: isCompleted
                                        ? '#000000'
                                        : isActive
                                          ? '#000000'
                                          : '#d4d4d4'
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-full border-2',
                                    isCompleted || isActive ? 'text-white' : 'text-neutral-400'
                                )}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    >
                                        <Check className='h-4 w-4' />
                                    </motion.div>
                                ) : (
                                    <StepIcon className='h-4 w-4' />
                                )}
                            </motion.div>
                            <span
                                className={cn(
                                    'text-[10px] font-medium text-center leading-tight max-w-[70px]',
                                    isActive ? 'text-black' : isCompleted ? 'text-neutral-600' : 'text-neutral-400'
                                )}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className='relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-neutral-200 mb-5'>
                                <motion.div
                                    initial={false}
                                    animate={{ width: isCompleted ? '100%' : '0%' }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className='absolute inset-y-0 left-0 bg-black'
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
