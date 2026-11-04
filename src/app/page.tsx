import { getSettings } from "@/lib/settings";
import {
  getExperiences,
  getPosts,
  getProjects,
  getServices,
  getSkills,
  getTestimonials,
} from "@/lib/data";
import { Hero, TechMarquee } from "@/components/sections/hero";
import { ProjectsSection } from "@/components/sections/projects";
import { HomeOverview } from "@/components/sections/home-overview";
import { ExpertisePreview } from "@/components/sections/expertise-preview";
import { PricingSection, ServicesSection } from "@/components/sections/collections";
import {
  BlogSection,
  CtaSection,
  TestimonialsSection,
} from "@/components/sections/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const [projects, services, skills, experiences, testimonials, posts] =
    await Promise.all([
      getProjects(),
      getServices(),
      getSkills(),
      getExperiences(),
      getTestimonials(),
      getPosts({ limit: 3 }),
    ]);

  const { sections, site, features } = settings;

  return (
    <>
      {sections.hero && (
        <Hero settings={settings} projectsCount={projects.length} />
      )}

      {sections.skills && skills.length > 0 && (
        <TechMarquee items={skills.map((skill) => skill.name)} />
      )}

      {sections.projects && <ProjectsSection projects={projects} />}

      {sections.skills && <ExpertisePreview skills={skills} />}

      {sections.services && <ServicesSection services={services} />}

      {(sections.about || sections.experience) && (
        <HomeOverview site={site} experiences={experiences} showAbout={sections.about} showExperience={sections.experience} />
      )}

      {sections.testimonials && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {sections.pricing && features.showPricing && (
        <PricingSection
          services={services}
          title={features.pricingTitle}
          subtitle={features.pricingSubtitle}
        />
      )}

      {sections.blog && <BlogSection posts={posts} />}

      {sections.cta && <CtaSection features={features} />}
    </>
  );
}
