+++
title = "Buck2 builds: An introduction"
date = 2024-07-11
+++

# Intro

[`buck2`](https://buck2.build) is a new and fast open-source tool developed by Meta.
From what I've read, it's loosely based off of [`Bazel`](https://bazel.build) (developed by Google), but tends to be quite a bit more snappy from a user's perspective.
It's also written in `rust` (duh).

<br>

# Background

My familiarity with *custom* build-tools coming out of university was non-existent.
My entire experience with them was using *out-of-the-box* ones such as `cargo` for `rust` and `gleam` for `gleam-lang`.
The reason being is that I had never worked on large, polyglot, *mono-repositories* before.
In all of my experiences working on large, polyglot applications, they would always be *split up into multiple smaller repositories*, of which each repository would be *monoglottic* in and of itself.
Therefore, each monoglot repository could then just benefit from using that language's preferred, out-of-the-box build-tool.

In my mind, if you did want to execute some complex sequence of build steps, you could just write a simple little bash script.
Or, if you were feeling especially fancy, you could even write it in `python` or some other quick and dirty scripting language.
Then, everytime you wanted to execute that sequence of build steps, you would just run that script.

My opinion slowly started to change when I got introduced to my first large, polyglot mono-repository.
And my opinion finally fully converted when I realized the amount of "codegen"-ing that was being used to create source code for downstream build steps.

In large, polyglot mono-repositories, you will have a plethora of build steps, all interconnected in a tangled ADG (acyclic-directed-graph).
And that is just too complex for a simple little script to comprehend.
This is where more formalized solutions like `buck2` step in to solve the problem.

<br>

# Goal

Let's try to replicate the primary functionalities of `cargo` using `buck2`.
The primary functionalities that `cargo` provides us with are:
- `cargo build` (builds the entire project)
- `cargo run` (builds the entire project and then runs the produced executable)
- `cargo test` (builds the entire project and runs any associated tests)

At the end, we should have created a close replica of the above `cargo` commands such that we can roughly run the following commands:
- `buck2 build ...`
- `buck2 run ...`
- `buck2 test ...`

Lastly, the language that I will choose to implement this small example in is `C`.
The concepts that I'll be focusing on here, however, will be so largely agnostic of `C` itself that the core principlies can be easily carried over to any other language (i.e., `rust`, `go`, `ocaml`, etc.).

<br>

# Installation

First things first, we need to download `buck2`.
The installation steps are available [here](https://buck2.build/docs/getting_started).
Once you are done, you should be able to enter:

```bash,linenos
buck2 --version
```

and see a *build-id* being outputted to the screen.
That means that the installation of the `buck2` binary and its addition to your path were successful.
The output that I saw from running that command was `buck2 02c303cd4a4330688844d492950c11fd <build-id>`.
You may be running a slightly newer or older version than I am; that may or may not cause some slight differences in the APIs that `buck2` exposes.

<br>

# Empty repository

Let's create an empty skeleton for a `buck2` project.

```bash,linenos
mkdir buck2-build
cd buck2-build
buck2 init .
```

This will initialize an empty `buck2` repository for us.
Most importantly, this repository will *not* contain any prebuilt rules!
This is going to be especially important for us since we are going to be re-writing them from scratch.

This is the structure of the repository that you should be seeing so far:

```txt,linenos
buck2-build/
    |- .buckroot
    |- .buckconfig
    |- BUCK
    |- toolchains/
        |- BUCK
```

The `.buckroot` file should be empty.
Keep it that way.
That's what `buck2` uses to determine the root of the repository.
When it's searching for targets, it will recursively search up the directory-tree until it finds the one its looking for.
This file tells `buck2` to stop going further up.

The `BUCK` and `toolchains/BUCK` files should contain some default rules in there.
Go ahead and delete all of their contents (but don't delete the files, we'll need them later).

Finally, the `.buckconfig` is an `INI` file format and contains some default configs for `buck2` to understand.
You may see multiple headers in that file (i.e., `cells`, `cell_aliases`, `external_cells`, `parser`, `build`, etc.).
Now, admittedly, I'm not sure what most of these headers are for.
The ones that I'm familiar with are `cells` and `cell_aliases`.
I usually delete *all the other table headers* and keep only the `cells` and `cell_aliases` table headers around, so you can also do the same.

The final thing we need to do is create a `prelude/prelude.bzl` file.
This file *must* be present.
Whatever items that are defined in there are *auto-imported* across all of your `.bzl` and `BUCK` files.
We will add some things in there later.

```txt,linenos
buck2-build/
    |- .buckroot
    |- .buckconfig
    |- BUCK
    |- toolchains/
        |- BUCK
    |- prelude/
        |- prelude.bzl
```

All of these files (except for the `.buckconfig`) should be empty.
This will be our starting off point for our example project.
Super minimal, as you can clearly see.

<br>

# Running our first build

Now that we have a bare-bones `buck2` project, we can finally run a build.
Of course, that build won't do anything special (since there's literally nothing to build), but the command should still work vacuously.

Therefore, run the following:

```bash,linenos
buck2 build //:
```

That should succeed with a nice little green message that says `BUILD SUCCEEDED`.

Now let's address the obvious question here:
What the hell is that weird looking `//:` thing at the end?
In short, that is a [*build target*](https://buck2.build/docs/concepts/build_target).
There is a great summary [here](https://buck2.build/docs/concepts/key_concepts/) of the overall concepts of cells, build targets, and build files.
I recommend you read up on those concepts thoroughly before continuing with the rest of this post.

<br>

# Writing our first rule and target

Let's create one additional file called `build.bzl` at the root of the repository.
Your repository should now look like this:

```txt,linenos
buck2-build/
    |- .buckroot
    |- .buckconfig
    |- BUCK
    |- toolchains/
        |- BUCK
    |- prelude/
        |- prelude.bzl
    |- build.bzl
```

Inside of that `build.bzl` file, we're going to write a simple rule that practically does nothing.

```bzl,linenos
# (build.bzl)

simple_rule_that_practically_does_nothing = rule(
  impl=lambda ctx: ...,
  attrs={
    "attr_1": ...,
    # ...
    "attr_n": ...,
  },
)
```

Above, the `simple_rule_that_practically_does_nothing` instance is a *rule*.
Rules are functions which describe how to build something.
They take in some inputs (hereby referred to as "attributes"; i.e., `attr_1`, `attr_2`, etc.), run the function defined by `impl`, and return that function's output.
The attributes are passed into the `impl` function via the `ctx` argument (i.e., `ctx.attrs`).

Now, inside of our `BUCK` file, we can then *import* that rule that we just wrote and apply it with some arguments.

```bzl,linenos
# (BUCK)

load("@root//build.bzl", "simple_rule_that_practically_does_nothing")

simple_rule_that_practically_does_nothing(
  name="my_first_target",
  attr_1=...,
  # ...
  attr_n=...,
)
```

When we apply a rule (which is simply a function), we get a target.
Therefore, the *application of a rule is a target!*
The *name* of the target is `my_first_target` and, most importantly, the way we can build that target is by running:

```bash,linenos
buck2 build //:my_first_target
```

However, running that above command in your shell won't work just yet.
Remember, we've littered the `build.bzl` file with "..."s.
In order for things to build, we'll need to fill in those ellipses with meaningful code.

However, the concepts that should be clear at this point are:
1. I can create a rule which takes in attributes and runs a function if called, thereby producing an output
2. Targets are applications of rules.
3. The same rule can be used for multiple different targets.
For example, I could add a second target inside of my `BUCK` file as such:

```bzl,linenos
# (BUCK)

load("@root//build.bzl", "simple_rule_that_practically_does_nothing")

simple_rule_that_practically_does_nothing(
  name="my_first_target",
  attr_1=...,
  # ...
  attr_n=...,
)

simple_rule_that_practically_does_nothing(
  name="my_second_target",
  attr_1=...,
  # ...
  attr_n=...,
)
```

I could then individually build the first target (by running `buck2 build //:my_first_target`), individually build the second target (by running `buck2 build //:my_second_target`), or build them both (by running `buck2 build //:`).

<br>

# Creating rules to compile a C source file

Let's create a more practical rule now.
We'll write a rule that, once called, will compile a `C` source file into an executable binary.
Now, I will be using `clang`, but it should be clear that you can use whatever compiler you wish to use.

Let's re-write our `build.bzl` file with the following:

```bzl,linenos
def c_binary_impl(ctx):
  ...

c_binary = rule(
  impl=c_binary_impl,
  attrs={},
)
```
