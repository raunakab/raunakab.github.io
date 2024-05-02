# Personal Website + Blog
Source code for my own website and blog.
Should act as a resume for potential recruiters/employers as well as a storage for ideas and posts.

Built using [`Zola`](https://www.getzola.org).
Based off of the [`hook`](https://www.getzola.org/themes/hook) theme.
Original license for `hook` is still maintained [here](./themes/hook/LICENSE).

## Structure
```
/
|- content
    # root
    |- _index.md

    # contains all blog posts
    |- blogs
        |- _index.md
        |- ${YYYY.MM.DD}-p{PART-1}.md
        |- ...
        |- ${YYYY.MM.DD}-p{PART-n}.md

|- themes
    |- hook
        |- ...
```
