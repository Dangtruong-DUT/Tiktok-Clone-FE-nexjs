"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Slider from "@/components/photo-editor-dialog/slider";

interface PhotoEditorProps {
    photoUrl?: string;
    onConfirm: (value: File | null) => void;
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
}

export default function PhotoEditorDialog({ photoUrl, isVisible, setVisible, onConfirm }: PhotoEditorProps) {
    const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [scale, setScale] = useState<number>(1);

    const imgWrapperRef = useRef<HTMLDivElement | null>(null);
    const posRef = useRef({ x: 0, y: 0 });
    const startPointerRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });
    const draggingRef = useRef(false);
    const rafRef = useRef<number | null>(null);

    const applyTransform = useCallback(
        (x: number, y: number, scaleValue: number = scale) => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                if (imgWrapperRef.current) {
                    imgWrapperRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scaleValue})`;
                }
            });
        },
        [scale]
    );

    const initImageSize = useCallback(
        (url: string) => {
            if (!url) return;
            const img = new window.Image();
            img.src = url;
            img.onload = () => {
                let { width, height } = img;

                if (width < height) {
                    height = (height / width) * 360;
                    width = 360;
                } else {
                    width = (width / height) * 360;
                    height = 360;
                }

                setSize({ width, height });

                const startX = (360 - width) / 2;
                const startY = (360 - height) / 2;
                posRef.current = { x: startX, y: startY };
                applyTransform(startX, startY, scale);
            };
        },
        [scale, applyTransform]
    );

    const clampPosition = useCallback(
        (x: number, y: number, scaleValue: number = scale) => {
            const scaledWidth = size.width * scaleValue;
            const scaledHeight = size.height * scaleValue;

            // Calculate the offset needed because scaling happens from center
            const scaleOffsetX = (scaledWidth - size.width) / 2;
            const scaleOffsetY = (scaledHeight - size.height) / 2;

            // Calculate bounds considering the scale offset
            const maxX = scaleOffsetX;
            const maxY = scaleOffsetY;
            const minX = 360 - scaledWidth + scaleOffsetX;
            const minY = 360 - scaledHeight + scaleOffsetY;

            return {
                x: Math.min(maxX, Math.max(minX, x)),
                y: Math.min(maxY, Math.max(minY, y)),
            };
        },
        [size, scale]
    );
    useEffect(() => {
        if (photoUrl) initImageSize(photoUrl);
        else {
            setSize({ width: 0, height: 0 });
            setScale(1);
        }
    }, [photoUrl, initImageSize]);

    const handleSliderChange = useCallback(
        (value: number) => {
            const scaleValue = 1 + (value / 100) * 2; // Scale from 1 to 3
            setScale(scaleValue);
            const { x, y } = clampPosition(posRef.current.x, posRef.current.y, scaleValue);
            posRef.current = { x, y };
            applyTransform(x, y, scaleValue);
        },
        [applyTransform, clampPosition]
    );

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;

        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        draggingRef.current = true;
        startPointerRef.current = { x: e.clientX, y: e.clientY };
        startPosRef.current = { ...posRef.current };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current) return;

        const dx = e.clientX - startPointerRef.current.x;
        const dy = e.clientY - startPointerRef.current.y;

        const nextX = startPosRef.current.x + dx;
        const nextY = startPosRef.current.y + dy;

        posRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY, scale);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;

        const { x, y } = clampPosition(posRef.current.x, posRef.current.y);
        posRef.current = { x, y };
        applyTransform(x, y, scale);

        try {
            (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        } catch {}
        (e.currentTarget as HTMLElement).style.cursor = "grab";
    };

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const createCroppedImage = useCallback(async (): Promise<File | null> => {
        if (!photoUrl) return null;

        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(null);
                return;
            }

            canvas.width = 360;
            canvas.height = 360;

            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;

                // Tính toán tỷ lệ giữa kích thước gốc và kích thước hiển thị
                let displayRatio: number;
                let displayWidth: number;
                let displayHeight: number;

                if (naturalWidth < naturalHeight) {
                    displayWidth = 360;
                    displayHeight = (naturalHeight / naturalWidth) * 360;
                    displayRatio = naturalWidth / displayWidth;
                } else {
                    displayHeight = 360;
                    displayWidth = (naturalWidth / naturalHeight) * 360;
                    displayRatio = naturalHeight / displayHeight;
                }

                // Vị trí hiện tại của ảnh trong viewport (360x360)
                const currentX = posRef.current.x;
                const currentY = posRef.current.y;

                // Khu vực crop trong hệ tọa độ hiển thị (viewport 360x360)
                const cropStartX = -currentX;
                const cropStartY = -currentY;
                const cropWidth = 360 / scale;
                const cropHeight = 360 / scale;

                const sourceX = cropStartX * displayRatio;
                const sourceY = cropStartY * displayRatio;
                const sourceWidth = cropWidth * displayRatio;
                const sourceHeight = cropHeight * displayRatio;

                const clampedSourceX = Math.max(0, Math.min(naturalWidth - sourceWidth, sourceX));
                const clampedSourceY = Math.max(0, Math.min(naturalHeight - sourceHeight, sourceY));
                const clampedSourceWidth = Math.min(sourceWidth, naturalWidth - clampedSourceX);
                const clampedSourceHeight = Math.min(sourceHeight, naturalHeight - clampedSourceY);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(
                    img,
                    clampedSourceX,
                    clampedSourceY,
                    clampedSourceWidth,
                    clampedSourceHeight,
                    0,
                    0,
                    360,
                    360
                );

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const file = new File([blob], "cropped-image.png", { type: "image/png" });
                            resolve(file);
                        } else {
                            resolve(null);
                        }
                    },
                    "image/png",
                    0.9
                );
            };

            img.onerror = () => {
                resolve(null);
            };

            img.src = photoUrl;
        });
    }, [photoUrl, scale]);

    const handleConfirm = async () => {
        const croppedFile = await createCroppedImage();
        onConfirm(croppedFile);
        setVisible(false);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    return (
        <Dialog open={isVisible} onOpenChange={setVisible}>
            <DialogContent className="min-w-fit! p-0!">
                <DialogHeader className="p-4! border-b bg-card">
                    <DialogTitle>Edit Photo</DialogTitle>
                </DialogHeader>

                <div className="h-[411px] w-[700px] relative overflow-hidden flex items-center justify-center">
                    <div className="w-[360px] h-[360px] relative">
                        <div
                            ref={imgWrapperRef}
                            className="absolute left-0 top-0 cursor-move select-none"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                        >
                            <Image
                                src={photoUrl ?? ""}
                                alt="Edit Photo"
                                width={size.width}
                                height={size.height}
                                draggable={false}
                                className="inline-block max-w-[unset] pointer-events-auto"
                            />
                        </div>
                    </div>

                    <div className="absolute block w-[360px] h-[360px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [box-shadow:0_0_0_250px_rgba(0,0,0,0.3)] pointer-events-none" />
                </div>
                <div className="flex items-center justify-center gap-4">
                    <span className="text-sm font-medium">Zoom</span>
                    <Slider
                        onChange={handleSliderChange}
                        value={((scale - 1) / 2) * 100} // Convert scale (1-3) to slider value (0-100)
                    />
                </div>

                <footer className="flex items-center justify-end gap-4 p-4 border-t  bg-card">
                    <Button
                        variant="outline"
                        className="h-10 rounded-lg cursor-pointer text-sm font-medium"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="primary-button h-10! rounded-lg! cursor-pointer text-sm! font-medium!"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </Button>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
