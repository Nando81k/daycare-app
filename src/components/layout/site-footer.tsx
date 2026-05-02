import {
  ArrowUpRightIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react"

import {
  AnimatedBottomSection,
  AnimatedBrandSection,
  AnimatedButton,
  AnimatedLink,
  AnimatedLinkSection,
  AnimatedLinksGrid,
  AnimatedLogo,
  AnimatedMainContent,
  AnimatedSocialIcon,
  AnimatedSocialLinks,
  AnimatedText,
  FooterWrapper,
} from "@/components/layout/client-footer"
import { buttonVariants } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"
import { footerNav } from "@/config/navigation"
import { cn } from "@/lib/utils"

interface LinkType {
  href: string
  label: string
}

interface LinkSectionProps {
  title: string
  links: LinkType[]
}

const CURRENT_YEAR = new Date().getFullYear()
const phoneHref = `tel:${brandConfig.phone.replace(/[^\d+]/g, "")}`

const FOOTER_SECTIONS: { title: string; links: LinkType[] }[] = [
  ...footerNav,
  {
    title: "Contact",
    links: [
      { href: "/contact", label: "Visit contact page" },
      { href: `mailto:${brandConfig.supportEmail}`, label: brandConfig.supportEmail },
      { href: phoneHref, label: brandConfig.phone },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
]

function LinkSection({ title, links }: LinkSectionProps) {
  return (
    <AnimatedLinkSection title={title}>
      <div className="flex flex-col gap-4 text-sm">
        <AnimatedText>
          <h3 className="font-medium text-foreground">{title}</h3>
        </AnimatedText>
        <ul className="space-y-3 text-muted-foreground">
          {links.map(({ href, label }) => (
            <AnimatedLink key={`${title}-${href}`} href={href}>
              {label}
            </AnimatedLink>
          ))}
        </ul>
      </div>
    </AnimatedLinkSection>
  )
}

export function Footer() {
  return (
    <footer className="mt-6 w-full border-t border-border/55 bg-background/88" aria-label="Site footer">
      <FooterWrapper>
        <AnimatedMainContent>
          <AnimatedBrandSection>
            <AnimatedLogo />
            <AnimatedText>
              <p className="editorial-kicker mt-4">{brandConfig.shortName}</p>
            </AnimatedText>
            <AnimatedText>
              <h3 className="max-w-sm text-balance text-2xl font-semibold text-foreground md:text-3xl">
                {brandConfig.tagline}
              </h3>
            </AnimatedText>
            <AnimatedText>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Affordable programs by age, quality care, and a welcoming next step for families in Benin City.
              </p>
            </AnimatedText>
            <AnimatedButton
              href="/signup/parent"
              className={cn(
                buttonVariants({ variant: "default" }),
                "mt-2 h-10 rounded-full px-5 text-sm font-medium"
              )}
            >
              {brandConfig.primaryCtaLabel}
            </AnimatedButton>
          </AnimatedBrandSection>

          <AnimatedLinksGrid>
            {FOOTER_SECTIONS.map((section) => (
              <LinkSection
                key={section.title}
                title={section.title}
                links={section.links}
              />
            ))}
          </AnimatedLinksGrid>
        </AnimatedMainContent>

        <AnimatedBottomSection>
          <AnimatedSocialLinks>
            <AnimatedSocialIcon
              href={`mailto:${brandConfig.supportEmail}`}
              ariaLabel={`Email ${brandConfig.name}`}
            >
              <MailIcon className="size-4" />
            </AnimatedSocialIcon>
            <AnimatedSocialIcon
              href={phoneHref}
              ariaLabel={`Call ${brandConfig.name}`}
            >
              <PhoneIcon className="size-4" />
            </AnimatedSocialIcon>
            <AnimatedSocialIcon
              href="/contact"
              ariaLabel={`Open the ${brandConfig.name} contact page`}
            >
              <ArrowUpRightIcon className="size-4" />
            </AnimatedSocialIcon>
          </AnimatedSocialLinks>

          <AnimatedText className="space-y-1">
            <p className="text-xs text-muted-foreground">
              © {CURRENT_YEAR} {brandConfig.name}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">{brandConfig.address}</p>
          </AnimatedText>
        </AnimatedBottomSection>
      </FooterWrapper>
    </footer>
  )
}

export function SiteFooter() {
  return <Footer />
}
