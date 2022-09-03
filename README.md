# Stable Diffussion Buddy

Companion desktop app for the self-hosted M1 Mac version of [Stable Diffusion](https://github.com/magnusviri/stable-diffusion).

It is intended to be a lazier way to generate images, by allowing you to focus on writing prompts instead of messing with the command line.

![2022-09-03-sd-buddy-proto](https://user-images.githubusercontent.com/17433578/188289354-ccdbde4a-346d-403a-a5c2-f636aede5a3c.png)

Behind the scenes it executes this command in your local Stable Diffusion directory:

```shell
python scripts/txt2img.py \
  --prompt "a red juicy apple floating in outer space, like a planet" \
  --n_samples 1 --n_iter 1 --plms --ddim_steps 10
```

**Important Note 1** It's a WIP, so check back often. For now it's barely a step above running the command manually, but I have a lot of things in mind (see the [wishlist](#wishlist) below) that should make my life easier when generating images with Stable Diffusion.

**Important Note 2** This is a spur-of-the-moment, passion project that scratches my own itch. As a result, I feel zero pressure or desire to satisfy anyone else's wishlist. So if you feel it lacks anything YOU want, or I'm moving too slowly, go ahead and fork the repo and build your own thing.

## Stack

The app is built with:

* Back-end: [Tauri](https://tauri.app/)
* Front-end: [Svelte](https://svelte.dev/)
* UI: [Tailwind CSS](https://tailwindcss.com/)
* Various packages (check `package.json`)

## Prerequisites

* An M1 Mac.

* Follow this [excellent guide](https://replicate.com/blog/run-stable-diffusion-on-m1-mac) or this equally excellent [Twitter thread](https://twitter.com/levelsio/status/1565731907664478209) to install Stable Diffusion on your M1 Mac.

* Make sure the program runs without errors and it can generate images by running the above command manually, before using the app. *The app doesn't have a lot of error checking built in, so try not to abuse it 🙂*

## Download

Download the compiled app in `.app` or `.dmg` format from the [Releases](https://github.com/breadthe/sd-buddy/releases) page.

## Building the app

In addition to the above, if you want to build the Mac binary yourself, first install the [Tauri environment + CLI](https://tauri.app/v1/guides/getting-started/prerequisites) (it includes Rust), then clone this repo and run:

```shell
npm install

# dev mode
npm run dev

# build the production app
npm run build
```

## Features

The first publicly-available version is pretty thin on features. My goal was to provide a basic UI around the CLI command.

* <label><input type="checkbox" checked /> Register the location of the Stable Diffusion directory.</label>
* <label><input type="checkbox" checked /> Persist the Stable Diffusion directory once registered.</label>
* <label><input type="checkbox" checked /> Text box for **prompt**.</label>
* <label><input type="checkbox" checked /> Dropdown for **steps**.</label>
* <label><input type="checkbox" checked /> Display total duration at the end.</label>
* <label><input type="checkbox" checked /> Display the output of the command.</label>

[](#wishlist)
## Wishlist

I'll tackle these in whatever order I feel is a priority for how I use Stable Diffusion.

* Display a clickable link to the output folder.
* Custom steps, not just the 4 built-in ones.
* Persist each run on disk, with metadata such as steps, duration, link to the generated image, etc.
* Embed the metadata in the generated image, optionally.
* Display a thumbnail of the generated image on completion. This is a bit tricky because the command doesn't say the name of the image file, but I have a solution in mind.
* **Qualifiers**. You know, those image quality attributes that we like to tack on at the end (Ultra detailed, ultra realistic, photorealism, 8k, octane render, bla bla). I want to make them configurable separately from the **prompt** so that you can focus on the description, then just add previously saved qualifiers with a click.
* A gallery of generated images.
* Light/dark mode.
* UI improvements including a Help section.
* Configurable script parameters in addition to prompt and steps, including output folder.

In addition, I need to sort out various small details around developing with Tauri, such as global keyboard shortcuts for common actions such as quitting the app, enabling copy/paste in text boxes, and narrowing down the file/directory operations scope to the settings folder.

## Security FAQ

* **How secure is the app?** It is strictly a local app that doesn't communicate with the network. I've enabled the minimum necessary system APIs to allow it to function. Tauri disables all such APIs by default.
* **How do I know it's not communicating with the internet?** Use a network inspector tool to analyze the traffic.
* **How do I know it doesn't do nefarious things on my computer?** It's open source. Feel empowered to inspect the source code and build it yourself.

## Contributing

At this time **Stable Diffusion Buddy** is **not** open to contribution. You may create issues but there's absolutely no guarantee I will tackle or even glance at them.

## License

Until I find the appropriate license to attach, please consider and abide by the following terms of use.

**Stable Diffusion Buddy** is provided as-is without any guarantees. I assume no liabilities from any potential harm (physical, financial, or otherwise) from using it. In other words, *use at your own risk*.

**Stable Diffusion Buddy** is open source and free for *personal use*.

You may not use **Stable Diffusion Buddy** for *any* commercial purpose. That means you may not sell or profit in any way from the compiled app, from compiling the app yourself, from the source code, or a fork of it. The images generated by using this app do not fall under these limitations for obvious reasons.

Unless it's strictly for personal use (on your machine), when forking the source code and/or rebuilding the binary please provide attribution and a link to this repo in a README file.
