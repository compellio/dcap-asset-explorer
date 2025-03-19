// components/ImageModal.tsx
import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface ImageModalProps {
    imageUrl: string;
    altText: string;
    isOpen: boolean;
    onClose: () => void;
}

// Create a base64 placeholder SVG for missing images
const createPlaceholderSVG = (width = 800, height = 600, text = 'No Image') => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#EAEAEA"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#777777" text-anchor="middle" dy=".3em">${text}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const ImageModal: React.FC<ImageModalProps> = ({
    imageUrl,
    altText,
    isOpen,
    onClose,
}) => {
    // Disable scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    // Close modal on ESC key press
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (isOpen && event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscKey);
        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-300 focus:outline-none"
                    aria-label="Close modal"
                >
                    <XMarkIcon className="h-8 w-8" />
                </button>
            </div>

            <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
                    <Image
                        src={imageUrl}
                        alt={altText}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority
                        placeholder="blur"
                        blurDataURL={createPlaceholderSVG()}
                    />
                </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-sm truncate max-w-2xl mx-auto px-4">
                    {altText}
                </p>
            </div>
        </div>
    );
};

export default ImageModal;