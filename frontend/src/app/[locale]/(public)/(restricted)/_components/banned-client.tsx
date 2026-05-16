'use client'

import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { AlertOctagon, ArrowRight, FileText, Scale, ShieldAlert, CheckCircle2 } from 'lucide-react'

interface BannedClientProps {
    remainingDays: number | null
    banUntilLabel: string | null
    tTitle: string
    tDescription: string
    tLockWithDays: string
    tLockWithoutDays: string
    tBanUntil: string
    tNextStepsTitle: string
    tNextStepOne: string
    tNextStepTwo: string
    tAppealCardTitle: string
    tAppealCardBody: string
    tAppealAction: string
}

export function BannedClient({
    remainingDays,
    banUntilLabel,
    tTitle,
    tDescription,
    tLockWithDays,
    tLockWithoutDays,
    tBanUntil,
    tNextStepsTitle,
    tNextStepOne,
    tNextStepTwo,
    tAppealCardTitle,
    tAppealCardBody,
    tAppealAction
}: BannedClientProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='w-full max-w-[480px] overflow-hidden rounded-[20px] border border-neutral-200 bg-white shadow-sm'
        >
            <div className='px-6 pt-10 pb-6 text-center sm:px-8'>
                <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/50'>
                    <ShieldAlert className='h-8 w-8' />
                </div>

                <h1 className='text-2xl font-bold tracking-tight text-neutral-900'>{tTitle}</h1>
                <p className='mt-2 text-sm leading-relaxed text-neutral-600'>{tDescription}</p>
            </div>

            <div className='px-6 py-4 sm:px-8'>
                {/* Status Box */}
                <div className='mb-6 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4'>
                    <div className='flex items-start gap-3'>
                        <AlertOctagon className='mt-0.5 h-5 w-5 shrink-0 text-red-600' />
                        <div>
                            <h3 className='font-semibold text-neutral-900'>
                                {remainingDays !== null ? tLockWithDays : tLockWithoutDays}
                            </h3>
                            {banUntilLabel && <p className='mt-1 text-sm font-medium text-neutral-500'>{tBanUntil}</p>}
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className='space-y-4 mb-6'>
                    <h3 className='text-sm font-semibold text-neutral-900'>{tNextStepsTitle}</h3>

                    <ul className='space-y-3'>
                        <li className='flex gap-3'>
                            <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100'>
                                <FileText className='h-3 w-3 text-neutral-600' />
                            </div>
                            <span className='text-sm text-neutral-600'>{tNextStepOne}</span>
                        </li>
                        <li className='flex gap-3'>
                            <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100'>
                                <CheckCircle2 className='h-3 w-3 text-neutral-600' />
                            </div>
                            <span className='text-sm text-neutral-600'>{tNextStepTwo}</span>
                        </li>
                    </ul>
                </div>

                {/* Appeal Info */}
                <div className='mb-6'>
                    <h4 className='font-semibold text-neutral-900'>{tAppealCardTitle}</h4>
                    <p className='mt-1 text-sm text-neutral-500'>{tAppealCardBody}</p>
                </div>

                {/* Actions */}
                <div className='space-y-3'>
                    <Link
                        href='/appeal?appeal_type=user_ban&resource_type=user'
                        className='group flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800'
                    >
                        <Scale className='h-4 w-4' />
                        {tAppealAction}
                        <ArrowRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </Link>
                </div>
            </div>

            <div className='h-6' />
        </motion.div>
    )
}
