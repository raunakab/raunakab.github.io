import { BlogPosts } from "@/components/posts";
import { School } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatDate, getAboutMe } from "@/lib/helpers";
import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";

const content = {
  hoverCard: {
    title: "@rabh",
    name: "Raunak Bhagat",
    blurb: "SWE @ eventual-computing, previously @ Tesla",
    education: "CS + Math @ UBC, Vancouver",
    fallback: "rb",
  },
  description: `
  Hey, I'm Raunak. I'm a software engineer in San Francisco, CA.
  I graduated from UBC, Vancouver in May 2023.
  I received a B.Sc. in Computer Science and Mathematics.`,
};

function TitleHoverCard() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">
          <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
            {content.hoverCard.title}
          </h1>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="https://avatars.githubusercontent.com/u/39634949" />
            <AvatarFallback>{content.hoverCard.fallback}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-bold">{content.hoverCard.name}</h4>
            <p className="text-sm">{content.hoverCard.blurb}</p>
            <div className="flex items-center pt-2">
              <School className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                {content.hoverCard.education}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function Page() {
  const [post] = getAboutMe();

  return (
    <section>
      <TitleHoverCard />
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
      <div className="py-8 pt-24">
        <BlogPosts />
      </div>
    </section>
  );
}
