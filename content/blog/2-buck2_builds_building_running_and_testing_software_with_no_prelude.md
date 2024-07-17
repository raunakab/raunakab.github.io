+++
title = "Buck2 builds: building, running, and testing software with no prelude"
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
I'd say that a rough understanding of what rules, targets, and providers are should suffice.
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

# Writing a compile rule

Let's jump right in and write a rule that compiles a *single* `C` source file into an executable.
If we were to do this manually, the command we would invoke from the command-line would be:

```bash,linenos
clang main.c -o main
```

(assuming that we're using `clang` and the source code exists inside of a file called `main.c`).

If we would want `buck2` to run this command for us instead, we need to do two things:
1. Define a "rule".
2. Define a "target" that applies that "rule".

Let's tackle each one in order.

<br>

## 1. Defining a "rule"

We first start off by writing an "empty" rule.
Open up your `build.bzl` file and paste in the following:

```bzl,linenos
# (build.bzl)

def compile_impl(ctx):
  return [DefaultInfo()]

compile = rule(
  impl=compile_impl,
  attrs={},
)
```

What you see above is essentially the bare minimum that a `buck2` rule needs in order to be runnable.
Using this rule will be practically useless, but it's important to know that it's the bare minimum starting point.

Now, since we want our rule to eventually compile a single `C` source file into an executable, let's start off by extending our rule to *take in the path to the source file* first:

```bzl,linenos
compile = rule(
  impl=compile_impl,
  attrs={
    "source_file": attrs.source(),
  },
)
```

(The `attrs` variable here is some global variable that `buck2` exposes that you can access in any build file.
It allows you to specify the type of each attribute that the rule should be expecting.
For this rule, we expect that the `source_file` attribute is a path to some file on the system; thus `source_file: attrs.source()`.
A list of all the attribute types are [here](https://buck2.build/docs/api/build/attrs).)

Next, since our `compile_impl` function (the actual function that will run the build logic for us) has access to that `source_file` attribute (via `ctx.attrs.source_file`), our subsequent step will be to extend the logic inside of that function to actually perform the compilation:

```bzl,linenos
def compile_impl(ctx):
  compiler = "/path/to/clang"
  source_file = ctx.attrs.source_file
  output_name = "main"

  # We need to inform `buck2` that whatever command that we're going to run is going to produce an output named "main".
  output = ctx.actions.declare_output(output_name)

  # The arguments to this function expand to:
  # `/path/to/clang {SOURCE_FILE} -o main`
  # which is what we would have ran manually.
  command = cmd_args([
    compiler,
    source_file,
    "-o",
    output.as_output(),
  ])

  # We then run the actual command.
  # `buck2` will grab the resulting output and place it inside of its output directory, `buck-out`.
  ctx.actions.run(command, category="compile", identifier=output_name)

  return [DefaultInfo(default_output=output)]
```

And that's pretty much it.
Sure, there are a lot of things that could be cleaned up here (e.g., hard-coded constants could be turned into parameters), but this is largely the bread and butter of what a rule needs in order to accept a `C` source file and compile it into an output.
The rule accepts a `source_file` attribute, declares an output, runs a command, and then returns that output (via the `DefaultInfo` provider).

Keep in mind, however, that we still don't have anything that can be "built" just yet.
We've just written a rule; we haven't *applied* that rule anywhere.

This is because a rule, internally, is just a function.
And just defining a function doesn't mean that it'll be called.
If we want to call a function, we'll need to write a ["function application"](https://en.wikipedia.org/wiki/Function_application) (or a "function call", as some may call it).
And in `buck2`, that is called a "target".

<br>

## 2. Defining a "target"

Let's consume the rule that we wrote and write a target that applies it.
In your root `BUCK` file, paste the following:

```bzl,linenos
# (BUCK)

# load the `compile` rule from the `build.bzl` file
load("@root//build.bzl", "compile")

# apply it!
compile()
```

This is essentially how we create a target.
We import rules and apply them using parens (makes sense since rules are functions, and this is how you call functions).

However, the above is *not* a working target.
It doesn't pass in the appropriate parameters that the `compile` function needs.
If you defined a function that expected one parameter and you called it with none, the function would obviously err (either at runtime or compiletime, depending on the language that you're using).
So let's add the required parameters one by one.

Firstly, we need to pass a `name` parameter:

```bzl,linenos
compile(
  name="my_first_target",
)
```

This provides an identity to each target.
This is important because a `BUCK` file can contain *multiple* targets.
Each target could be an application of the same rule.
Therefore, we need some way of giving each target a unique name; thus, the `name` parameter.

Secondly, we can optionally pass in a `visibility` parameter.
Although it's not needed, I usually add it to be as explicit as possible.
Leaving it empty will default to `"PRIVATE"`.

```bzl,linenos
compile(
  name="my_first_target",
  visibility=["PUBLIC"],
)
```

And lastly, we need to pass in that `source_file` attribute that we defined earlier:

```bzl,linenos
compile(
  name="my_first_target",
  visibility=["PUBLIC"],
  source_file="path/to/main.c",
)
```

Now, you can create a `main.c` file at whatever path you specified and add some basic boilerplate:

```c,linenos
// (main.c)

int main(void) { return 0; }
```

And now, with all of the pieces fit together, we can finally run a full, proper build.
Since we want to build the `root//:my_first_target` target, we will want to specify that when running `buck2 build`.
Therefore, run the following command:

```sh,linenos
buck2 build root//:my_first_target
```

That should succeed with a nice little, green message saying `BUILD SUCCEEDED`.
