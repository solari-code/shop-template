import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-brand-neutral text-white  relative" >
            <div className="footer-background w-full h-full absolute z-0">
                <Image
                    alt="hero background"
                    layout="fill"
                    objectFit='cover'
                    objectPosition='top'
                    priority
                    src="/images/hero_5.jpeg"
                />
            </div>
            <div className="footer-overlay absolute inset-0 z-10"></div>
            <div className="container mx-auto px-6 py-16 text-center z-20 relative h-full w-full">
                <Link href="/" className="inline-block mb-8 w-[250px]">
                    <Image width="300" height="100" alt="logo" src="/images/logo/logo_slowfashion_white.png" />
                </Link>

                {/* <div className="flex justify-center space-x-6 mb-8">
                    <Link href="/" className="text-brand-gray hover:text-white transition-colors">Home</Link>
                    <Link href="/products" className="text-brand-gray hover:text-white transition-colors">Products</Link>
                    <Link href="/about" className="text-brand-gray hover:text-white transition-colors">About</Link>
                    <Link href="/#contact" className="text-brand-gray hover:text-white transition-colors">Contact</Link>
                </div> */}

                <div className="flex justify-center space-x-6 mb-8">
                    <a target="_blank" href="https://www.instagram.com/" rel="noopener noreferrer" aria-label="Instagram" className="text-brand-gray hover:text-white transition-colors">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg>
                    </a>
                </div>

                <div className="text-brand-gray text-sm space-y-1 mb-8">
                    <p className="font-bold text-white text-lg">Contact</p>
                    <p>Mara Silva</p>
                    <p>
                        <a href="mailto:hello@example.com" className="hover:text-white transition-colors">
                            hello@example.com
                        </a>
                    </p>
                </div>

                <div className="text-brand-gray text-sm space-y-1">
                    <div className="flex justify-center space-x-4 mb-1">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                    <p>© Selva Studio {year}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;