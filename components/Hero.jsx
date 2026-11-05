"use client";

// import Logo from './Logo';
import Image from 'next/image';
// import AnimatedCTAButton from './ui/AnimatedButton';
// import { motion } from "framer-motion"
import { useEffect, useRef, useState } from 'react';
// import { useMediaQuery } from '@/hooks/useMediaQuery';

const Hero = () => {


    return (
        <section id="hero" className="relative h-screen w-full">
            <div className="hero-background w-full h-full absolute">
                <Image
                    alt="hero background"
                    layout="fill"
                    objectFit="cover"
                    priority
                    src="/images/hero_1.jpeg"
                />
            </div>
            <div className="hero-overlay absolute inset-0 z-10"></div>
            <div className="relative h-full w-full flex flex-col items-center justify-center text-center z-20 px-6">
                <Image width="500" height="500" alt="logo" src="/images/logo/logo_slowfashion_white.png" />
            </div>
        </section>
    );
};

export default Hero;