import { BlogPosts } from "@/components/posts";
import { School } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const content = {
  hoverCard: {
    title: "@rabh",
    name: "Raunak Bhagat",
    blurb: "SWE @ eventual-computing, previously @ Tesla",
    education: "CS + Math @ UBC, Vancouver",
    fallback: "rb",
  },
  description: `I'm a Vim enthusiast and tab advocate, finding unmatched efficiency in
    Vim's keystroke commands and tabs' flexibility for personal viewing
    preferences. This extends to my support for static typing, where its
    early error detection ensures cleaner code, and my preference for dark
    mode, which eases long coding sessions by reducing eye strain.`,
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
  return (
    <section>
      <TitleHoverCard />
      <p className="mb-4">{content.description}</p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  );
}
