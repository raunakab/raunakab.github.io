+++
title = "UBC Bionics"
date = 2021-05-01

[taxonomies]

[extra]
position = "Former Embedded Software Engineering Team Lead"
homepage = "https://ubcbionics.com/"
+++

A student led, biomedical engineering team.

<!-- more -->

### About
UBC Bionics is a student-led engineering and research team situated at the University of British Columbia.
Our specialty is in cross-domain engineering to solve biomedical problems.
Currently, our team is in the process of finishing the designing of a robotic prosthetic arm utilized by amputees.
We have partnered with multiple clinics across Vancouver, BC, as well as many research labs situated at UBC to continue our growth and engineering processes.

### What I did
Todo!

### What I learned
Todo!

### Technologies that I used
- `rust`
- `cargo`
- `c` + `c++`
- `raspberry pi model 4`
- `ssh`
- AWS
    - EC2

### A Note on Systems Design
While working as a software engineer here, I was able to observe an interesting phenomena.
All software systems, regardless of whether that be embedded, cloud, or what have you, converge to a similar design.
Namely, this design revolves around taking the system in question, splitting it into subsystems, and designing some sort of messaging system between them.
This effectively divides the system into modular, reusable compartments which, by themselves, are much easier to test.

You can see this phenomena occurring in cloud-systems design: an application starts out as a monolithic binary; one large piece of software all developed in one codebase running forever.
But as we "upgrade" this design, we tend to think of splitting it up in order to reduce volume and increase surface area.
So that's exactly what we do; we effectively perform a splitting up of this system into relevant subservices and label each component a "microservice".

And what's the most interesting is how our embedded systems team, a team which is, for all accounts and measures, orthogonal to cloud-systems engineering, essentially *reinvented* this exact design.
We started out with a simple while-loop which, with each iteration, performed some form of check or action.
But as our system started expanding and becoming more complex, we started dividing specific pieces of logic into separate components.
So how would these separate components interact with one another?
Well with some sort of internal messaging system, of course!

And there it is.
This is, in essence, *exactly* the design behind a cloud microserviced architecture.
We had reinvented this exact phenomena, just in an embedded flavour.

Some may consider this redundant.
"Oh, you did a lot more work than was necessary".
However, this sort of reinvention is something that I am proud of.
My team and I were able to solve a great problem, with very little guidance, and approach a solution largely used in industry today.
For what it's worth, that sort of ideation and brainstorming helped me develop my skills more than any online article or tutorial ever could.

### Closing Remarks
UBC Bionics is the team at which I have achieved many of my biggest early-career milestones.
This was the place I released my first open-source software.
This was also my first time using `git` in a large, non-academic environment.
And finally, this was where I was exposed to my current favourite programming language, `rust`.

I've seen this team evolve from a misshaped team with very little direction to a blooming organization with clear goals and milestones.

And I'm glad that I was a part of that ride!
