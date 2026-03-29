import React from 'react'
import { IoPause, IoPlay, IoVolumeHigh, IoVolumeMute } from 'react-icons/io5'

interface VideoOverlayIconsProps {
    showPlayPauseIcon: boolean
    showMutedIcon: boolean
    isPlaying: boolean
    isMuted: boolean
}

export function VideoOverlayIcons({ showPlayPauseIcon, showMutedIcon, isPlaying, isMuted }: VideoOverlayIconsProps) {
    return (
        <>
            {showPlayPauseIcon && (
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] origin-center animate-popup text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]'>
                    {isPlaying ? <IoPause className='text-[4.25rem]' /> : <IoPlay className='text-[4.25rem]' />}
                </div>
            )}
            {showMutedIcon && (
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] origin-center animate-popup text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]'>
                    {isMuted ? (
                        <IoVolumeMute className='text-[4.25rem]' />
                    ) : (
                        <IoVolumeHigh className='text-[4.25rem]' />
                    )}
                </div>
            )}
        </>
    )
}
