+++
title = "Cross-Platform UI Rendering - (Part 1)"
date = 2024-06-10
+++

# Prelude

The *UI rendering stack* consists of a set of various pieces of software all working together to turn high-level declarative descriptions of a UI into low-level CPU/GPU draw-calls which actually perform the data-writes to whatever screen-buffer(s) is(are) provided.

The canonical stack usually comprises of the following pieces of software (which may themselves be broken down into further libraries):
1. A high level framework providing concise APIs to draw UI elements (such as Views, ScrollViews, Tabs, Buttons, etc.).
2. A rendering engine, capable of drawing primitive shapes (such as triangles and lines) using various color-brushes (solid, linear gradients, radial gradients, etc.).
3. An IO engine that registers user events, device events, window events, etc., and notifies the appropriate subscribers that said event has occurred.

For example, consider this excerpt of Swift code using [`SwiftUI`](https://developer.apple.com/xcode/swiftui):

```swift,linenos
import SwiftUI

struct ContentView: View {
  var body: some View {
    Text("Hello, world!")
    Button("Click me!") {
      // Code inside of this block is run whenever the button is pressed
    }
  }
}
```

In this (purposefully limited) example, we can see a high-level description of what the UI should look like:
a simple `View` structure that contains two sub structures; one being a `Text` structure that contains the string `"Hello, world!"`, and the other a `Button` structure which contains the string `"Click me!"` and is pressable.
The `Button` structure also has the added feature of being able to run some logic only when it is pressed.

This high-level description of a UI is the "high-level framework", `SwiftUI`, at play.
Once it is being run, it will need to do a couple of things.
Firstly, it will need to layout those structures somewhere within the canvas (i.e., find each of their positionings, heights, and widths).
Secondly, it will then need to call into the rendering engine to perform those low-level CPU/GPU draw calls that will eventually paint the appropriate pixels with the correct colors.
And finally, in the case that any form of user/device/window event is registered, the IO engine will need to send a signal to the high-level framework notifying it of what has happened.
The high-level framework can then *redraw/update* those `View`, `Text`, and `Button` structures accordingly.

This is how those above 3 components of the UI stack all intermingle with one another.
You describe some structures in a high-level fashion, the high-level framework lays out those structure and transforms that layout into low-level draw calls, and then an IO-engine signals to the high-level framework when those structures need to be redrawn.

This stack exists in many forms for many different platforms.
The only problem is that these stacks are **platform-dependent**.
You can't run applications developed using the `SwiftUI` stack on an Android phone.

For that, you'll need a *cross-platform UI stack*.

<br>

# Intro

Cross-platform UI rendering technically isn't novel.
Interestingly enough, one of the most widely distributed standards in the world (if not *the* most), pertains to cross-platform UI rendering in and of itself.
In fact, you're probably using that global standard right now to view this article: the W3C specification.

Without getting too bogged down in the details, the W3C specification is a worldwide standard that provides a detailed description on how HTML+CSS *should* be rendered.
It contains other topics as well, such as the ECMAScript language standard, but the primary goal of that standard is to unify the rendering of HTML+CSS.

*That* is how you're viewing this article:
- Some developer writes some HTML source code
- Your browser, upon navigating to that developer's website, requests that HTML source code and downloads it
- Your browser then takes that downloaded HTML and (using the guidelines provided by the W3C standard) turns it into a *rendered output on your screen*

Now here's the beauty in all of that:
The W3C standard is *platform agnostic!*
That means that it wasn't designed to only run on iPhones or Androids.
Nor was it designed to only run on MacBooks or Linux PCs.
It was designed to be flexible enough that any platform could implement an HTML+CSS rendering engine and render any HTML source code.
The end result is that you can write some generic HTML code, give it to a random group of people, and (without knowing what devices they're all using) have that HTML source code be rendered very similarly across all of their various devices.

That is as close to true cross-platform UI rendering as one can be.
Yes, sometimes there can be discrepancies, but for mainly all intents and purposes, those discrepancies are somewhat uncommon to run into.

So for our purposes, we will consider it to be a truly cross-platform UI rendering solution.

But here are where the problems start.

<br>

# Old Technologies in a New Era

The W3C standard is old.
It was originally concepted in 1994.
Even though it has gone through *numerous* iterations and has been steadily modernizing to keep up with the high-quality UI/UX features that consumers expect nowadays, the original "stink" still remains.

The W3C standard defines HTML specification.
The HTML specification was created to define web *pages* - not web *apps*.
Those two things are **PHENOMENALLY** different from one another.
Here's an example of a web page and a web app.
Try to see if you can intuitively feel the differences.

1. [SCons doc site](https://scons.org/doc/production/HTML/scons-man.html) (web page)
2. [YouTube](https://youtube.com/) (web app)

The first one is a static site.
It doesn't have animations popping up or any dynamic motions in it.
What you see is what you get.
It's almost as if a real piece of paper became digitalized and found its way onto your screen.
That is a web *page*.

The other is a complex, dynamic experience that changes its content everytime you refresh the page.
When you hover on one of the thumbnails, it smoothly enlarges and starts autoplaying its contents.
The left side also contains a tab-bar with notifications and alerts that constantly update as new content is pumped out.
That is a web *app*.

The original W3C standard (designed in 1994, mind you) was designed to support the former: a simple web page.
There's nothing complex about it, because complex web apps were *not a thing back in the 1990s.*
The purpose of the HTML specification was for developers to send "static, digital pieces of paper" around to one another.

However, as time progressed and more complex UI/UX features were desired (i.e., animations), the W3C standard was updated.
One of those updates was the inclusion of ECMAScript: a scripting language that could run client-side to dynamically update the contents of the page, thereby making the page feel more ... *"app-like"*.

But even considering those updates, web apps still fail to be truly immersive applications.
There are still remnant artifacts of them being *web-rendered* applications that make them feel unnatural.
For example, navigate to the [YouTube](https://youtube.com) site, click on the top-left of your screen, and drag down to the bottom-left.
You'll notice that this highlights all of the text **and** the thumbnails!
This is a feature that *must* be included according to the W3C standard, but it doesn't make any sense for thumbnails to be highlight-able.

<br>

So what's my point here?
Well:
1. Most pieces of software nowadays require an application.
2. The most convenient way to make an application that *everyone* (not just iPhone users or Android users) can use is to make a web app.
3. But web apps suck. Most consumers largely prefer to use native applications instead.
4. Native applications are *not* cross platform! If you want to build a native iOS application, it will *not* run on Android phones! That means you need to develop a whole other native application for Androids! Which then means two separate development teams creating two separate applications that do essentially the same thing![^1]. And that's also forgetting macOS, Windows, and Linux apps...

<br>

# Solution

There do exist *some* tools out there which provide a "pseudo" cross-platform rendering experience.
The most notable here would be [`React Native`](https://reactnative.dev)[^2].
However, there are some limitations with React Native.
Namely, it cannot compile applications to WASM and distribute them across the web in a platform agnostic manner (since the core of React Native must link to a specific platform's native component library first, which cannot be included in a WASM executable).

So what do we do?

Well... I think we'll need to reinvent (or better yet, *redesign*) the wheel here.
I think a potential solution exists in understanding how UI stacks are *distributed* to end-clients in the first place.
And for that, our very next step will be to explore the offerings of [`WASM`](https://webassembly.org) and [`WebGPU`](https://www.w3.org/TR/webgpu).

<br>

*This is the first post in a series.
Future posts will soon come.*

<br>
<br>
<br>

[^1]:
There are ways of reducing the duplication of logic.
It is possible to write the core business logic in a library which can then be integrated into the platform-dependent native applications individually (for example, by compiling the library down to a shared-object and dynamically linking to its symbols during runtime).
However, the *rendering logic* will still need to be duplicated.

[^2]: The reason why I say React Native provides a "somewhat" cross-platform experience is because it technically just links to the native components provided by that platform's native component library which are rendered by that platform's native rendering engine.
I.e., it doesn't define a new component library rendered via *truly* cross-platform rendering engine.
This technically means that you can observe divergent behaviours across various platforms.
However, to the end-developer, those differences are rarely encountered, so React Native can be considered cross-platform enough for us.
