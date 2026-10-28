import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import WorkGrid from "@/components/site/WorkGrid";
import CtaSection from "@/components/landing/CtaSection";
import About from "@/components/site/About";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import {
  getCategories,
  getGlobalLinks,
  getProfile,
  getProjects,
  getSite,
  getTags,
  getTheme,
} from "@/lib/content";

export const dynamic = "force-dynamic";

const FALLBACK_NAV = [
  { label: "作品", url: "#work" },
  { label: "关于", url: "#about" },
  { label: "联系", url: "#contact" },
];

export default function HomePage() {
  const profile = getProfile();
  const site = getSite();
  const theme = getTheme();
  const categories = getCategories();
  const tags = getTags();
  const links = getGlobalLinks();
  const projects = getProjects();

  // 导航项来自后台「外部链接」里 kind=nav 的条目
  const navLinks = links.filter((l) => l.kind === "nav");
  const items = navLinks.length
    ? navLinks.map((l) => ({ label: l.label, url: l.url }))
    : FALLBACK_NAV;

  // CTA 工作台里预览的作品：优先精选，其次第一个
  const preview = projects.find((p) => p.featured) ?? projects[0] ?? null;

  return (
    <>
      <Nav name={profile.name} items={items} email={profile.email} />

      <main>
        <Hero profile={profile} style={theme.heroStyle} />
        <WorkGrid
          projects={projects}
          categories={categories}
          title={site.indexTitle}
          description={site.indexDescription}
        />
        {preview && <CtaSection project={preview} />}
        <About profile={profile} tags={tags} />
        <Contact profile={profile} links={links} />
      </main>

      <Footer site={site} links={links} name={profile.name} />
    </>
  );
}
