"use client";

import React, { useState, useTransition } from "react";
import { Star, Loader2, Check } from "lucide-react";
import { toggleInterest } from "../actions";
import { Button } from "@/components/ui/button";

interface InterestButtonProps {
  eventId: string;
  isInterested: boolean;
  interestedCount: number;
  isLoggedIn: boolean;
}

export default function InterestButton({ 
  eventId, 
  isInterested, 
  interestedCount,
  isLoggedIn 
}: InterestButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    startTransition(async () => {
      const result = await toggleInterest(eventId);
      if (result.error) {
        alert(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`group relative flex items-center justify-between px-6 py-4 transition-all duration-500 ease-[0.22,1,0.36,1] border ${
          isInterested 
            ? "bg-primary text-foreground border-primary" 
            : "bg-foreground text-background border-foreground hover:bg-black"
        } ${isPending ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-3 z-10 relative">
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isInterested ? (
            <Check size={18} />
          ) : (
            <Star size={18} className="group-hover:fill-current transition-all" />
          )}
          <span className="text-xs uppercase tracking-widest font-bold">
            {isInterested ? "Logged as Interested" : "I'm Interested"}
          </span>
        </div>
        
        {!isPending && (
           <div className="text-[10px] font-mono opacity-50 z-10 relative">
              {interestedCount} {interestedCount === 1 ? 'Follower' : 'Followers'}
           </div>
        )}
      </button>
      
      {!isLoggedIn && (
        <p className="text-[10px] uppercase tracking-widest text-foreground/40 text-center">
            Login to save this event
        </p>
      )}
    </div>
  );
}
