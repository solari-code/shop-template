import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site.mjs';
import { footerConfig } from '@/config/pages.mjs';
import SocialIcon, { SOCIAL_ICONS } from './SocialIcon';

const Footer = () => {
    const year = new Date().getFullYear();
    const { name, owner, contact, social, logos } = siteConfig;

    return (
        <footer className="bg-brand-neutral text-brand-on-image  relative" >
            <div className="footer-background w-full h-full absolute z-0">
                <Image
                    alt="hero background"
                    layout="fill"
                    objectFit='cover'
                    objectPosition='top'
                    priority
                    src={footerConfig.backgroundImage}
                />
            </div>
            <div className="footer-overlay absolute inset-0 z-10"></div>
            <div className="container mx-auto px-6 py-16 text-center z-20 relative h-full w-full">
                <Link href="/" className="inline-block mb-8 w-[250px]">
                    <Image width="300" height="100" alt={name} src={logos.light} />
                </Link>

                {social.length > 0 && (
                    <div className="flex justify-center space-x-6 mb-8">
                        {social.map(({ type, url }) => (
                            <a key={url} target="_blank" href={url} rel="noopener noreferrer" aria-label={SOCIAL_ICONS[type]?.label ?? type} className="hover:text-brand-on-image transition-colors">
                                <SocialIcon type={type} />
                            </a>
                        ))}
                    </div>
                )}

                <div className="text-sm space-y-1 mb-8">
                    <p className="font-bold text-brand-on-image text-lg">Contact</p>
                    <p>{owner.name}</p>
                    <p>
                        <a href={`mailto:${contact.email}`} className="hover:text-brand-on-image transition-colors">
                            {contact.email}
                        </a>
                    </p>
                    {contact.phone && (
                        <p>
                            <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-brand-on-image transition-colors">
                                {contact.phone}
                            </a>
                        </p>
                    )}
                </div>

                <div className="text-sm space-y-1">
                    <div className="flex justify-center space-x-4 mb-1">
                        <Link href="/privacy-policy" className="hover:text-brand-on-image transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-brand-on-image transition-colors">Terms of Service</Link>
                    </div>
                    <p>{`© ${name} ${year}`}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;