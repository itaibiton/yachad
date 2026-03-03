import { PostSkeleton } from "@/shared/components/LoadingSkeleton";

export default function FeedLoading() {
  return (
    <div className="flex flex-col gap-4">
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
}
