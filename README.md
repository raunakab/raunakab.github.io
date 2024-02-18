# Personal blog

My personal blog built with [Zola](https://www.getzola.org/), using the [Lightspeed](https://www.getzola.org/themes/lightspeed/) theme.

## Deployments

This project is deployed to GitHub Pages.
The CI/CD pipeline uses GitHub actions to build + deploy the built HTML/CSS/JS files to it.

The GitHub action:
1. checks out the recent version of master
2. builds the Zola project and places all output artifacts into the `/public` directory
3. pushes the contents of the `/public` directory to a new branch called `gh-pages`
4. deploys that branch to GitHub Pages where it can be accessed via pointing your browser to [https://raunakab.github.io](https://raunakab.github.io).

# Branches

Note that two branches should always be up.
The `master` branch functions as usual.
The `gh-pages` branch functions as the branch where the GitHub Action pushes all the most recently built artifacts to.
