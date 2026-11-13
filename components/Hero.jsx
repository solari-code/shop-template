"use client";

import Image from 'next/image';
import { siteConfig } from '@/config/site.mjs';

// Homepage section "hero" (config/homepage.mjs): full-screen image with the
// logo for images (logos.onImage).
const Hero = ({ id, image }) => {
    return (
        <section id={id} className="relative h-screen w-full">
            <div className="hero-background w-full h-full absolute">
                <Image
                    alt="hero background"
                    layout="fill"
                    objectFit="cover"
                    priority
                    src={image}
                />
            </div>
            <div className="hero-overlay absolute inset-0 z-10"></div>
            <div className="relative h-full w-full flex flex-col items-center justify-center text-center z-20 px-6">
                <Image width="500" height="500" alt={siteConfig.name} src={siteConfig.logos.onImage} />
            </div>
        </section>
    );
};

export default Hero;
