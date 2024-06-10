+++
title = "Cross-Platform UI Rendering - (Part 1)"
date = 2024-06-10
+++

# Prelude

The UI rendering stack consists of a sequence of various pieces of software all working together to turn high-level declarative descriptions of a UI into the low-level CPU/GPU draw-calls which actually perform the data-writes to whatever screen-buffer(s) is(are) provided.

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
a simple `View` structure that contains two sub structures; one being a `Text` structure that contains the string `"Hello, world!"`, and the other being a pressable button which contains the string `"Click me!"`.
The button also contains the ability to run the code on `Line 7` when it is pressed.

This high-level description of a UI is the "high-level framework", `SwiftUI`, at play.
Next, this high-level description then needs to layout those structures somewhere within the canvas.
Finally, it then needs to call into the rendering engine to perform those low-level CPU/GPU draw calls that will eventually paint the appropriate pixels with the correct colors.
Additionally, in the case that any form of user/device/window event is registered, the IO engine should signal the high-level framework accordingly.
The high-level framework can then *redraw/update* those `View` and `Text` structures.

This is how those above 3 components of the UI stack all intermingle with one another.
You describe the layout in a high-level fashion, the high-level framework transforms that layout into low-level draw calls, and an IO-engine signals to the high-level framework when those structures need to be redrawn.

This stack exists in many forms for many different platforms.
The only problem is that these stacks are platform-dependent.
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

The only problem with these standards is that they're old and were designed for simple web *pages*, not web *apps*.
They were designed in a day and age when only simple pages of documents containing minimally styled text was the full extent of the internet.

<!-- The only problem with these standards is that they're largely designed -->
<!-- The only problem with the W3C standard is that it sucks. -->
<!-- It's an old standard. -->
<!-- And being old means that it was designed in a time when UI/UX research was a second-thought. -->
<!-- The early --> 


<!-- - They can then send that HTML source code over the network to any arbitrary client. -->
<!-- - And as long as that client has a browser that implements the W3C standard, they will be able to turn that HTML into a rendered output that can be viewed on a screen. -->

<!-- For example, the topmost `View` should go in the center of the canvas, and the `Text` structure should go within the center of that `View`. -->
<!-- This high-level description then needs to then be broken down into its individual CPU/GPU draw calls. -->
<!-- This high-level framework needs to then translate this high-level description into CPU/GPU draw calls. -->
<!-- Before I dive into the world of "cross-platform UI rendering", let me highlight the rough concept of what "rendering" is. -->
<!-- Rendering is the act of drawing objects to some physical screen. -->
<!-- This is how graphical user-interfaces (GUIs), terminal emulators, and just about anything that draws to a screen work. -->
<!-- You're probably reading this on a screen which has all of this text rendered onto it. -->
<!-- The core piece of software that performs this rendering is called a *rendering engine*. -->
<!-- A rendering engine provides a programmatic way of allowing end-users to issue the low-level draw calls. -->
<!-- For example, a rendering engine may expose some APIs such as: -->
<!-- ```python -->
<!-- rendering_engine = RenderingEngine() -->
<!-- rendering_engine.draw_line(from=[0.0, 0.0], to=[100.0, 100.0]) -->
<!-- rendering_engine.draw_triangle(point_a=[0.0, 0.0], point_b=[10.0, 0.0], point_c=[0.0, 10.0]) -->
<!-- ``` -->
<!-- Using these building blocks, you can eventually compound them into producing more complex objects, such as polygons, text, and, if you want, even human faces. -->
<!-- This is how high-level applications work. -->
<!-- They can describe high level UI components using some concise API, and those concise APIs will then eventually perform all of those low-level draw calls. -->
<!-- iPhone applications developed using SwiftUI all render objects and text and images internally using Apple's rendering engine. -->
<!-- Android applications developed using Kotlin all render objects and text and images internally using Google's rendering engine. -->
<!-- And similarly for all other devices and platforms. -->
<!-- The problem, however, is that these rendering engines are not interchangeable. -->
<!-- You can't run apps built using SwiftUI on an Android phone, and vice versa. -->
<!-- For that, you'll need a cross-platform rendering engine. -->
<!-- # Intro -->


