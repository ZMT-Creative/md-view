# ZMT Creative LLC Development Notes

This file is used to document the working changes, things I've removed and things I've
tested (with indications of whether they worked or not so I don't repeat myself later by
trying again on something that won't work :smiley:)

## Merges with Original (c3er/mdview)

- **2025-06-26** - Merged `c3er/mdview` branch `content-blocking-memory` _(as of commit 3ff68b5 on 2025-06-22)_ with current code. All tests passed.

## Added `markdown-it-attrs` support

This allows using markdown codes like this: `{.my-custom-class}` OR `{label=hello}`

More info here: [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs)

> [!SUCCESS]

Adjusting the built-in `highlight.js` support in `markdown-it` was easy (once I learned how to create
a custom `md.renderer.rules.fence` function). The original code by Christian was already
using the built-in `highlight` function to handle `mermaid` but I modified the function call
and created a modified function for handling `code fences` to allow customized styles
and attributes to be used in Markdown documents.

This modified `md.renderer.rules.fence` function was needed so both `mermaid` would continue
to work properly and allow `markdown-it-attrs` to be installed and used.

> [!NOTE]
> In it's original form, Christian's code would allow `mermaid` to work correctly, but
> it would ignore any `markdown-it-attrs` text (e.g., `{.my-custom-class}`) with
> code fences.

## Enabled `markdown-it-header-sections` support

This wraps each header (i.e., h1, h2, h3, h4, h5, h6) in a `<section></section>` element. Unlike
the standard `<h[1-6]>` elements, which are standalone text blocks, the `<section>` element wraps
everything contained in a header level with this tag. This means that a top-level `<section>` tag
will contain the `<h1></h1>` tag and **all** lower-level `<h?>` tags. This creates a hierarchy that
makes CSS styling easier for each section level.

For example, using the following Markdown text:

```markdown
# Document Title
Intro Text
## Section 1
Section One Text
### Section 1.1
Section One.One Text
## Section 2
Section Two Text
```

Will now be rendered as:

```html
<section id="document-title" tabindex="-1">
  <h1 tabindex="-1">Document Title</h1>
  <p>Intro Text</p>
  <section id="section-1" tabindex="-1">
    <h2 tabindex="-1">Section 1</h2>
    <p>Section One Text</p>
    <section id="section-1.1" tabindex="-1">
      <h3 tabindex="-1">Section 1.1</h3>
      <p>Section One.One Text</p>
    </section>
  </section>
  <section id="section-2" tabindex="-1">
    <h2 tabindex="-1">Section 2</h2>
    <p>Section Two Text</p>
  </section>
</section>
```

## Enabled `markdown-it-obsidian-callouts` support

This provides GitHub/Obsidian-style Callouts.

More info here: [markdown-it-obsidian-callouts](https://www.npmjs.com/package/markdown-it-obsidian-callouts)

> [!SUCCESS]

I modified the original DEFAULT_OBSIDIAN_ICONS Constant (see code fence below) to customize the allowable
Callout types/icons. These Callout tags should be the first item after the `>` (blockquote) markdown:

```md
> [!NOTE]
> This is a note callout
```

> [!NOTE]
> This is a note callout

You can also create a custom title for the callout using an existing callout tag to specify
the icon to use:

```md
> [!TLDR] TL;DR
> Too Long, Didn't Read
```

> [!TLDR] TL;DR
> Too Long, Didn't Read

### Valid Built-in Callouts

| Icon                         | Callout Tags                            |
| :--------------------------: | :-------------------------------------- |
| ![BUG][ICON-BUG]             | `[!BUG]`                                |
| ![DANGER][ICON-DANGER]       | `[!DANGER]`, `[!CAUTION]`, `[!ERROR]`   |
| ![EXAMPLE][ICON-EXAMPLE]     | `[!EXAMPLE]`                            |
| ![FAILURE][ICON-FAILURE]     | `[!FAILURE]`, `[!FAIL]`, `[!MISSING]`   |
| ![IMPORTANT][ICON-IMPORTANT] | `[!IMPORTANT]`                          |
| ![NOTE][ICON-INFO]           | `[!INFO]`, `[!NOTE]`                    |
| ![QUESTION][ICON-QUESTION]   | `[!QUESTION]`, `[!FAQ]`, `[!HELP]`      |
| ![QUOTE][ICON-QUOTE]         | `[!QUOTE]`, `[!CITE]`                   |
| ![SCROLL][ICON-SCROLL]       | `[!SCROLL]`, `[!HISTORY]`, `[!TLDR]`    |
| ![SUCCESS][ICON-SUCCESS]     | `[!SUCCESS]`, `[!CHECK]`, `[!DONE]`     |
| ![SUMMARY][ICON-SUMMARY]     | `[!SUMMARY]`, `[!ABSTRACT]`             |
| ![TIP][ICON-TIP]             | `[!TIP]`, `[!HINT]`                     |
| ![TODO][ICON-TODO]           | `[!TODO]`                               |
| ![WARNING][ICON-WARNING]     | `[!WARNING]`, `[!ATTENTION]`, `[!WARN]` |

> [!CAUTION]
> For consistency with GitHub Alerts, the `[!CAUTION]` tag renders with the ![DANGER][ICON-DANGER] icon in a Red Callout box. Some other
> Callouts system might treat a `CAUTION` like a `WARNING` callout using the ![WARNING][ICON-WARNING] icon in a Yellow Callout box. You can
> mimic this style using the following markdown:
>
> ```md
> [!WARNING] CAUTION
> This is a caution callout using the Warning Icon instead of the Danger Icon
> ```
>

... which would render as seen below.

> [!WARNING] CAUTION
> This is a caution callout using the Warning Icon instead of the Danger Icon

### Code added to `app/lib/documentRenderingRenderer.js`

```js
// For: markdown-it-obsidian-callouts
// Added by ZMT Creative LLC to customize the Obsidian-style icons and Callouts
const DEFAULT_OBSIDIAN_ICONS = {
    bug: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bug-icon lucide-bug"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>',
    danger: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-octagon-alert-icon lucide-octagon-alert"><path d="M12 16h.01"/><path d="M12 8v4"/><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/></svg>',
    example: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-notebook-pen-icon lucide-notebook-pen"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg>',
    failure: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    important: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-warning-icon lucide-message-square-warning"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v2"/><path d="M12 13h.01"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    question: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-question-icon lucide-message-circle-question"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    quote: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote-icon lucide-quote"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>',
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>',
    summary: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>  ',
    tip: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb-icon lucide-lightbulb"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    todo: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-todo-icon lucide-list-todo"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    scroll: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text-icon lucide-scroll-text"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>',
}

DEFAULT_OBSIDIAN_ICONS.abstract = DEFAULT_OBSIDIAN_ICONS.summary
DEFAULT_OBSIDIAN_ICONS.attention = DEFAULT_OBSIDIAN_ICONS.warning
DEFAULT_OBSIDIAN_ICONS.caution = DEFAULT_OBSIDIAN_ICONS.danger
DEFAULT_OBSIDIAN_ICONS.check = DEFAULT_OBSIDIAN_ICONS.success
DEFAULT_OBSIDIAN_ICONS.cite = DEFAULT_OBSIDIAN_ICONS.quote
DEFAULT_OBSIDIAN_ICONS.done = DEFAULT_OBSIDIAN_ICONS.success
DEFAULT_OBSIDIAN_ICONS.error = DEFAULT_OBSIDIAN_ICONS.danger
DEFAULT_OBSIDIAN_ICONS.fail = DEFAULT_OBSIDIAN_ICONS.failure
DEFAULT_OBSIDIAN_ICONS.faq = DEFAULT_OBSIDIAN_ICONS.question
DEFAULT_OBSIDIAN_ICONS.help = DEFAULT_OBSIDIAN_ICONS.question
DEFAULT_OBSIDIAN_ICONS.hint = DEFAULT_OBSIDIAN_ICONS.tip
DEFAULT_OBSIDIAN_ICONS.history = DEFAULT_OBSIDIAN_ICONS.scroll
DEFAULT_OBSIDIAN_ICONS.missing = DEFAULT_OBSIDIAN_ICONS.failure
DEFAULT_OBSIDIAN_ICONS.note = DEFAULT_OBSIDIAN_ICONS.info
DEFAULT_OBSIDIAN_ICONS.tldr = DEFAULT_OBSIDIAN_ICONS.scroll
DEFAULT_OBSIDIAN_ICONS.warn = DEFAULT_OBSIDIAN_ICONS.warning

// End of markdown-it-obsidian-callouts customization

.
.
.

// Add the following code snippet to the 'markdown-it' initialization
// section later in the same file
        .use(require("markdown-it-obsidian-callouts"), {
            icons: DEFAULT_OBSIDIAN_ICONS,
        })
// End of snippet
```

## Tested `markdown-it-highlightjs`

Tested the `markdown-it-highlightjs` plugin, but found it didn't allow the necessary
custom code insertion to properly handle allowing the `mermaid` plugin to work.

> [!FAIL] Failed

## Testing Capturing FrontMatter

### Tested `markdown-it-front-matter`

Tested the `markdown-it-front-matter` plugin, but found that the overall application
program flow was not conducive to capturing and converting the frontmatter to accessible
options/variables.

> [!FAIL] Failed

### Tested `@mdit-vue/plugin-frontmatter`

Tested the `@mdit-vue/plugin-frontmatter` plugin, but found it's method of operation
was not readily compatible with the way `mdview` functions. Using this plugin would
also require too many complex changes to core code to work properly.

> [!FAIL] Failed

-----

<!-- LUCIDE ICONS -->

[ICON-BUG]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAcVJREFUSEu1lb0uBGEUhp+9CwUJiYQbsFEoKPUaFTolV4CKBEGlpFO4CBIFoVFSUSiUGgkV3s05kzPffjOza7MnmWbOz/ue36/FkKXVEP8KGAcWgNfEVv/PTD9RFacXgHngDbgDlgzo3QLOAtdGIIvRBCCWN8BoBUMBj9VVIQJ4OdJ0L435E7Bowdw2x146icpKBPgJCjm6vIQ++H+VTYHUl0jI/xex0wxksP0HvGPRo0NVJcTUgVet8UVmEcCVYnUOfAL7PU7xMfBh5OSyZjFKJfKxE2sXTcshcJABmgMmgV1gJOhLfUmnSCArwLo5bQJiVycbwBHwBeyF8nZ8qsbUG6sGxgW7N6R2QBQp2acNrwXwiUoJ9Pu/yEDMZjJ16BcghngA2h5g6AAp+aoe/LtEKYC2VOMal0g2OQDfH+2O5r8kuSlS4FNgOjMZOQDP9hE48QVzlBTA2UQW8XSkAHoP5OPiV8BPTWkP4gFTus/AhXnKUenHS7llZZTJ8p/tlIH5A9W5TzEDZ1PcEbuifppz2+zAfuwEqoyzx65qcvx8KEN938CtBSlKYehdW51m4Ok1nJ9atb/TXQ/OIEErfZve5IFBfwEAGm4Zea229gAAAABJRU5ErkJggg==
[ICON-DANGER]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAARpJREFUSEvllcsRwjAMRDdUQnpgOEMlkEoglQQqgTNNQCeQZaSMxz/ZYeBCLjCxvM9aK1KDLz9NRn8JYDeuHzMxDwAnAGcA/B88KQDF7xXJUXwbg8QArvhVNqZYjB0AbEQ8gPiAGnGFZiEuYI64CXEBT4m2bKmySwEHqRZL/Cbq6wTFtYvV1SmAFcPFNlVuIqhZWuVNPVZWq4ElG8mojvs/gHXJeveTlbUWlXaP3wNKy5QWLQCsjFSCDPRDe9duZnMJ4CLNj22+1zvgR8YF/lqQ3OFVfGrffrP7BOKKd2MWbDuItes5kKh4DMB3vl3RSSU++bNgOrn6mBuZmklJ7dPzQDyVgTtEOPT3klUMpEO/T50i13ZLTm7GvADKHlkZw+u32QAAAABJRU5ErkJggg==
[ICON-EXAMPLE]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAStJREFUSEvtVcERwjAMUzehQ8CbbgKTAJPAJsAXhqCbAOpFOTckbZK7/sind00sKZYdN1h4NQH+CsABwG6GtwewB3Az5xjDWO6d3LcPCa7foG3GpSwBRZ0jcUcShQQvAAzoAnUpTgtOUsZRIAm52pDg7TbC/zGCELx1h/ifQrkaAT0ArAOUJ4BNQvoUuNJFf7oaghxwpmu4UU2KVAgexPkm5fZ/MYHymwVub5DrAeuc5TeU4JRyeVfqgdJzcQBqyFFabGGUeqA+sRhDtZgSZRp9h5cS6DkgwN0BUb2W6l894U3O9WDuFflp1FIPqgkUWPJUxMiSN1ic4O9BMsWpPuA4VLfOVY72OWjY6aNHtHZkTpFSGAWOmUyr5wz9GAE7WmPT7+eMxtwURc99AFE+WjlPQCywAAAAAElFTkSuQmCC
[ICON-FAILURE]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAaJJREFUSEu9lU0rRVEUhp+b+w8UihRDI+WrGDBiQFEY+fgJDAwUY8rAgJ/gY4SiGDBiQPkqI0NKFMo/oJy31tKxu9e5Z7Dt0Tn7rL2etd61zl4FIq9Chv9qYALoB1qBOrN/Be6AE2Ab+Cjn5y/AEjAPVGUE8QWsAIul7EoBWoANoM0OHAC7wDnwZHuNSfTdwDgwbHu3wDRwnwaFADlX2vWADswBZxkZ9AKrFtCLyfkDCQE3ZqioRwGlX8mSjHuWjQJr90NpgDRfsMi7cjh3X4JcWoDLXhMHqFverKB9FchSLivJdWrB1aq7HDADrAGSZiQ4fWXvQ8C7PdckMhzac2dgv29SzQLrDpDxIDBpfZ0+I0BH8v0aEERL9r4XAuRjM/l+JHsHPFvnNAOPQUQerRzq59LST+dAz8qPNSXt+gCooxoc8Gn6F8sUV5BjcyxHAg2kJEvHpGLLnzqw+G+A6BJ5kaeArRJdlKfIuhzl41eRo7dp9B9NqkS9Klz2qJedINGva4eEA2cnuecvgoHTA4zlHTjpDo02MtOQqEO/kkmWafMNd66EGcD7eDsAAAAASUVORK5CYII=
[ICON-IMPORTANT]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAANFJREFUSEvNlVEKwjAQRF89id5B/Nab6EnEk+hN9NtL6E20U2pJQ9OEbhYMFApJ5u1O00mD82ic9QkBa+AMHA3QN/AALq2O3keAezu5N4iHWwU5xIAXoC40oQVLhvZLR9VvYsCnV7R+l5FOKFYCePZF7GbaMwFKivhvgLtFJSfLZJE7QBatgK3XKXIHuFuUAyjLlGlDSqT+ZGXK1RB+N+CUyiKF1FJxhZyeLklTACWpWh0SMefL3PyURVpfRTzVQTXxGPDzvbsoag3r5ZKtwx3wBZdVNRmbww7qAAAAAElFTkSuQmCC
[ICON-INFO]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAY5JREFUSEu1lU8rBlEUxn8v7zewoEixtFJEsWBlQ1FYvfgILCwUa8rCgo/gzwpFsbFiQRFlZUmJYuEbEPPkXI1p5s6d3uYup3vO7znPOXNuhZJPJSd/E1ADRoBuoMXuvwH3wBmwB3xk5fEBVoEloDFHxBewDqyk3UsDdAHbQI8FHAMHwCXwbN/aI/UDwDQwbt/ugDngIQ5KApRcZbcCClgELnIqGAI2TNCr2fkHSQJu7aJUTwIqP+TIxkOrRsJ6XVAcIM+XTXl/geQulyDXJnDN9cQBNC3v1tBhjy03QENcYaI82XVu4po1XQ4wD2wCsmbC40keQKFHZtUCsOUAJ8AoMGNzHeJ71h3l2AFOgTEHeLHJ6QSe6skOdETj+ghootoc4NP8r+Y0Vxbp9HlEqNnKpwmsFgV8W2LfBkgFhFoUAki1yDV5Ftj1lB8C0HJUjn9NDh3TEEDqmBb50XxNzvzRFFTqqnC2l7rsBCl9XTtI8sHZj/b8VeLBGQSmij448Qkt7cmMQ0p99Ovceb/hP2cqcBmOR46iAAAAAElFTkSuQmCC
[ICON-QUESTION]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAYxJREFUSEu1lcFVxDAMRLU0AvTAHagEqASoBKgEuNIEdAL7eRq/ia3kOYf1Jd5EnhmNZO0hTrwOJ8aPGYLHFHEfERe5/4mIj4jg+bwlcosA4KeJDCF5XSNaI3g5qkMxSwCfuVcWPBGh34gZsqkI3o/p3yR4eciyAvzOMh3iewKAIWA9ZOrseU9WAMp/1LLX9+rcUOTvBKGAt8VhLwngiCCWJVt5f6lAzwDPCWL5e1kGEIAsvCfehZAdsTxb9g4kBXSEgBysqUrLAFuoTVJwGrETyB733i3xvbLtxaiGjdgJfhMBpSpeReD3oxfjTfKPvZfAW7hXDx7+40TDriyie9QZfQb4i0rvnsq60iKpq5St1aISQH0ahmcwFGgW1eJUx7JN1Rl96znPV0ScRcRVQV6en7kHMwR+SRedtbfIlWs+eYf6iaDvX01JjWy6inENAN+IP8+bq3FdNocIfFDpwGyN+6G3OCcCjQl99D8ZCK9Ttf9lEvNmI70UJAJNQdLk0NaomM1sGMu7Ds4G/wHmgm4ZKglBSgAAAABJRU5ErkJggg==
[ICON-QUOTE]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAQ1JREFUSEvtldENwjAMRI9NYBOYBJgEmASYBDaBTYAnxdJhNWmEgB+wVFVpLz7Hjs8TfdgmH/YvJ5hK2kvizeN2lrSWdC0fu7FOgPNV40SHQgKkG+sEt+J8IYmIwyDFIRb4buwQwVBdwmEmGMX+CX4sRZfSYDNrqLiq+RZ1Y2uNRh8cH4Q0F5YJvNGa2JZUsJGmGyLIUlHF1sTu5cbKpx0imEs6lTpQD6Il5wgda7dRrBOgORtT0jh2OPE0dGOdIG4GEbpychpItg+x25Xwu7FjWhS3Jacn18gl/AlbIyAFyxI5m7OEO0ETW0tRFJJomGQ+H/jnKWpia0WmBjiPnOdB50VuYr869HOUb1nfAaJxcBnpSDEAAAAAAElFTkSuQmCC
[ICON-SUCCESS]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAXZJREFUSEu1lYFNQzEMRN1JaCeBTlI6SWES2AQ6SWES+l+U+zJu4p9PRSREC87d2T47G/vns1nA35rZoca8uNgvM+Pn08xeM4yM4DRd9KA9HIjee0QtAlS/TeqeKqIAvqtqvnPI7HkCJ54jLN3n9y4S8MeLk0oGaQkcAcReHOXbR4KPqpzgfVU8agMPzv2dT4vPvuZLzY+kTfBI8FNvHWvT7lKuy1JKs2jsnNogeld5JAAckjXqM3B6idijMsA5XKCxdN8fgvU/WTQDlxNLNUSg+vcImAk5C3LNSaukxCqDGwKsJZXKAkXKQitChMWK4YigmGikRAR6Er5nZmgSaMDYKTS6dX6tgMRlcmTButemLR4ZpjjSLyjtoDVWjQRSPw+xXwl+2NbuIRFJ/bwkPUH09hoSb4KyReMk9yxJueLgZWW52cK9B0e+lyUhOdcliFqs+BAenKZ1e2tZb/HIk4mI7sO0tPel9rEOmybYZ/bnR39wY+dhV6ltbRkum28yAAAAAElFTkSuQmCC
[ICON-SUMMARY]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAN9JREFUSEvllU0OwVAUhb/aA2P2gDE7YRWGYmgV7IQxi2DMIuiRPuG1V98dvEHjJU3a5vzcn6anIPMpWvSXwBboG7g7sAJ2lk6bwe2HeNCUySDVYAisgUVEsAp5fOCuwBHYlHzdv05MPJSgWUM1KQaBJpO5ZXAB1IUAAnpGJJ74qn5kGYSWQ8XeJcf82ohqAOdX/IcGJ6AHjKtR6XkSje0MTKt37hFlN3DuGHcH3TfIvoPsBt3fQbYO9BfdO9WVI8qTr5xJDRyPlwpTgY2JZkVmioGCRtc7zZoiM0XIhXkCm1RGGftoivMAAAAASUVORK5CYII=
[ICON-TIP]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAARlJREFUSEvVlGEOAUEMhZ+bcAh+cxKcBCfhJvzmENyEfEmbYNvORhAmmWyy2+nX99rZgT68Bj3yDyXNJU1tXySxD5I2rfMtAEm3koBEC9DSYGFABSD53k55tTyBsVemiJBZBqkAZ0u0syqjCoGszbJRFJAB/CAVU121UIlaQJ2eZAB8X1jlKKiWWxkWkwHcHmTTyGrRD+KJ69j0DgDwq1XQyZcB3Nd0Ou4kYSWWhsOQAfwQsoFkNmEPxfDkPnT6VY2pqwi9NQUek05bBfDmkSuqzlXyPR2G1q/i3qrnCfFJC63xHrUAxPm/6PnCZe8fRroPoHEN6s8/AThKGid1niRNKg19FHwc8P89QEFkU9N/DvbpwVcAL/fhBis1Phk2XVn/AAAAAElFTkSuQmCC
[ICON-TODO]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAMRJREFUSEvtlMENwjAQBCdFkDcUAe9QClVQA1VQCnlDE7yhCNAin2QsLDsXWUKIfKJE9sz51nZH46drzOe3BDvgACyStt2BPXD0tDNu0e0D3JiS9OHjDKwLsguw0ZhY8AiT0lzS/80FkzrlWcH3CmpDdq+gdpu6Q66trLmgtpDXuNJdtAwnWO/VJHLmUMUMgw/ACGznCk6AoAbS3SP41Vt92iIJDChoDu4OWdXbKiTPVe4WCDo71DSn0i7y5Po25y8otvAJFQQrGfJw+AoAAAAASUVORK5CYII=
[ICON-WARNING]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAATJJREFUSEu1lcsRwjAMRDdUAj0wnKETqASoBDqBM01AJ5DNeMFxJNsJE100BFtPn7XdYGZrZo6PMYALgC2AV+vvAM41ydUCjm2wUxKQv4uQGsASwDME3wXPavh9FSpyi6kB3EJr4oxVEVslqAkpAdhzAth3Zhsbq2IVh9ZfvRJKAAWx+q0qCGcV9APLAeIAyv4RImyCzyXQLfEA6WDZa9o7eO3bA+DAaebAPYA3xBTAwJYIvq2yAHH2aVYWgOsJMWVrAXIZWQBm68o2BeRkyUDpkIuyTQFFVbhH9ldFT7YxwJJlJp751yBBATxZplHYogWAtUMeyFaA2rulBBjIVgCpg0deh2pse7S+JxQB1LvZANaDMrUC7esuyFhFehI58H+N1zev8VFv8iRo6T2YFDTe9AElsFIZl9N6eAAAAABJRU5ErkJggg==
[ICON-SCROLL]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAOxJREFUSEvVlc0NwjAMRl9vjAFDgDjCJjAJYhLKJHCGIWAT4EN1haI4SUsrRC6t8uNnO/HnipFHNbJ9DDAFDsASmPSA3oEzsAf03w4DyPimh+HwiCDrGODRTGrRotFUaQp15tZ4P0sBzKABSwGyGT3jGRwcoPAUZjjMgQswj6xfgUUzn4xAF7yLQAYDhM4NnqKfA76+g1wEowNKijz5inIR/D/AqxMvMone8VVXtac1YT69Sk+l7q2spYCuhdfu9wDmsaRXGnWKSbHj/upzvwcYogElU2RNR9+YyuaebQ1su3SsnEF3vUvH6gV5AkkEPRloHM71AAAAAElFTkSuQmCC
