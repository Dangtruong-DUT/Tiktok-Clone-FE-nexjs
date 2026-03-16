"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BannerKiNiem80NamVietNamFixed() {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="group fixed top-4 right-4 z-50 w-64"
                >
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute -top-2 -right-2 p-1 bg-white/80 hover:bg-white rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                        <X size={14} />
                    </button>
                    <div className="bg-gradient-to-br from-red-600 to-transparent rounded-lg shadow-md p-3 text-center">
                        <Image
                            src="/images/logo_ki_niem_2-9.jpeg"
                            alt="Mừng Quốc Khánh 2-9"
                            width={80}
                            height={80}
                            className="mx-auto rounded-full border border-yellow-300"
                        />
                        <h2 className="text-sm font-semibold text-white mt-2">Kỷ niệm 80 năm</h2>
                        <p className="text-xs text-yellow-100">Quốc Khánh 2-9</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
