+++
title = "Ontraccr"
date = 2021-05-01

[taxonomies]

[extra]
position = "Full-Stack Software Engineering Intern"
homepage = "https://ontraccr.com/"
end_date = 2021-08-31
+++

Software automation and workflow management in Javascript and React.js.

<!-- more -->

### About
Ontraccr is a startup based in Vancouver, British Columbia which provides an easy-to-use time-management application for construction companies.
The construction industry is a space in which the power and ease of technology is not quite present.
Many companies in this field stick to outdated methodologies for managing projects, and these outdated behaviours have significant negative impacts on their efficiencies.
This is where Ontraccr comes in; it's a web-application + mobile-application architecture in which managers can more easily communicate with their on-premise workers, assign tasks, and manage productivity.

### What I did
- Implemented feature to recursively move and archive folders/files in the in-app file-system
- Implemented a *divisions* feature to restrict access to folders based off user's position in company
- Performed integration of Typescript into existing Javascript backend codebase to increase code maintainability and allow for warnings/errors to be caught during compile-time rather than runtime
- Introduced linters and coding-style configuration files (ESLint + Prettier) to force an agreed-upon style on the backend codebase for cleaner code maintainability + readability

### What I learned
Given the technical range of this position (full-stack engineering) I was able to touch essentially the entire web-stack for Ontraccr.
As such, I have divided up each skill accordingly for ease of reading.

##### Backend
- How to develop backend RESTful APIs to perform `CRUD` operations on a database
- Middleware processing and overall preprocessing techniques applied to each incoming request
    - Stateless authentication using `JWT`'s
    - Websockets integration for communicating with external services
- Outbound requests and outgoing middleware postprocessing techniques (i.e., insertion of default data, etc.)
- External services integration
    - Sentry integration to provide insights into backend crashes, etc.
    - AWS S3 for media storage

##### Database (`MySQL`)
- How to interact with a `SQL` database from a web backend
    - Query formation + optimization
    - Simple `CRUD` queries
    - Advanced left, right, and inner joins to avoid expensive for-loop queries
- Data organization
    - I.e., composite primary keys for relationships between 2 or more tables
- Data integrity
    - Non-nullable constraints
    - Check constraints (to perform prevalidation of data before inserts/updates)
    - `SQL` triggers
    - `SQL` functions
    - Foreign keys + cascading on deletion of a foreign key

##### Frontend
- How to propagate changes in the frontend to a backend API service
- Wireframing tools and techniques
- How to develop a `react.js` application
    - Basic structure
    - Higher-order components (for avoid code duplication)
    - Styling and overall design in `react.js`
    - Hooks for running pieces of logic during mounting, dismounting etc.
    - Redux for implementing a centralized data-store
- Overall UI/UX skills
    - How to develop new UIs to match an existing platform's style and taste
    - UI scheme aggregation into a global file
    - Optimal placement of information for user consumption

##### Devops + Cloud (AWS)
- Docker for containerization
- Bitbucket pipelines for automating testing, code validation, and deployments
- AWS
    - EC2 services to host infrastructure and code
    - ECR for container storage and deployment to an ECS orchestrated cluster
    - S3 for media storage
    - SES for email services

### Technologies that I worked with
- `Node.js` backend + `hapi` web-framework
- `React.js`
- `React Native`
- `docker`
- `git` / Bitbucket
- Jira + Confluence
- Sonarcloud
- AWS
    - EC2
    - ECS
    - ECR
    - SES
    - S3
- `HTTP`
- `JWT`'s
- `websockets`

### Closing Remarks
There are so many things that I feel I need to say about this position.

Firstly, I have never seen myself grow so much as a SWE anywhere else.
I went from ***not*** knowing what an `HTTP` message was at the beginning of May to implementing *full-stack* features (such as task-tracking, similar to the tasks one can assign in Jira) at the end of August. I was successfully able to touch essentially the *entire* tech-stack at Ontraccr; from frontend to backend, devops, and cloud.

All in the span of 4 months!

A large portion of my growth is attested to my manager, who I will refer to as Sean for the rest of this post.

Sean and I had these weekly one-on-ones's first thing in the mornings on Mondays.
These meetings acted as a retroactive look into the past week; a mechanism for us to observe our hurdles and successes so that we could continue growing as a team.

As I tended to be, I asked a *lot* of questions during these meetings: "How do you lead a team?", "How did you learn about *X* and *Y*?", "What drew you to the startup environment in the first place", etc.
And to all these questions, impressively, Sean would have an answer ready to go.
But what blew me away was the sheer magnitude of his two-cents on the matter.
He would respond with these nuggets of wisdom, casually dropping them as if they were no more than a small crumb of truth.

We would easily fill up the 1 hour timeslot by just talking about our lives, software engineering, and the startup world in general (I, myself, at that time had also started a small business with my partner).

And as per the nuggets of wisdom he would so easily drop, I leave you, reader, with my favourite quote he told me during one session:

> If you want to build a ship, don't drum up the people to gather wood, divide the work, and give orders.
>
> Instead, teach them to yearn for the vast and endless sea.
>
> - Antoine de Saint-Exupéry
