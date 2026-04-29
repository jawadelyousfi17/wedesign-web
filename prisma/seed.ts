import { PrismaClient, ArticleCategory, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  // ── TEAM MEMBERS ────────────────────────────────────────────────────────────

  console.log('Seeding team members...');

  const members = [
    {
      id: 'member-jawad',
      name: 'Jawad Aarab',
      role: 'President · Lead Developer',
      login1337: 'jaarab',
      focus: 'Full-stack & Creative Dev',
      year: '2024',
      tags: ['Next.js', 'Three.js', 'Design Systems'],
      bio: 'Obsessed with the intersection of design and code. Builds tools that make other people\'s work feel effortless.',
      githubUrl: 'https://github.com/jawad',
    },
    {
      id: 'member-sara',
      name: 'Sara Moussaid',
      role: 'Lead Designer',
      login1337: 'smoussai',
      focus: 'UI/UX & Brand Identity',
      year: '2024',
      tags: ['Figma', 'Branding', 'Typography'],
      bio: 'Designs systems that hold up under pressure. Believes every pixel is a decision.',
      githubUrl: 'https://github.com/saramoussaid',
    },
    {
      id: 'member-ayoub',
      name: 'Ayoub Elkhayati',
      role: 'Creative Technologist',
      login1337: 'aelkhaya',
      focus: 'WebGL · Shaders · Motion',
      year: '2023',
      tags: ['GLSL', 'Three.js', 'Framer Motion'],
      bio: 'Lives in the GPU. Writes shaders before breakfast. Turns math into beauty.',
      githubUrl: 'https://github.com/ayoubelk',
    },
    {
      id: 'member-nadia',
      name: 'Nadia Benali',
      role: 'UX Researcher',
      login1337: 'nbenali',
      focus: 'User Research · Accessibility',
      year: '2024',
      tags: ['Research', 'Accessibility', 'Figma'],
      bio: 'Keeps the team honest about who we\'re building for. Runs every feature through the accessibility filter.',
    },
    {
      id: 'member-omar',
      name: 'Omar Tazi',
      role: 'Backend Engineer',
      login1337: 'otazi',
      focus: 'APIs · Databases · DevOps',
      year: '2023',
      tags: ['Prisma', 'PostgreSQL', 'Supabase'],
      bio: 'Makes sure the frontend never hits an empty state. Writes migrations like poetry.',
      githubUrl: 'https://github.com/omartazi',
    },
    {
      id: 'member-lina',
      name: 'Lina Rachidi',
      role: 'Motion Designer',
      login1337: 'lrachidi',
      focus: 'Animation · Interaction Design',
      year: '2025',
      tags: ['After Effects', 'Framer', 'Lottie'],
      bio: 'Everything should move with intention. Obsessed with easing curves and the feeling of weight.',
    },
  ];

  for (const member of members) {
    await prisma.teamMember.upsert({
      where: { id: member.id },
      update: member,
      create: member,
    });
  }

  // ── PROJECTS ─────────────────────────────────────────────────────────────────

  console.log('Seeding projects...');

  const projects = [
    {
      id: 'proj-wedesign',
      title: 'WeDesign Web',
      slug: 'wedesign-web',
      description: 'The official platform for the WeDesign club. Built with Next.js, Prisma, and Framer Motion.',
      tags: ['Next.js', 'Prisma', 'Framer Motion'],
      isFeatured: true,
      githubUrl: 'https://github.com/wedesign/web',
      authors: [{ id: 'member-jawad' }, { id: 'member-omar' }],
    },
    {
      id: 'proj-terminal-ui',
      title: 'TerminalUI Kit',
      slug: 'terminal-ui-kit',
      description: 'A component library designed specifically for developers who love the terminal aesthetic.',
      tags: ['React', 'TailwindCSS', 'UI Kit'],
      isFeatured: false,
      authors: [{ id: 'member-jawad' }],
    },
    {
      id: 'proj-crits',
      title: '1337 Crits',
      slug: '1337-crits',
      description: 'An internal tool for 1337 students to share and critique design work in real-time.',
      tags: ['WebSockets', 'Design', 'Collaboration'],
      isFeatured: false,
      authors: [{ id: 'member-jawad' }, { id: 'member-omar' }],
    },
    {
      id: 'proj-focus',
      title: 'Focus Mode',
      slug: 'focus-mode',
      description: 'A minimal writing environment that helps you block out the noise and ship your thoughts.',
      tags: ['TypeScript', 'Aesthetics', 'Productivity'],
      isFeatured: false,
      authors: [{ id: 'member-ayoub' }],
    },
    {
      id: 'proj-glyph',
      title: 'Glyph Engine',
      slug: 'glyph-engine',
      description: 'WebGL-powered 3D typography renderer. Real-time magnetic glyph fields with custom GLSL shaders.',
      tags: ['Three.js', 'GLSL', 'WebGL'],
      isFeatured: true,
      authors: [{ id: 'member-ayoub' }, { id: 'member-jawad' }],
    },
  ];

  for (const { authors, ...project } of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: { ...project, authors: { set: authors } },
      create: { ...project, authors: { connect: authors } },
    });
  }

  // ── CALENDAR EVENTS ──────────────────────────────────────────────────────────

  console.log('Seeding calendar events...');

  const events = [
    {
      id: 'evt-kickoff',
      title: 'WeDesign S2 Kickoff',
      date: new Date('2026-02-10T18:00:00'),
      type: 'Meetup',
      location: '1337 UM6P · Main Hall',
      description: 'Opening session for semester 2. New members, new projects, and the roadmap for the next 6 months. Free pizza guaranteed.',
      status: EventStatus.PAST,
    },
    {
      id: 'evt-figma-ws',
      title: 'Figma Variables Workshop',
      date: new Date('2026-03-05T17:00:00'),
      type: 'Workshop',
      location: '1337 UM6P · Lab B',
      description: 'Hands-on session covering Figma variables, design tokens, and building a real component library from scratch. Bring your laptop.',
      status: EventStatus.PAST,
    },
    {
      id: 'evt-typetalk',
      title: 'Typography is Code',
      date: new Date('2026-03-22T16:30:00'),
      type: 'Talk',
      location: '1337 UM6P · Amphitheater',
      description: 'A talk on the history of type, variable fonts, and why every developer should care about OpenType features. By Sara Moussaid.',
      status: EventStatus.PAST,
    },
    {
      id: 'evt-hacknight',
      title: 'Creative Code Night',
      date: new Date('2026-04-18T20:00:00'),
      type: 'Hackathon',
      location: '1337 UM6P · Open Space',
      description: '6-hour creative coding sprint. Build anything — generative art, interactive experiments, tools. Judged by WeDesign core team. Prizes for top 3.',
      status: EventStatus.PAST,
    },
    {
      id: 'evt-shader-ws',
      title: 'Intro to WebGL Shaders',
      date: new Date('2026-05-08T17:00:00'),
      type: 'Workshop',
      location: '1337 UM6P · Lab A',
      description: 'From zero to a working fragment shader. Covers GLSL basics, uniforms, noise functions, and rendering to Three.js. By Ayoub Elkhayati.',
      status: EventStatus.UPCOMING,
    },
    {
      id: 'evt-portfolio-day',
      title: 'Portfolio Review Day',
      date: new Date('2026-05-20T14:00:00'),
      type: 'Critique',
      location: '1337 UM6P · Design Studio',
      description: 'Bring your best work. WeDesign members and invited industry reviewers give structured feedback. Open to all 1337 students.',
      status: EventStatus.UPCOMING,
    },
    {
      id: 'evt-endofyear',
      title: 'End of Year Showcase',
      date: new Date('2026-06-15T18:00:00'),
      type: 'Exhibition',
      location: '1337 UM6P · Main Hall',
      description: 'Annual showcase of every project built by WeDesign members this year. Open to the public. Live demos, printed work, and a closing ceremony.',
      status: EventStatus.UPCOMING,
    },
  ];

  for (const event of events) {
    await prisma.calendarEvent.upsert({
      where: { id: event.id },
      update: event,
      create: event,
    });
  }

  // ── JOURNAL ARTICLES ─────────────────────────────────────────────────────────

  console.log('Seeding journal articles...');

  const articles = [
    {
      slug: 'design-systems-at-scale',
      title: 'Design Systems at Scale: What Nobody Tells You',
      category: ArticleCategory.DESIGN,
      readTime: '6 MIN READ',
      publishedAt: new Date('2026-02-14'),
      content: `Design systems are sold as the solution to consistency problems. In practice, they introduce a different set of problems — ones nobody talks about in the conference talks.

## The Naming Problem

The hardest part of building a design system isn't the components. It's naming them. A button called \`ButtonPrimary\` seems obvious until your design evolves and "primary" no longer means what it used to. A color called \`blue-500\` tells you nothing about intent. \`interactive-default\` tells you everything.

Semantic naming is the first battle. Win it before you write a single line of component code.

## The Adoption Problem

A design system only works if people use it. Adoption is not automatic — it's a social problem disguised as a technical one. Engineers reach for the system when it's faster than rolling their own. If it isn't, they won't.

The best design systems are obviously easier to use than the alternative.

## The Governance Problem

Every system needs an owner. Without one, the system becomes a museum — maintained by nobody, trusted by nobody, used by nobody. At WeDesign, we rotate system stewardship quarterly. One person is responsible for breaking changes, migration guides, and the changelog.

## What Actually Works

- Lock tokens first, components second. Tokens are the foundation. If your token layer is wrong, everything built on top of it is also wrong.
- Version ruthlessly. Don't be afraid of breaking changes. Be afraid of breaking changes with no migration path.
- Document the why, not the what. The what is in the code. The why is what future contributors actually need.
- Ship something small. A system with 3 well-documented components beats one with 30 undocumented ones.

The system is never done. That's the point.`,
    },
    {
      slug: 'variable-fonts-in-production',
      title: 'Variable Fonts in Production: A Field Report',
      category: ArticleCategory.TYPOGRAPHY,
      readTime: '5 MIN READ',
      publishedAt: new Date('2026-03-01'),
      content: `Variable fonts shipped in all major browsers years ago. Most production codebases still use static fonts. Here's why — and what you're missing.

## What a Variable Font Actually Is

A variable font is a single font file that contains the entire design space of a typeface — every weight, width, slant, and optical size — encoded as interpolation instructions. You get infinite variation from one file.

The file size savings are real. A family with 6 weights in static format might be 600KB. The variable equivalent: 200KB. One request. Instant switch.

## The CSS You Need

\`\`\`css
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/SpaceGrotesk-Variable.woff2') format('woff2');
  font-weight: 100 900;
}

.heading {
  font-variation-settings: 'wght' 350;
  transition: font-variation-settings 0.3s ease;
}

.heading:hover {
  font-variation-settings: 'wght' 700;
}
\`\`\`

## Axes Beyond Weight

Most developers stop at \`wght\`. The interesting territory starts after that:

- \`wdth\` — width, from condensed to expanded
- \`ital\` — italic as a continuous axis, not a toggle
- \`opsz\` — optical size, adjusting letterforms for display vs body
- Custom axes — type designers can define anything

Fraunces has a \`WONK\` axis. Input Mono has \`XHGT\` for x-height. These are design decisions encoded in math.

## Performance Considerations

Subset your variable fonts. A full Latin variable font with all axes can exceed 400KB. Use \`unicode-range\` descriptors and subsetting tools (glyphhanger, pyftsubset) to strip unused glyphs. You rarely need the full character set for a marketing site.

## The WeDesign Stack

We use Space Grotesk (variable) for UI, Cardo for editorial text, and JetBrains Mono for code. All served via \`next/font\` with \`display: swap\`. Zero layout shift, full variable axis access.

The investment is a one-time setup cost. The creative return is ongoing.`,
    },
    {
      slug: 'building-the-lab',
      title: 'Building The Lab: Interactive Experiments in the Browser',
      category: ArticleCategory.DEV,
      readTime: '8 MIN READ',
      publishedAt: new Date('2026-04-01'),
      content: `The Lab started as a question: what if our club's website was itself a demo of what we could build? Every experiment in the Lab is a working proof of an idea.

## The Architecture Decision

We use a single dynamic route — \`app/lab/[slug]/page.tsx\` — that renders any experiment by slug. The registry (\`lib/lab-registry.tsx\`) is the single source of truth. Adding an experiment is three steps: add an entry to the registry, build the component, wire the switch case.

This keeps the routing zero-config while keeping component code isolated. Each experiment is self-contained. It can use \`useEffect\`, \`useRef\`, WebGL, WebRTC, or WebSockets without affecting anything else.

## The Camera Experiments

Three experiments use \`getUserMedia\` — the ASCII camera, animal vision filter, and neural interface. The browser permission model means we can't preload the stream. We initialize it lazily on mount and tear it down on unmount.

\`\`\`typescript
useEffect(() => {
  let stream: MediaStream;
  navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
    stream = s;
    videoRef.current!.srcObject = s;
  });
  return () => stream?.getTracks().forEach((t) => t.stop());
}, []);
\`\`\`

The teardown matters. Forgetting it means the camera light stays on after the user navigates away. That's a trust issue, not just a bug.

## MediaPipe in Next.js

The neural interface and hand-mouse experiments use MediaPipe's Holistic model. MediaPipe loads a WASM binary and several model files. In Next.js App Router, this means:

1. Dynamic import with \`ssr: false\` — MediaPipe is browser-only
2. Loading state while the WASM initializes (can take 2–3 seconds on first load)
3. \`locateFile\` override to serve model files from the correct CDN path

The performance is surprising. Holistic (face + hands + pose) runs at 30fps on a mid-range laptop. The model is doing extraordinary things very quietly.

## What We Learned

The Lab forced us to get comfortable with the browser's low-level APIs. \`OffscreenCanvas\`, \`requestAnimationFrame\` timing, \`Worker\` threads for heavy computation, WebGL buffer management. These aren't framework skills. They're platform skills.

That's the point of the Lab. Not to ship features — to develop taste for what the platform can actually do.`,
    },
    {
      slug: 'design-is-not-decoration',
      title: 'Design Is Not Decoration',
      category: ArticleCategory.OPINION,
      readTime: '4 MIN READ',
      publishedAt: new Date('2026-04-10'),
      content: `There is a version of "design thinking" that has been so thoroughly co-opted by corporate process that it no longer means anything. Sticky notes. Double diamonds. Journey maps for a product nobody uses. This is design as performance.

Real design is a different thing entirely.

## The Functional Argument

Design is how something works. This is the Jobsian reading, and it's mostly right. A form that loses user data on back-navigation is badly designed regardless of how it looks. A button that's hard to hit on mobile is badly designed. A loading state that gives no feedback is badly designed.

None of this is decoration.

## The Aesthetic Argument

But reducing design to pure function misses something. Aesthetics carry information. A product that looks considered tells you it was built by people who cared. A product that looks careless tells you something about how its builders thought about you.

The aesthetic is not separate from the function. It is part of the communication.

## What This Means at a Club Level

WeDesign exists at a school that produces engineers. The temptation is to treat design as the thing that happens after the engineering — the skin stretched over working code. We reject this framing.

Design happens at the schema level. It happens when you name a database column. It happens when you decide what error message to show. It happens when you choose what to log and what to silently fail.

Every decision that affects how a person experiences a system is a design decision. Owning that — taking it seriously — is what this club is for.

The decoration interpretation of design is a way of making it someone else's problem. It isn't. It's everyone's problem, always.`,
    },
    {
      slug: 'color-theory-for-engineers',
      title: 'Color Theory for Engineers Who Skipped Art School',
      category: ArticleCategory.DESIGN,
      readTime: '7 MIN READ',
      publishedAt: new Date('2026-04-18'),
      content: `Most engineers treat color as configuration: drop a hex code in, ship it. This works until it doesn't — until a designer looks at your UI and immediately knows something is wrong, even if they can't articulate it instantly. Here's the underlying model.

## HSL Is the Right Mental Model

RGB is for machines. HSL — hue, saturation, lightness — is for humans. When you want a color lighter, increase lightness. When you want it less saturated, decrease saturation. When you want a related color, shift hue.

\`\`\`css
--color-primary: hsl(220, 90%, 55%);
--color-primary-light: hsl(220, 90%, 70%);
--color-primary-muted: hsl(220, 40%, 55%);
\`\`\`

## Contrast Is Not Optional

WCAG AA requires a 4.5:1 contrast ratio for body text. This is not an accessibility checkbox — it's a readability floor. Below this ratio, text is difficult to read in ambient light, on glossy screens, for users with any degree of visual impairment.

Use the browser devtools or a tool like Polychrome to check ratios before shipping. A color that looks fine on your calibrated display at 100% brightness may fail on a phone screen in sunlight.

## Semantic Color Tokens

Don't name your tokens by value. Name them by role:

| Bad | Good |
|-----|------|
| \`--blue-500\` | \`--color-interactive\` |
| \`--gray-200\` | \`--color-surface-subtle\` |
| \`--red-600\` | \`--color-destructive\` |

When you rename \`blue\` to \`indigo\` in the rebrand, semantic tokens don't break. Value-named tokens require a search-and-replace across the codebase.

## The 60-30-10 Rule

Sixty percent of your UI should be a neutral (background, surface). Thirty percent is your secondary tone (cards, sidebars, borders). Ten percent is accent — the color that carries intent (buttons, links, highlights).

Violate this ratio and you get visual noise. Apply it and things look intentional even before the designer reviews them.

Color is not decoration. It is a signaling system. Learn its grammar.`,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }

  // ── MERCH ─────────────────────────────────────────────────────────────────────

  console.log('Seeding merch...');

  const merch = [
    {
      title: 'Brutalist Club Tee',
      slug: 'brutalist-club-tee',
      description: 'Heavyweight organic cotton tee featuring the WeDesign / Terminal logo. Oversized fit for maximum comfort during long coding sessions.',
      price: 250.0,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop'],
      colors: ['Midnight Black', 'Slate Grey'],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'Clothing',
    },
    {
      title: 'Variable Font Hoodie',
      slug: 'variable-font-hoodie',
      description: 'Premium fleece hoodie with embroidered variable font weight details on the sleeves. A tribute to the evolution of typography.',
      price: 450.0,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop'],
      colors: ['Obsidian', 'Bone'],
      sizes: ['M', 'L', 'XL'],
      category: 'Clothing',
    },
    {
      title: 'Terminal Cap',
      slug: 'terminal-cap',
      description: 'Six-panel dad hat with 1337 UM6P coordinates. Low profile, high impact.',
      price: 180.0,
      images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop'],
      colors: ['Black', 'Navy'],
      sizes: ['One Size'],
      category: 'Accessories',
    },
  ];

  for (const item of merch) {
    await prisma.merchItem.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
