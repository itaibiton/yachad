"use client";

import { PostComposer } from "./PostComposer";
import { FeedList } from "./FeedList";
import { FeedNewsSidebar } from "./FeedNewsSidebar";
import { FeedFlightsSidebar } from "./FeedFlightsSidebar";

export function FeedClientPage() {
  return (
    <div className="-m-4 md:-m-6 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-6 gap-4 px-4 py-4 md:px-6 md:py-6">
        {/* Left sidebar — News (hidden below lg) */}
        <aside className="hidden lg:block lg:col-span-1 overflow-y-auto">
          <FeedNewsSidebar />
        </aside>

        {/* Center — Feed (only this scrolls) */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-y-auto">
          <PostComposer />
          <FeedList />
        </div>

        {/* Right sidebar — Flights (hidden below lg) */}
        <aside className="hidden lg:block lg:col-span-1 overflow-y-auto">
          <FeedFlightsSidebar />
        </aside>
      </div>
    </div>
  );
}