<!-- You native Instagram application, for example, uses Apple's [`Metal` rendering engine]() to draw those pictures and texts and shapes and objects to the screen. -->
<!-- Rendering engines aren't exactly anything new. -->
<!-- Engineers and companies over the years have created some immensely powerful tools for frontend rendering. -->
<!-- The base starts with a rendering engine. -->
<!-- This is a piece of software which exposes APIs that allows end-users to issue "draw-calls" either to the CPU or the GPU. -->
<!-- The only problem, however, is that often times these rendering engines are not cross-platform. -->
<!-- Frontend rendering is a segmented field. -->
<!-- To be fair, there are millions of tools and frameworks out there, but a large majority of them are *non-cross-platform*. -->
<!-- The rendering logic for an application written in Swift for iOS *cannot* be ported over to generate an Android application. -->
<!-- You will need to re-write your rendering logic for your Android application in Java/Kotlin. -->
<!-- This creates a duplication of logic written in two separate languages managed by, presumably, two separate teams. -->
<!-- There do exist some tools out there that bridge this gap, the most notable being [React Native](https://reactnative.dev). -->
<!-- React Native is a phenomenal tool and, especially aided by [Expo](https://expo.dev), it opens up quick and fast iteration by small teams to produce a *native* application available for both platforms *without* having two separate codebases. -->
<!-- This makes React Native especially appealing to startups; in fact, check out any startup's job listings and (if they're producing a native application), you will most likely see a listing for a React Native developer. -->
<!-- Another *more* notable cross-platform solution does exist, however. -->
<!-- HTML rendering engines (primarily found inside of internet browsers). -->
<!-- HTML sent across the wire to a client and rendered in an HTML-rendering-engine is essentially cross-platform. -->
<!-- The HTML-rendering-engine could be embedded inside of Safari running on a Mac or iPhone, or inside of Firefox running on a Linux PC, or inside of Edge running on a Windows. -->
<!-- The point is: HTML can be written once and be rendered on virtually any device that has a browser with an HTML-rendering-engine[^1]. -->
<!-- ## Limitations -->
<!-- The only catch here is that HTML was designed with a very basic function in mind: it was designed to render a simple web *page*. -->
<!-- Emphasis on the *page* here. -->
<!-- A web page is a simple thing. -->
<!-- It contains text and maybe a little bit of styling. -->
<!-- But other than that, *not much else*. -->
<!-- Most importantly, it does *not* contain animations, widgets, dynamic user-flows, etc. -->
<!-- Those extra features were products of time. -->
<!-- As we progressed in time and as UI/UX research flourished, the UI requirements of websites quickly scaled. -->
<!-- Now all of a sudden, companies needed fancy widgets on their landing page. -->
<!-- They needed animations and stylings. -->
<!-- To fulfil this rampant uptick in frontend complexity, the simple HTML spec was padded, the CSS spec was padded, and a Javascript runtime to dynamically modify the DOM was added. -->
<!-- But the underlying smell still remained. -->
<!-- We've taken a technology that at its heart was designed for rendering simple web pages and augmented it past recognition. -->
<!-- The modern day HTML and CSS spec is a mess. -->
<!-- ## Solution -->
<!-- Over the past couple of years, some phenomenal new technologies have been on the rise. -->
<!-- Two of which have especially piqued my interest: [WASM](https://webassembly.org) and [WebGPU](https://www.w3.org/TR/webgpu). -->
<!-- I think (in my admittedly naive perspective) that these two pieces of technology could solve the segmentation problem that we're seeing in frontend rendering, *without compromising on complexity*. -->
<!-- <br> -->
<!-- <br> -->
<!-- <br> -->
<!-- [^1] -->
<!-- This isn't strictly true. -->
<!-- It is possible to use *certain* HTML tags which are [not fully supported across all browsers and across all platforms and across all versions](https://caniuse.com). -->
<!-- This does mean that HTML is technically not fully cross-platform, *but given that most are supported in modern versions of modern browsers, it's cross-platform enough for the sake of this blog*. -->
