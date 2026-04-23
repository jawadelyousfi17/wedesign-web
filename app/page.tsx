import { GridBackground } from "@/components/backgrounds/Grid";
import { HeroSection } from "@/components/main/HeroSection";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import About from "@/components/main/About";
import Crew from "@/components/main/Crew";
import Projects from "@/components/main/Projects";
import Calendar  from "@/components/main/Calendar";
import Journal from "@/components/main/Journal";
import ApplyForm from "@/components/main/ApplyForm";
import Sponsors from "@/components/main/Sponsors";
import FAQ from "@/components/main/FAQ";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const latestArticles = await prisma.article.findMany({
    where: {
      publishedAt: {
        not: null,
      },
    },
    include: {
      author: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 4,
  });

  const upcomingEvents = await prisma.calendarEvent.findMany({
    where: {
      status: {
        in: ["UPCOMING", "CURRENT"],
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 4,
  });

  const pastEvents = await prisma.calendarEvent.findMany({
    where: {
      status: "PAST",
    },
    orderBy: {
      date: "desc",
    },
    take: 7,
  });

  const teamMembers = await prisma.teamMember.findMany({
    orderBy: { createdAt: "asc" },
  });

  const allProjects = await prisma.project.findMany({
    include: {
      authors: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Select 1 featured and up to 3 others for the home page
  const featured = allProjects.find(p => p.isFeatured) || (allProjects.length > 0 ? allProjects[0] : null);
  const others = allProjects
    .filter(p => p.id !== featured?.id)
    .slice(0, 3);
  
  const homeProjects = featured ? [featured, ...others] : others;

  return (
    <div className="">
      <HeroSection events={upcomingEvents} />


      {/* <div className="border-b border-foreground text-2xl py-12 flex gap-8 items-center justify-center bg-card px-6">
        <span>
          A student-run club at{" "}
          <span className="font-bold bg-foreground text-background px-2">
            1337 Coding School
          </span>{" "}
          where design meets the terminal. We build interfaces, ship
          side-projects, and run weekly crits.
        </span>
        <div className="flex gap-2">
          <Button>Join US</Button>
          <Button variant={"outline"}>Meet The Team</Button>
        </div>
      </div>

      <div className="flex items-center justify-center py-8 bg-card">
        <div className="flex gap-22">
          <div className="flex flex-col gap-0 justify-center items-center  pr-16 -mt-8">
            <span className="text-[5rem]"><AnimatedNumber value={12} /></span>
            <span className="text-sm text-foreground/50 -mt-6">Members</span>
          </div>

          <div className="flex flex-col gap-0 justify-center items-center  pr-16 -mt-8">
            <span className="text-[5rem]"><AnimatedNumber value={5} /></span>
            <span className="text-sm text-foreground/50 -mt-6">Projects</span>
          </div>

          <div className="flex flex-col gap-0 justify-center items-center  pr-16 -mt-8">
            <span className="text-[5rem]"><AnimatedNumber value={9} /></span>
            <span className="text-sm text-foreground/50 -mt-6">
              Events Hosted
            </span>
          </div>

          <div className="flex flex-col gap-0 justify-center items-center -mt-8 ">
            <span className="text-[5rem]"><AnimatedNumber value={3} /></span>
            <span className="text-sm text-foreground/50 -mt-6">
              Years running
            </span>
          </div>
        </div>
      </div> */}

      <About />

      <Crew members={teamMembers} />

        <div className="mt-16">

        </div>
      <Projects projects={homeProjects} showViewAll  />


      <Calendar events={upcomingEvents} />
      <Journal articles={latestArticles} />
      {/* <ApplyForm /> */}
      <FAQ />
    </div>
  );
}
