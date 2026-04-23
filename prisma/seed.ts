import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding projects...');

  // Create a sample team member if none exists
  const teamMember = await prisma.teamMember.upsert({
    where: { id: 'sample-member' },
    update: {},
    create: {
      id: 'sample-member',
      name: 'Jawad',
      role: 'Lead Designer',
      login1337: 'jawad',
      tags: ['Design', 'Next.js', 'Prisma'],
    },
  });

  const projects = [
    {
      title: 'WeDesign Web',
      slug: 'wedesign-web',
      description: 'The official platform for the WeDesign club. Built with Next.js, Prisma, and Framer Motion.',
      tags: ['Next.js', 'Prisma', 'Framer Motion'],
      isFeatured: true,
      githubUrl: 'https://github.com/wedesign/web',
    },
    {
      title: 'TerminalUI Kit',
      slug: 'terminal-ui-kit',
      description: 'A component library designed specifically for developers who love the terminal aesthetic.',
      tags: ['React', 'TailwindCSS', 'UI Kit'],
      isFeatured: false,
    },
    {
      title: '1337 Crits',
      slug: '1337-crits',
      description: 'An internal tool for 1337 students to share and critique design work in real-time.',
      tags: ['WebSockets', 'Design', 'Collaboration'],
      isFeatured: false,
    },
    {
      title: 'Focus Mode',
      slug: 'focus-mode',
      description: 'A minimal writing environment that helps you block out the noise and ship your thoughts.',
      tags: ['TypeScript', 'Aesthetics', 'Productivity'],
      isFeatured: false,
    }
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: {
        ...project,
        authors: {
          connect: { id: teamMember.id },
        },
      },
    });
  }

  console.log('Seeding merch...');
  const merchItems = [
    {
      title: 'Brutalist Club Tee',
      slug: 'brutalist-club-tee',
      description: 'Heavyweight organic cotton tee featuring the WeDesign / Terminal logo. Oversized fit for maximum comfort during long coding sessions.',
      price: 250.0,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop'],
      colors: ['Midnight Black', 'Slate Grey'],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'Clothing'
    },
    {
      title: 'Variable Font Hoodie',
      slug: 'variable-font-hoodie',
      description: 'Premium fleece hoodie with embroidered variable font weight details on the sleeves. A tribute to the evolution of typography.',
      price: 450.0,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop'],
      colors: ['Obsidian', 'Bone'],
      sizes: ['M', 'L', 'XL'],
      category: 'Clothing'
    },
    {
      title: 'Terminal Cap',
      slug: 'terminal-cap',
      description: 'Six-panel dad hat with 1337 UM6P coordinates. Low profile, high impact.',
      price: 180.0,
      images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop'],
      colors: ['Black', 'Navy'],
      sizes: ['One Size'],
      category: 'Accessories'
    }
  ];

  for (const item of merchItems) {
    await prisma.merchItem.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
