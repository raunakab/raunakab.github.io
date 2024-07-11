+++
title = "No prelude builds using `buck2`"
date = 2024-07-11
+++

# Intro

[`buck2`](https://buck2.build) is a new and fast open-source tool developed by Meta.
From what I've read, it's loosely based off of [`Bazel`](https://bazel.build) (developed by Google), but tends to be quite a bit more snappy from a user's perspective.
It's also written in `rust` (duh).

# Background

My familiarity with *custom* build-tools coming out of university was non-existent.
My entire experience with them was using *out-of-the-box* ones such as `cargo` for `rust` and `gleam` for `gleam-lang`.
The reason being is that I had never worked on large, polyglot, *mono-repository* systems before.
In all of my experiences working on large, polyglot software systems, they would always be *split up into multiple smaller repositories*, of which each repository would be *monoglottic* in and of itself.
Therefore, each monoglot repository could then just benefit from using that language's preferred build-tool.

In my mind, if you did want to execute some complex sequence of build steps, you could just write a simple little bash script.
Or, if you were feeling especially fancy, you could even write it in `python`.

My opinion slowly started to change when I got introduced to my first large, polyglot mono-repository.
And my opinion finally fully converted when I realized the amount of "codegen"-ing that was being used to create source code for downstream build steps.

The heart of a build tool contains build steps.
Build steps take in inputs and produce outputs.
The outputs of a previous build step can be the inputs to a future build step.
Build steps can be interconnected into a vast (acyclic) network of dependencies.
As such, we can visualize build steps as nodes in a graph, with the *directed* edges being dependencies between them.

In large software repositories, you will have a plethora of such nodes, all interconnected in a large tangle.
And that is just too complex for a simple little script to comprehend.
This is where more formalized solutions like `buck2` step in to solve the problem.

# Goal

Let's try to replicate the primary functionalities of `cargo` using `buck2`.
The primary functionalities that `cargo` provides us with are:
- `cargo build` (builds the entire project)
- `cargo run` (builds the entire project and then runs the produced executable)
- `cargo test` (builds the entire project and runs any associated tests)

At the end, we should have created a close replica of the above `cargo` commands such that we can run the following *"pseudo-commands"*:
- `buck2 build ...`
- `buck2 run ...`
- `buck2 test ...`

The language that I chose to implement this small example in is `C`.
However, the concepts that I'll be focusing on here will be largely agnostic of `C` itself, and thus can be carried over to any other language (i.e., `rust`, `go`, `ocaml`, etc.).

# Getting started

First things first, we need to download `buck2`.
The installation steps are available [here](https://buck2.build/docs/getting_started).
You should be able to enter

```bash,linenos
buck2 asdf
```

in your command line and see some help instructions being outputted.
That means that the installation of the `buck2` binary and its addition to your path were successful.
