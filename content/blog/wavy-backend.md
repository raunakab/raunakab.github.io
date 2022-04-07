+++
title = "Building a Social Media Platform (Part I): The Backend"
date = 2022-04-06
+++

The technical details behind the development going on at *Wavy*.
This time, focusing on how to build a robust backend API.

<!-- more -->

### Prelude
This article will focus on explaining the technical details and engineering choices behind the backend API service provided by *Wavy*.
Although some may use this as a "tutorial" of some sorts to aid in their own development, I have not necessarily aimed for this article to be of that nature.
I am moreso aiming for it to provide a brief glimpse into the inner machinery behind the API service our team over at *Wavy* have engineered.
As a result, you will notice that I frame questions as "*Why* did we choose *X*?" as opposed to "What *X* should *you* choose?".

Needless to say, this article will be clearly opinionated.
That is a natural consequence of its purpose.
There are points to which *I*, personally, find the pros to outweigh the cons, whereas you may feel differently.
Regardless, I have chosen the path which I believe to be the best for our team.

With that being said, it should be fairly trivial to *convert* this article into a tutorial.
Whenever you happen to come across a question of the form "Why did we choose *X*?", just convert it into a question of the form "What *X* should I choose for this problem?" and then search it up.

### Table of Contents
I will speak on the following topics to some moderate level of detail:
- Language + Toolset Choice
    - Why we decided to choose `rust` as our primary backend language
    - Why we chose the `actix-web` framework
- API Creation and Structuring
    - How we structures our APIs
- API Versioning Practices
    - How we versions their APIs
- Securing APIs
    - How to think in terms of security
- API Error Handling

### Language + Toolset Choice
#### Language Choice
Picking a primary programming language for development is a fairly important up-front choice I had to make when starting development on the backend.
The languages I was comfortable with were `rust`, `node.js`, `typescript`, `python`, `racket`, `java`, `c`, and `c++`.
Out of the above, I put into serious considerations into `rust`, `node.js`, and `typescript` primarily due to my work-experiences involving them.

Below, I categorize what I find to be the pros and cons of each language.
Note that, once again, this is an opinionated article.

### `node.js`

| Feature | Pros | Cons |
| | ---------- | ---------- |
| **Large Ecosystem** | Existing implementations ready to go | Potentially unreliable dependencies and large dependency graphs |
| **Lambdas/Closures** | Easy to use; provides the ability to program in a higher-order fashion | - |
| **Soft Typing** | Easy to modify existing code without major refactoring elsewhere; faster prototyping speed | Generally difficult to ramp-up incoming members on; prone to sneaky breaking changes (if a function type is changed, one may forget to update all callers of that function) |
| **Await/Async** | Built-in async runtime; existing async ecosystem is large | - |

### `rust`

| Feature | Pros | Cons |
| | ---------- | ---------- |
| **Semi-Large Ecosystem** | Existing implementations ready to go (not as big as `node`'s) | Potentially unreliable dependencies and large dependency graphs |
| **Lambdas/Closures** | Somewhat straightforward to use in most cases | Since closures cannot be explicitly typed, it can be harder returning them from functions; some difficulties with higher-order programming and async/await |
| **Strong Typing** | Stronger data guarantees (crucial for a data-driven application); easier to ramp-up new recruits since explicit typing helps in learning; changes to types can be statically found | Modifications require rewrites across a larger surface area |
| **Await/Async** | - | Non-standardized async engines (different libraries use different, non-compatible engines); Generally difficult to with alongside `rust`'s ownership/borrowing paradigm |
| **Functional Programming Roots** | Mutability is discouraged | - |
| **Verbosity** | - | Static typing, implementing traits, etc. forces one to write lots of boilerplate; general difficulties with closure programming leads to resorting to macros to solve verbosity issues (which then bumps up codegen time) |

### `typescript`

| Feature | Pros | Cons |
| | ---------- | ---------- |
| **Similar to `node`** | Essentially inherits most of `node`'s benefits and drawbacks *except* for typing | - |
| **Semi-Strong Typing** | Semi-strong typing helps catch errors at compile-time as opposed to run-time; changes to function types can be statically determinable | Types are still highly coercible |

<br>
<br>

For all accounts and purposes, `typescript` seemed to be the best solution.
However, I had to take into consideration 3 additional factors:
1. I had more experience with `rust`.
2. `rust` has a functional-oriented syntax as opposed to `typescript`'s imperatively-oriented.
3. The pool of `rust` developers, although notably smaller, are more mathematically minded. This is an aspect of the community I value.

All things considered, I decided that the pros of `rust` still outweighed the pros of `typescript`, and thus moved forward with it.

#### Toolset Choice
As per the web-framework, I chose the `actix-web` web-framework.
It was the largest web-framework at the time, and seemed most high-level enough for me.
However, our domain logic is separate enough from the actual API delivery logic that we can switch out to a new framework fairly quickly, if need be.

All other tools being used in the project are essentially standardized as the go-tos in the community.
As such, I will not discuss them further.

### API Creation and Structuring
Todo!

### API Versioning Practices
API versioning is an extremely important facet to bear in mind during development.
You need a mechanism in place to allow clients to be able to hit previous API interfaces while also allowing new ones to be developed and released ***at the same time***.

Over at *Wavy*, I've gone through 2 iterations of API versioning mechanisms, the first of which has been killed and replaced with the second.
The two techniques that were being employed were:
1. Prepending a version number to each `http` path (i.e., `/1.0.0/users/me` would request version `1.0.0` of the `/users/me` API)
2. Injecting the requested API version into the `http` body with the header-name being `VERSION` (i.e., an entry of the form `VERSION: 1.2.3`).

##### Prepending the API Version
The former was the initial technique of choice.
However, in order to implement this, a *lot* of copy-pasting would have needed to be done.

For example, let's say I had a directory named `1.3.10` which contained all of the source code pertaining to API version `1.3.10`.
Now consider that I wanted to release a modified API with version `2.0.0`.
Sticking to my own rules, I would create a new directory called `2.0.0`, and then essentially *copy* over all of the files from `1.3.10` into `2.0.0` and make my modifications there.

This was too messy of a solution, and I required something more maintainable.

##### Injecting API Version into `http` Body
I switched over to having the client inject their requested API version into the body of the `http` message.

Implementation-wise, I have a `Version` enum containing all the different API versions being supported.
Upon receiving an `http`-request, the `actix-web` middleware kicks in; it parses the request object, pulls out the requested API version (as a string), and then deserializes it into a variant of `Version`.

This has a dually beneficial feature in that if no requested API version is provided, the latest stable API release will be artifically injected into the request and used by the appropriate handler.

### Securing APIs
Todo!

### API Error Handling
Todo!
