+++
title = "Cross-Platform UI Rendering - (Part 2)"
date = 2024-06-11
+++

*This is the second article in a series of articles.
The previous one is available [here](../1-crossplatformuirendering-p1).*

# Recap

In the [previous post](../1-crossplatformuirendering-p1), I talked about cross-platform UI rendering stacks, and how a *true* cross-platform solution doesn't exist (on account of React Native not being *truly* cross-platform).

I also mentioned two new technologies: [`WASM`](https://webassembly.org) and [`WebGPU`](https://www.w3.org/TR/webgpu).
I think the combination of the two may be our solution here.

<br>

# Standardizing Assembly Code and GPU APIs
It probably suffices that I provide some insight into what `WASM` and `WebGPU` are exactly.
I won't go into too much detail here (you can find plenty of articles online detailing the depths of either standard to a greater degree than I ever could), but I can give a brief overview.

### WASM

An assembly language is a low-level, statement-oriented language which is very semantically close[^1] to the binary instructions that processors execute.

```asm,linenos
movl $1, %eax
movl $2, %ebx
addl %ebx, %eax
```

However, assembly code is *highly* platform-dependent.
If you have `x86` assembly code, you *cannot* run it on an `arm` CPU, and vice-versa.

Thus, `WASM` (short for "Web Assembly") comes into the picture.
`WASM` can be thought of as a generic assembly language that can be sent over to *any* client that has a `WASM Virtual Machine` (hereby referred to as the `WVM`).
That client, upon receiving some `WASM` code, can then run that code through their `WVM`.
Internally, the `WVM` will translate that `WASM` into its own native, platform-dependent assembly code.

Thus, `WASM` (and by extension, the `WVM`) can enable cross-platform development of applications.

### WebGPU

`WebGPU` paints a similar picture to `WASM`.
It aims to be a portable, cross-platform API into whatever physical GPU is actually available on that device.

Similar to CPUs, GPUs also have a platform-dependent API.
For example, Apple silicon dedicated GPUs will have a different API than Intel Integrated-GPU chipsets.
Those APIs will also then differ from dedicated NVIDIA GPU APIs, and so on and so forth.

`WebGPU` provides a solution to this segmentation problem by providing a common API into the GPU.
The common API allows for end-developers to program for some generic GPU in a platform-agnostic way.

*If you're curious about `WebGPU` and its current day applications, you can read more about [Google Chrome integrating it into their browser](https://developer.chrome.com/docs/web-platform/webgpu).
Firefox, at this time of writing, also ships with `WebGPU` support, but only on their [nightly and developer releases](https://www.mozilla.org/en-US/firefox/channel/desktop).*

<br>

# Asdf

<br>
<br>
<br>

[^1]:
It's close (i.e., almost a 1:1 correspondence to a binary executable), but not exactly the same.
One still needs to further compile assembly down to the final binary executable prior to running it.
This is because assembly languages can support higher-level constructs (i.e., labels, constants, comments, etc.) which a plain old binary executable does *not*.
Thus, these constructs need to be further operated on prior to being run.
