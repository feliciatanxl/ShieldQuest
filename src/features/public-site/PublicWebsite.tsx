import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EnquiryDialog } from './EnquiryDialog';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { ClosingCta } from './sections/ClosingCta';
import { Faq } from './sections/Faq';
import { ForSchools } from './sections/ForSchools';
import { Framework } from './sections/Framework';
import { Hero } from './sections/Hero';
import { LearningLoop } from './sections/LearningLoop';
import { Safety } from './sections/Safety';
import { Scenarios } from './sections/Scenarios';
import { WhyNow } from './sections/WhyNow';

interface PublicWebsiteProps {
  onPlay?: () => void;
  onFacilitatorLogin?: () => void;
}

/**
 * The public site.
 *
 * Composition only — every section owns its own content and styling, and the
 * order below IS the argument the page makes: hook, evidence, mechanism,
 * framework, content, logistics, safeguards, objections, ask.
 *
 * This file replaced a single 1,768-line component that inlined all eleven
 * sections, both nav menus, the footer and the enquiry modal, and alternated
 * five different ad-hoc background treatments with no rhythm. Sections now
 * alternate two quiet tones via the `Section` primitive, and `inverse` is
 * spent exactly twice — on the framework and on safety.
 *
 * DEEP LINKS: `/how-it-works`, `/for-schools`, `/safety` and friends are real
 * routes that partners paste into emails and reports, so each renders a
 * focused page built from the SAME section components rather than a second
 * copy of the content. The previous implementation carried ~500 lines of
 * duplicate subpage prose that had already drifted from the landing page.
 */
export function PublicWebsite({ onPlay, onFacilitatorLogin }: PublicWebsiteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const handlePlay = () => {
    onPlay?.();
    navigate('/board');
  };

  const handleFacilitatorLogin = () => {
    onFacilitatorLogin?.();
    navigate('/admin');
  };

  const openEnquiry = () => setEnquiryOpen(true);

  const path = location.pathname;
  const isLanding = path === '/' || path === '/website';

  // Land at the top of a freshly-navigated subpage rather than inheriting the
  // scroll position of the page the visitor came from.
  useEffect(() => {
    if (!isLanding) window.scrollTo(0, 0);
  }, [path, isLanding]);

  return (
    <div className="min-h-screen bg-[var(--sq-canvas)] font-sans antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[10px] focus:bg-[var(--sq-action)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader onPlay={handlePlay} onFacilitatorLogin={handleFacilitatorLogin} />

      <main id="main">
        {isLanding ? (
          <>
            <Hero onPlay={handlePlay} onSchoolsEnquiry={openEnquiry} />
            <WhyNow />
            <LearningLoop />
            <Framework />
            <Scenarios />
            <ForSchools onEnquiry={openEnquiry} />
            <Safety />
            <Faq />
            <ClosingCta onPlay={handlePlay} onEnquiry={openEnquiry} />
          </>
        ) : (
          <>
            <Subpage path={path} onEnquiry={openEnquiry} />
            <ClosingCta onPlay={handlePlay} onEnquiry={openEnquiry} />
          </>
        )}
      </main>

      <SiteFooter onPlay={handlePlay} onFacilitatorLogin={handleFacilitatorLogin} />

      <EnquiryDialog open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </div>
  );
}

/**
 * Renders the sections relevant to a deep-linked route. `/about` gets the full
 * argument minus the logistics; the rest are focused single-topic pages.
 */
function Subpage({ path, onEnquiry }: { path: string; onEnquiry: () => void }) {
  switch (path) {
    case '/how-it-works':
      return (
        <>
          <LearningLoop />
          <Framework />
        </>
      );
    case '/for-schools':
      return (
        <>
          <ForSchools onEnquiry={onEnquiry} />
          <Scenarios />
          <Faq />
        </>
      );
    case '/safety':
    case '/accessibility':
      return (
        <>
          <Safety />
          <Faq />
        </>
      );
    case '/faq':
      return <Faq />;
    case '/about':
    default:
      return (
        <>
          <WhyNow />
          <LearningLoop />
          <Framework />
        </>
      );
  }
}

export default PublicWebsite;
