+++
title = "Buck2 builds: a soft introduction to buck2 using no-prelude builds"
date = 2024-07-16
+++

# Intro

[`Buck2`](https://buck2.build) is a new and fast open-source tool developed by Meta.
From what I've read, it's loosely based off of [`Bazel`](https://bazel.build) (developed by Google), but tends to be quite a bit more snappy from a user's perspective.
It's also written in `rust` (duh).

The frontend to `buck2`, however, is *not* in `rust`.
End-users interface with it via a language called [`starlark`](https://github.com/bazelbuild/starlark), which is a dialect of `python`.
From a pure syntax perspective, `python` users should be able to quickly pick up here, but it should be noted that dependencies and libraries available in the `python` ecosystem seem to not be cross-compatible.

<br>

# Prerequisites

Before we get started with our goal for this article, you should be familiar with the basics of `buck2`.
Namely, you should understand what the following are:
- [build rules](https://buck2.build/docs/concepts/build_rule)
- [build files](https://buck2.build/docs/concepts/build_file)
- [build targets](https://buck2.build/docs/concepts/build_target)
- [providers](https://buck2.build/docs/rule_authors/writing_rules/#providers)
- [target patterns](https://buck2.build/docs/concepts/target_pattern)

and how to use them.

For example, the following two excerpts should be fairly easy to understand:

```bzl,linenos
# (build.bzl)

def my_rule_impl(ctx):
  return [DefaultInfo()]


my_rule = rule(
  impl=my_rule_impl,
  attrs={},
)
```

```bzl,linenos
# (BUCK)

load("@root//build.bzl", "my_rule")

my_rule(
  name="my_target",
  visibility=["PUBLIC"],
)
```

If you're not familiar with the above, I recommend that you quickly read up on the above links first and then come back.
I'd say that a rough understanding of what rules, targets, providers, and target patterns are should suffice.
You don't need a crystal clear picture of why they are the way they are, but some sort of semblance of how they fit in together should be perfect.
The rest of your understandings should hopefully be gleaned by reading through this article and implementing additional, more difficult features by yourself.

In my opinion, hopping back between those above links and this article would most likely be the best tool for learning `buck2` quickly and effectively.

<br>

# Goal

Our main goal for this article will be to duplicate the basics functionalities of `cargo` into `buck2`.
Namely, we want to design our `buck2` repository in such a way that it can act as a *simple* replacement to `cargo`.
I mention *simple* here because `cargo` tends to be quite jam-packed with features.
It supports different build paradigms (simple projects vs. [workspaces](https://doc.rust-lang.org/cargo/reference/workspaces.html)), has a plethora of [build configurations](https://doc.rust-lang.org/cargo/reference/config.html), and even contains [build scripts](https://doc.rust-lang.org/cargo/reference/build-scripts.html) that can execute prior to a full build.

Now, those features are great and all, but we don't want to be duplicating all of that!
Writing an article about implementing all of those features would result in me writing a novel.
Instead, let's stick to the basics:
1. `cargo build`: Compiles and links the source code (including all of its dependencies) into a final executable (if it's a binary) or an object file (if it's a library).
2. `cargo run`: Runs the built executable (provided that the source code is a binary).
3. `cargo test`: Runs all the unit/integration tests defined in a project.

By the end of this article, we will have hopefully created a convincing enough *simplified* clone of `cargo` in `buck2`.
In essence, we will be able to run the following (pseudo-) commands and have them do the same thing that their corresponding `cargo` command would have done originally:
1. `buck2 build`
2. `buck2 run`
3. `buck2 test`

(The reason I mention "pseudo-commands" is because the syntax of a `buck2` command is slightly different than what I've shown, but the spirit is the same).

Lastly, the language that I'll be writing the source code in for this article will be `C`.
That, however, shouldn't deter you from continuing to read on.
Choosing `C` was merely a side-effect of writing this post; I could have easily chosen `rust`, `ocaml`, `go`, `typescript`, or any other language that requires some sort of compile step.
The main concepts that you will read about will revolve around writing the rules and targets for `buck2`.
You'll easily be able to transfer your skills to any other language of your choice.

<br>

# Installation

First things first, we need to download `buck2`.
The installation steps are available [here](https://buck2.build/docs/getting_started).
Once you are done, you should be able to enter:

```bash,linenos
buck2 --version
```

and see a *build-id* being outputted to the screen.
That means that both the installation of the `buck2` binary and its addition to your path were successful.
The output that I saw from running that command was `buck2 02c303cd4a4330688844d492950c11fd <build-id>`.
You may be running a slightly newer or older version than I am; that may or may not cause some slight differences in the APIs that `buck2` exposes.

<br>

# Creating an empty buck2 project

Let's create an empty skeleton for a `buck2` project.

```bash,linenos
mkdir buck2-build
cd buck2-build
buck2 init .
```

This will initialize an empty `buck2` repository for us.
Most importantly, this repository will *not* contain any prebuilt rules!
This is going to be especially important for us since we are going to be re-writing them from scratch (thus fulfilling the entire "no-prelude" point of this article).

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
We won't be adding anything inside of that file for this example, but it still needs to be present nonetheless.

Your repository should now be looking like this:

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

Actually, since everything that `buck2` needs to be present is present, you can start running a build at this stage!
Of course, that build won't do anything special (since there's literally nothing to build), but the command should still work vacuously.
Try running the following:

```bash,linenos
buck2 build //:
```

That should succeed with a nice, little, green message that says `BUILD SUCCEEDED`.
You may have noticed the strange looking `//:` at the end.
That is a [target pattern](https://buck2.build/docs/concepts/target_pattern).
It's the way `buck2` can identify targets that are located inside of a `buck2` project.
The concept is quite detailed, and in my opinion, the docs provide a much better explanation of it than I can.
I recommend reading up on it if you're unfamiliar with the concept.

<br>

# Writing a compile rule

Let's jump right in and write a rule that compiles a *single* `C` source file into an executable.
Our rule will notably *not* compile multiple `C` source files into a final executable, nor be able to link any form of dependencies together.
I've placed these restrictions here intentionally; I want our logic to remain super simple.
Because of those restrictions, we don't have to compile each dependency separately, or link them all together using a linker utility.
We can just focus on turning one, singular `C` source file into a binary.

Firstly, create a `src` directory in the root of your project, and then place a `main.c` file inside of it.
Your project should now be looking like this:

```txt,linenos
buck2-build/
    |- .buckroot
    |- .buckconfig
    |- BUCK
    |- toolchains/
        |- BUCK
    |- prelude/
        |- prelude.bzl
    |- src/
        |- main.c
```

Next, throw some basic, boilerplate `C` source code inside of `main.c`.
It doesn't need to be anything fancy; the point of this article is to showcase the features of `buck2`, not for me to show-off my `C` skills!
This is what I threw in there:

```c,linenos
// (src/main.c)

int main(void) { return 0; }
```

Obviously very basic, but we don't need the code to be too complex right now.

Okay, so now we have a source file with some basic `C` code inside of it.
Now what?
Well, we eventually want `buck2` to run a compile command for us, right?
So if we were to invoke the compiler on this file manually, the command we would run is:

```bash,linenos
clang src/main.c -o main
```

(assuming that we're using `clang`).

So our goal should be for us to write some build code in such a way that `buck2` will eventually end up running that exact command for us...

The way we go about doing that is by:
1. Defining a "rule".
2. Defining a "target" that applies that "rule".

As soon as we do those above two things, `buck2` will know what to do when we ask it to "build our `C` file".
Internally, it will run that exact, raw command for us!
The nice thing is that `buck2` will give us a nice interface for us to build things, but internally, *it will be the one to invoke those ugly command line calls*.

With all of that being said, let's tackle each one of those tasks in order.

<br>

## 1. Defining a "rule"

Let's start off by writing a hard-coded rule that compiles that `src/main.c` file into an executable.

I'm firstly going to write the skeleton of a rule.
It'll be empty and do practically nothing, but it will still be a perfectly valid and legal rule according to `buck2`.

```bzl,linenos
# (build.bzl)

def compile_c_impl(ctx):
  return [DefaultInfo()]


compile_c = rule(
  impl=compile_c_impl,
  attrs={},
)
```

Here, I've created a rule called `compile_c`.
The rule does as what its name implies; it compiles a `C` file.

The rule takes a callback, named `impl`, and some attributes, named `attrs`, as parameters.
The `impl` callback is called whenever that rule is called.
You can think of it as the actual "meat" of the rule; that is where you'll put all of your compiling logic.
The `attrs` are essentially arguments that you can pass to that rule.
If you wanted to pass that rule some additional arguments, you would pass it through that `attrs` parameter, and the `impl` callback would be able to access them via the `ctx` parameter that is passed to it (i.e., via `ctx.attrs.{ARGUMENT_NAME}`).

Okay, so now that we have the basic skeleton of a `buck2` rule, let's fill it with the actual logic required to run that `clang src/main.c -o main` command:

```bzl,linenos
def compile_c_impl(ctx):
  compiler = "path/to/clang"
  source_file = "src/main.c"
  output = ctx.actions.declare_output("main")

  compile_command = cmd_args([
    compiler,
    source_file,
    "-o",
    output.as_output(),
  ])

  ctx.actions.run(compile_command, category="compile")

  return [DefaultInfo(default_output=output)]
```

Oof; there's quite a few interesting things going on there.
Let's break it down line by line.

- Line 2, 3:
Here, we're simply just defining some hard-coded values.
A little ugly, but we'll make it prettier later.
- Line 4:
This one is interesting.
Here, we're letting `buck2` know in advance that we're going to be running a command sometime in the future, and that command will *produce an output*.
We're also notifying `buck2` that the name of that output will be `"main"`.
`buck2` will remember that you declared this and perform some internal bookkeeping (what exactly that bookkeeping is, however, I'm not too sure).
- Line 6 - 11:
Here, we're just piecing together all of the separate arguments of the command into one final piece.
An interesting thing to note here is the last part: `output.as_output()` on Line 10.
Remember how we had `output = ctx.actions.declare_output("main")` on Line 4?
Here, we're notifying to `buck2` that this is the command which will produce that output file named `"main"`.
- Line 13:
Now we finally run that compile command.
I'm not too sure why we need to specificy `category="compile"`, but I've seen it being done in the docs, so I do it myself too.
- Line 15:
We return a list of providers.
Remember that every `impl` callback needs to return a list of providers, and that one of them *has* to be the `DefaultInfo` provider.
In this situation, since we have the final output that we want this `compile_c` rule to produce, this `impl` callback will just return that output as part of the `DefaultInfo` provider.

Okay, and that's pretty much it.
We've defined a rule with all the things required for it to run properly.
There are still plenty of things that we could do to make it prettier and less brittle (e.g., remove some of those hardcoded values), but the basics are done.
We have a functioning rule.

Keep in mind, however, that we still don't have anything that can be "built" just yet.
We've just written a rule; we haven't *applied* that rule anywhere.

This is because a rule, internally, is just a function.
And just defining a function doesn't mean that it'll be called.
If we want to call a function, we'll need to write a ["function application"](https://en.wikipedia.org/wiki/Function_application) (or a "function call", as some may call it).
And in `buck2`, that is called a "target".

<br>

## 2. Defining a target

A target, as mentioned previously, is a "function application".
Namely, it's the application of a rule.
All targets *must* live inside of `BUCK` files.
(In my opinion, this is a nice separation; the logic-heavy rules are defined inside of the `*.bzl` files whereas the high-level, simple targets are defined inside of the `BUCK` files).

Therefore, if we want to define a target that applies that `compile_c` rule that we just wrote, we'll need import that rule and apply it with all the necessary arguments.
Thus:

```bzl,linenos
# (BUCK)

load("@root//build.bzl", "compile_c")

compile_c(
  name="my_first_target",
  visibility=["PUBLIC"],
)
```

Oof; once again, we have a lot of peculiarities inside of this excerpt.
Let's break it down line by line:

- Line 3:
The `load` function does as what its name implies; it looks inside of whatever file specified in the first argument and loads the second symbol from it.
The file path that is passed to it, `@root//build.bzl`, is that [target pattern](https://buck2.build/docs/concepts/target_pattern) concept that was mentioned in those docs that I linked earlier.
An interesting thing to note is that `load` can actually load an arbitrary number of things from one file.
For example, let's say `@root//build.bzl` *also* defined `compile_rust` and `compile_go`.
You could then import all of these rules in one-shot by writing `load("@root//build.bzl", "compile_c", "compile_rust", "compile_go")`.
- Line 5-8:
This is the actual *application* of that `compile_c` rule!
As you can see, it's a basic function application (makes sense since rules are functions at the end of the day).
Another important thing to note are the parameters that are passed in to the `compile_c` function application: `name` and `visibility`.
  - `name`:
  Since one `BUCK` file can have *multiple* targets defined inside of it, we need some sort of way of *identifying* each target.
  Thus, the `name` parameter solves that problem by giving each target a uniquely identifying name.
  - `visibility`:
  This parameter is optional and can be left out.
  In the case that it is *not* specified, it will default to being `["PRIVATE"]`, which means that targets in parent/sibling `BUCK` files will *not* be able to access this target!
  Since I don't want to impose any restrictions on visibility right now, I just explicitly marked it as `["PUBLIC"]`.

And bam!
We're done.
We can finally run a build and have it succeed.
To do so, run the following command:

```bash,linenos
buck2 build root//:my_first_target
```

That should succeed with another nice, little, green message that says `BUILD SUCCEEDED`.
This will fully compile that `C` source file into an executable and place it deep inside of the `buck-out` output directory.

Now it seems that everything we have so far is --albeit messy and hardcoded-- perfectly fine.
This is actually not the case.
There's an insidious error hiding inside of our logic.
In order to see it in action, try throwing a purposeful compile-error inside of your `C` code (*without updating any `BUCK` or `bzl` files*) and re-running the build.
You'll notice that it *still succeeds*.
This definitely should not be happening.

The reason why this is happening is because of how aggressive `buck2` is in regards to caching builds.
`buck2` will only ever re-run builds if the input files to a rule have changed.
And since we hardcoded the `main.c` file inside of that rule, it doesn't realize that it needs to re-run that `impl` callback whenever `main.c` is updated!
Therefore, `buck2` does not re-run *anything* again.

Thus, our last task will be to update our rule to take in a "source file" as an input to our rule.
That way, `buck2` will know to pay attention to it and will re-run builds whenever that source file has changed.

```bzl,linenos
# (build.bzl)

def compile_c_impl(ctx):
  compiler = "path/to/clang"
  source_file = ctx.attrs.source_file
  output = ctx.actions.declare_output("main")

  compile_command = cmd_args([
    compiler,
    source_file,
    "-o",
    output.as_output(),
  ])

  ctx.actions.run(compile_command, category="compile")

  return [DefaultInfo(default_output=output)]


compile_c = rule(
  impl=compile_c_impl,
  attrs={
    "source_file": attrs.source(),
  },
)

```

```bzl,linenos
# (BUCK)

load("@root//build.bzl", "compile_c")

compile_c(
  name="my_first_target",
  visibility=["PUBLIC"],
  source_file="src/main.c",
)
```

The only lines which have changed are:
- Lines 5, 23 in `build.bzl`:
We improved the rule by accepting a `source_file` attribute of type `attrs.source()` (all attributes types are available [here](https://buck2.build/docs/api/build/attrs)).
We then updated our `compile_c_impl` callback to use `source_file = ctx.attrs.source_file` instead of the previous hard-coded version.
When `source_file` is passed to the `cmd_args` function, `buck2` will make a note that this file is a dependency, and as such will always re-run this rule when that given file is updated.
- Line 8 in `BUCK`:
We pass the `src/main.c` file as a parameter to this rule.

Now everything should work as expected.
If you update `src/main.c` to be intentionally erroneous, running `buck2 build root//:my_first_target` will appropriately fail.
Fixing those errors will then result in successful builds again.

<br>

# Running an executable

Okay, cool.
We can build a single executable.
But how about *running* it?
Right now, all `buck2` knows how to do is *compile* our source code into an executable binary.
We haven't told it how to run that executable binary.

However, making that change will actually be super simple.
In order for `buck2` to recognize how to run an executable, we need to just append one additional provider to the `impl` callback that we wrote earlier.
Namely:

```bzl,linenos
# (build.bzl)

def compile_c_impl(ctx):
  compiler = "path/to/clang"
  source_file = ctx.attrs.source_file
  output = ctx.actions.declare_output("main")

  compile_command = cmd_args([
    compiler,
    source_file,
    "-o",
    output.as_output(),
  ])

  ctx.actions.run(compile_command, category="compile")

  run_command = cmd_args([output])

  return [DefaultInfo(default_output=output), RunInfo(args=run_command)]
```

The lines which have changed are:
- Line 17:
Here, I've created a new command which simply just calls the produced `output` executable binary.
That should make sense; if we produced an output via running `clang src/main.c -o main`, the way we would run that output would be via `./main`.
Therefore, creating a new command with the list of arguments being just `[output]` correlates to how we would have manually run it.
- Line 19:
We pass in `run_command` to a provider called `RunInfo`.
`buck2` will then see that this rule has produced a `RunInfo` provider, and thus will know that whatever target called this rule is *runnable* via running `run_command`!

You can even try running the `root//:my_first_target` target.
Run the following command:

```bash,linenos
buck2 run root//:my_first_target
```

That should build the executable binary (if and only if it *hasn't* been built previously), and then run that built output.
You could even try modifying `main.c` to print something to the command line.
Our rule should be able to support `stdlib` imports.
For example, we could update `main.c` to be instead:

```c,linenos
// (src/main.c)

#include <stdio.h>

int main(void) {
  printf("Hello, world!");
  return 0;
}
```

And, as expected, you should see `"Hello, world!"` being printed to the console when `buck2 run root//:my_first_target` is invoked.
Modifying the `printf` call with some other message and re-running that command will perform another rebuild and re-run, but this time with the new message being printed to console.

<br>

# Next steps

Building and running a simple executable binary is, admittedly, not that complex.
For starters, we're only compiling *one* `C` source file.
Our rule cannot support compiling + linking *multiple* `C` source files into one final executable.
Additionally, our rule can't link external shared objects (i.e., `.so`'s) either.

All of these limitations to our existing rule, however, can be overcome.
The simple way I go about it is to consider what the raw command that I would need to invoke is, and then write my rule off of that.
For example, if I want to compile multiple `C` source files into `.o` object files, and then link them all together, the raw bash commands that I would manually invoke would be:

```bash,linenos
for file in ./*.c;
do
  clang -c $file -o ...
done

clang $file_1 ... $file_n -o main
```

(please excuse my `bash`, it's horrible).

Therefore, if I wanted to write a rule that ran those commands above, I would essentially write an `impl` callback like:

```bzl,linenos
def compile_multiple_c_impl(ctx):
  compiler = "path/to/clang"

  outputs = []
  for file in ctx.attrs.files:
    name = get_file_name(file)
    output = ctx.actions.declare_output(name)
    command = cmd_args([
      compiler,
      "-c",
      file,
      "-o",
      output.as_output(),
    ])
    ctx.actions.run(command, category="compile", identifier=name)
    outputs.append(output)

  name = "main"
  final_output = ctx.actions.declare_output(name)
  command = cmd_args(
    [
      compiler,
    ] + outputs + [
      "-o",
      final_output.as_output(),
    ]
  )
  ctx.actions.run(command, category="compile", identifier=name)
  return [DefaultInfo(default_output=output)]
```

As you can clearly see, there's a close correlation between the logic inside of the `compile_multiple_c_impl` callback and the raw `bash` command.
