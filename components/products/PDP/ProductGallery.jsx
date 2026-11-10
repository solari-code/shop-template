"use client";

import { useState } from "react";
import Image from "next/image";
import { imageUrl } from "@/lib/imageUrl";

export default function ProductGallery({ images = [], title = "" }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = images[selectedIndex];

  const mainUrl = imageUrl(mainImage, { width: 800, quality: 85 });

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
      {/* Thumbnails: always show so main image size stays consistent (1 or more images) */}
      {images.length > 0 && (
        <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto pb-2 md:pb-0 md:max-h-[calc(80vh-2rem)] shrink-0">
          {images.map((image, i) => {
            const thumbUrl = imageUrl(image, { width: 150, quality: 70 });
            const isActive = i === selectedIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`relative w-14 h-14 md:w-16 md:h-16 shrink-0  overflow-hidden transition-opacity duration-200 hover:opacity-80 ${isActive ? "border-1 border border-brand-content" : ""
                  }`}
                aria-label={`View image ${i + 1}`}
              >
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt={`${title} - view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-base-300" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main image */}
      <div className="relative aspect-[3/4] w-full bg-brand-base-300 overflow-hidden order-1 md:order-2 flex-1">
        {mainUrl ? (
          <Image
            src={mainUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-light">
            No image
          </div>
        )}
      </div>
    </div>
  );
}
