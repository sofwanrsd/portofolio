import type { Metadata } from "next";
import { getPosts } from "@/lib/data";
import { PostCard } from "@/components/sections/content";
import { Container, EmptyState, PageHeader, Section } from "@/components/ui";
import { readingTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Catatan dan tulisan tentang teknis serta proses kerja.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  const [first, ...rest] = posts;
  const tags = new Set(posts.flatMap((p) => p.tags)).size;
  const minutes = posts.reduce((sum, p) => sum + readingTime(p.content), 0);

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="Catatan dari"
        accent="meja kerja."
        description="Hal-hal yang saya pelajari saat membangun produk: performa, desain, database, dan cara bekerja dengan klien."
        stats={[
          { label: "Artikel", value: posts.length },
          { label: "Topik", value: tags },
          { label: "Menit bacaan", value: minutes },
        ]}
      />

      <Section className="pt-4 md:pt-6">
        <Container>
          {!first ? (
            <EmptyState
              title="Belum ada artikel"
              description="Tulis artikel pertama Anda lewat panel admin."
            />
          ) : (
            <div className="space-y-5">
              <PostCard post={first} large />
              {rest.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i % 3} />
                  ))}
                </div>
              )}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
