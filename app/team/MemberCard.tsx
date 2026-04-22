"use client";

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface Member {
  id: string;
  name: string;
  login1337: string | null;
  role: string;
  focus: string | null;
  year: string | null;
  avatarUrl: string | null;
  bio: string | null;
  tags: string[];
}

const AVATAR_SHAPES = [
  '[border-radius:63%_37%_54%_46%/55%_48%_52%_45%]',
  '[border-radius:42%_58%_38%_62%/51%_43%_57%_49%]',
  '[border-radius:71%_29%_62%_38%/48%_52%_46%_54%]',
  '[border-radius:35%_65%_43%_57%/60%_40%_58%_42%]',
  '[border-radius:55%_45%_71%_29%/42%_58%_35%_65%]',
  '[border-radius:48%_52%_39%_61%/64%_36%_55%_45%]',
  '[border-radius:65%_35%_48%_52%/53%_47%_59%_41%]',
  '[border-radius:31%_69%_52%_48%/44%_56%_39%_61%]',
];

export const MemberCard: React.FC<{ member: Member; index: number }> = ({ member, index }) => {
  const shape = AVATAR_SHAPES[index % AVATAR_SHAPES.length];
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const springCfg = { stiffness: 200, damping: 20, mass: 0.5 };
  const mxs = useSpring(mx, springCfg);
  const mys = useSpring(my, springCfg);

  const rotateX = useTransform(mys, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mxs, [-0.5, 0.5], [-10, 10]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => { mx.set(0); my.set(0); };

  return (
    <div style={{ perspective: 1200 }} className="break-inside-avoid group hover:bg-[#eaddcf] transition-colors duration-500">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="flex flex-col gap-4 p-6 border-b border-r border-foreground will-change-transform"
      >
        <div
          className='bg-foreground relative p-8 flex group-hover:bg-primary transition-colors duration-500'
          style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}
        >
          <div className='absolute top-3 left-3 bg-primary border border-foreground px-3 py-1 text-foreground font-mono group-hover:bg-foreground group-hover:text-background transition-colors duration-500 text-xs uppercase tracking-widest z-10'>
            {member.role}
          </div>
          <div className='flex justify-center items-center w-full'>
            <div className={`w-48 h-48 sm:w-56 sm:h-56 bg-primary group-hover:bg-foreground p-0.5 ${shape} group-hover:scale-110 transition-transform duration-500`}>
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.avatarUrl} className={`w-full h-full object-cover ${shape}`} alt={member.name} />
              ) : (
                <div className={`w-full h-full bg-background/50 flex items-center justify-center ${shape}`}>
                  <span className="text-5xl font-serif italic text-foreground/40">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-3 py-4' style={{ transform: 'translateZ(20px)' }}>
          <div className='flex flex-col gap-0.5'>
            <div className='text-3xl font-serif tracking-tight leading-tight group-hover:text-black transition-colors duration-500'>
              {member.name}
            </div>
            {member.login1337 && (
              <div className='text-sm text-foreground/50 group-hover:text-black/50 transition-colors duration-500'>
                @{member.login1337}
              </div>
            )}
          </div>
          <div className='text-xs uppercase tracking-widest text-foreground/60 group-hover:text-black/60 transition-colors duration-500'>
            {[member.focus, member.year].filter(Boolean).join(' — ')}
          </div>
          {member.bio && (
            <div className='text-sm leading-relaxed text-foreground/75 mt-2 group-hover:text-black/75 transition-colors duration-500'>
              {member.bio}
            </div>
          )}
          {(member.tags ?? []).length > 0 && (
            <div className='flex flex-wrap gap-2 pt-3 mt-auto border-t border-foreground/10 group-hover:border-black/10'>
              {(member.tags ?? []).map((tag) => (
                <span key={tag} className="text-[0.65rem] uppercase tracking-widest border border-foreground/30 px-2 py-1 group-hover:border-black/30 group-hover:text-black transition-colors duration-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
