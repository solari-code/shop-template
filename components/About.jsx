"use client";

import Image from "next/image";
import { shopText } from "@/lib/config/shop.mjs";
import MultilineText from "./MultilineText";

// Homepage section "about" (config/homepage.mjs): image and text side by side.
export default function AboutSection({ id, eyebrow, heading, text, image, imageAlt = "" }) {
    return (
        <section
            id={id}
            className="py-20 lg:py-28 bg-brand-base-200 scroll-mt-16"
            aria-labelledby={`${id}-heading`}
        >
            <div className="container mx-auto px-6 fade-in">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 flex justify-center fade-in order-1">
                        <Image
                            src={image}
                            alt={shopText(imageAlt)}
                            width={400}
                            height={500}
                            className="max-w-full w-auto h-auto object-contain"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                    <div className="md:w-1/2 text-center md:text-left fade-in order-2">
                        {eyebrow && (
                            <p
                                id={`${id}-heading`}
                                className="text-[0.8rem] tracking-[0.28em] uppercase text-brand-content-muted font-light mb-4"
                            >
                                {shopText(eyebrow)}
                            </p>
                        )}
                        {/* Without an eyebrow, the heading labels the section */}
                        <h2 id={eyebrow ? undefined : `${id}-heading`} className="font-heading font-light text-2xl md:text-3xl text-brand-content leading-tight mb-4">
                            {shopText(heading)}
                        </h2>
                        <p className="font-sans font-light text-base md:text-lg text-brand-content-soft leading-relaxed">
                            <MultilineText text={shopText(text)} />
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
