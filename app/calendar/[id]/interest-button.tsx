"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Star, Loader2, Check } from "lucide-react";
import { toggleInterest } from "../actions";
import { createClient } from "@/lib/supabase/client";

interface InterestButtonProps {
  eventId: string;
  initialInterestedCount: number;
  interestedUserIds: string[];
}

export default function InterestButton({ 
  eventId, 
  initialInterestedCount,
  interestedUserIds
}: InterestButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(initialInterestedCount);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setIsInterested(interestedUserIds.includes(user.id));
      }
      setLoadingUser(false);
    }
    checkUser();
  }, [interestedUserIds]);

  const handleToggle = () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    startTransition(async () => {
      const result = await toggleInterest(eventId);
      if (result.error) {
        alert(result.error);
      } else {
        // Optimistic update
        setIsInterested(!isInterested);
        setInterestedCount(prev => isInterested ? prev - 1 : prev + 1);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleToggle}
        disabled={isPending || loadingUser}
        className={`group relative flex items-center justify-between px-6 py-4 transition-all duration-500 ease-[0.22,1,0.36,1] border ${
          isInterested 
            ? "bg-primary text-foreground border-primary" 
            : "bg-foreground text-background border-foreground hover:bg-black"
        } ${isPending || loadingUser ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-3 z-10 relative">
          {isPending || loadingUser ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isInterested ? (
            <Check size={18} />
          ) : (
            <Star size={18} className="group-hover:fill-current transition-all" />
          )}
          <span className="text-xs uppercase tracking-widest font-bold">
            {loadingUser ? "Checking Status..." : isInterested ? "Logged as Interested" : "I'm Interested"}
          </span>
        </div>
        
        {(!isPending && !loadingUser) && (
           <div className="text-[10px] font-mono opacity-50 z-10 relative">
              {interestedCount} {interestedCount === 1 ? 'Follower' : 'Followers'}
           </div>
        )}
      </button>
      
      {(!isLoggedIn && !loadingUser) && (
        <p className="text-[10px] uppercase tracking-widest text-foreground/40 text-center">
            Login to save this event
        </p>
      )}
    </div>
  );
}
