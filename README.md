# Personal Website + Blog
Source code for my own website and blog.
Should act as a resume for potential recruiters/employers as well as a storage for ideas and posts.

Built using [`Zola`](https://www.getzola.org).
Based off of the [`hook`](https://www.getzola.org/themes/hook) theme.
Original license for `hook` is still maintained [here](./themes/hook/LICENSE).

## Structure
For future postings, the following structure should be observed.

```
/
|- content
    # root
    |- _index.md

    # contains all blog posts
    |- blogs
        |- _index.md
        |- 0-${BLOG_POST_NAME_0}.md
        |- ...
        |- ${n}-${BLOG_POST_NAME_n}.md

|- themes
    |- hook
        |- ...
```

where `n` is some natural number.

All content should be placed inside of [content/blogs](content/blog).
Follow the format for file names.
The initial verbiage on the landing page is located inside of [content/_index.md](content/_index.md).
