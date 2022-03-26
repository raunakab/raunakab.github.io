+++
title = "Raestro v0.3.0"
date = 2022-03-24

[taxonomies]
categories = ["embedded"]

[extra]
repo_path = "BEARUBC/raestro"
+++

A lightweight software interface written in Rust for the Micro-Maestro (6-channel) Servo Motor Controller.

<!-- more -->

{{ img(path="./micro-maestro.jpg", alt="") }}

### Description
`raestro` is a high-level library exposing an API to easily control the Pololu `micro-maestro 6-channel servo motor controller`.

The `micro-maestro` is, in essence, a board which can convert high-level messages implementing a protocol specification into analog signals and send them down a channel to a specific, connected servo motor.
It eases up the controlling logic of controlling multiple servo motors at once; the board can abstract many of those details away.

<!-- The catch, however, is that some client needs to be able to implement the protocol correctly in order to communicate with the `maestro`.
If you find yourself without a client, you are out of luck.
As I will shortly explain, this is the exact situation myself and my embedded team over at UBC Bionics found ourselves in. -->

<!-- `raestro` is just a client correctly implementing the protocol specification. -->
`raestro` is just a client which allows one to easily communicate with the `maestro` using the `rust` programming language.
More formally, it is a correct implementation of the client-side of the `pololu protocol`.

It allows for one to write code like this:

```rust
let mut maestro: Maestro = Maestro::new();
maestro.start(BaudRates::BR_115200).unwrap();

let channel: Channels = Channels::C_0;

let speed0 = 10u16;
let speed1 = 140u16;

let target_min = 3968u16;
let target_max = 8000u16;

let sleep_time = Duration::from_millis(1000u64);

loop {
    maestro.set_speed(channel, speed0).unwrap();
    maestro.set_target(channel, target_min).unwrap();
    thread::sleep(sleep_time);

    maestro.set_speed(channel, speed1).unwrap();
    maestro.set_target(channel, target_max).unwrap();
    thread::sleep(sleep_time);
}
```
and get a result like [this](https://drive.google.com/file/d/1EpPhS04D_GeyJOxh5xaBX24GbiYPdXZv/view?resourcekey).

### Motivation
The Raestro project was born out of necessity, as most software tools/libraries are.

In Jan 2021, the UBC Bionics Embedded Systems Team migrated over from `c++` to `rust`, on account of `rust`'s major safety guarantees.
`c++`, being as featureful as it is with regards to its ecosystem and mature developers, already contained a client.
Unfortunately, we could not have said the same thing for `rust` at the time.
`crates.io` contained no packages implementing a correct client-side for the `micro-maestro`.

Our team had options for our next step: either try to port over a `c++` implementation into a `rust` codebase (an option which proved to be more difficult said than done), or build our own client.

Given the nature of this article, you may have probably already guessed the outcome: we decided to build our own client.

We also appropriately named it `raestro`, serving as a portmanteau of `rust` and `maestro`.

<!-- ### Difficulties -->

### Technical Details
The `maestro` uses `UART` serial communication to interface with an external client.
In our case, the our client would be the `raspberry pi model 4`, situated on the bionic arm (and roughly `3 inches` away from the `maestro`, a detail which will be important when discussing latency in communication).

We connected the `rx` and `tx` pins of the `maestro` to the `tx` and `rx` pins of our on-board computer: the `raspberry pi 4`.
WIth the utilization of a `rust` software package named `rppal`, we sent digital messages implementing the `pololu protocol` specification across the channel to the `maestro`, where there the `maestro` would parse the message (using its own internal logic) and execute the corresponding action.

As per the `pololu protocol`, our client exposes APIs to set the position, speed, and acceleration of any servo amongst the 6 possibly connected servos.
It also exposes APIs to get any of this information regarding to a specific channel, as well as any errors that may have propagated during execution.

For sending and receiving data, we have a default buffer size of `512 bytes`.
As according to the `pololu protocol`'s specification, this is the largest message size that the `maestro` can receive/send.

Our APIs perform a blocking, timeout read while fetching data from the `maestro`.
Although this does block the current thread from execution, the `maestro` is simply connected and is located roughly `3 inches` away.
It is safe to say that we are not altogether too concerned with propagation delays.

### Open Sourcing
As many beginners in the software field, we tend to casually utilize and take for granted the legals rights given to us by Open Source Licensing.
With the creation and completion of this project, I was more than willing to release it as an open source software package, bound with the `MIT` and `Open BSD` licenses.

`raestro` serves as an important milestone in my software development career.
It marks my first semi-professionally developed open source project, complete with documentation and a dedicated index for it reserved in `crates.io`.

It also marks my first open source project to get `1` download.
It also marks my first open source project to surpass `100` downloads.

Although this pales in comparison to older, more veteran developers and software packages available in the `rust` registry, I still consider this a major milestone in my career.

### Final Note and the Future of `raestro`
`raestro` is still in development.
Although it is a *correct* implementation of the `pololu protocol`, it is by no means a *complete* implementation.
There are still many specifications which are yet to be implemented.

Furthermore, as with any software library, the API itself can be cleaned up.
I undertook the writing of this client a mere `2` months into my journey into `rust`.
I can safely say that I have vastly improved as a `rust` engineer, as well as an overall software developer since then (at the time of writing this post, I have been using `rust` for over `1` year now).

Our team plans on cleaning `raestro` up.
This includes automating the code formatting process, as opposed to manual formatting (`cargo fmt` was a feature I learned after the release of `raestro v0.3.0`).
We also want to bolster the error-handling mechanisms in the package (start using more `?`'s to handle errors where applicable).

### Links
You can easily find documentation and installation guidelines for `raestro` here:
1. [Cargo](https://crates.io/crates/raestro)
2. [Docs.rs](https://docs.rs/raestro/0.3.0/raestro/)

As always, the link to the GitHub can be found at the top of the page.
