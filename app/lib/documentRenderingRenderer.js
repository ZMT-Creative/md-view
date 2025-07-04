const hljs = require("highlight.js")

const metadata = require("./metadataRenderer")
const toc = require("./tocRenderer")

let _markdown

let _shallRenderAsMarkdown = false
let _shallHideMetadata = false

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


// function generateCodeText(text, options = {}) {
//     options = {
//         isHighlighted: false,
//         ...options,
//     }

//     const preClass = options.isHighlighted ? `class="${options.isHighlighted ? "hljs" : ""}"` : ""
//     return `<pre ${preClass}><code>${text}</code></pre>`
// }

exports.reset = options => {
    _markdown = require("markdown-it")({

        // Modified by ZMT Creative LLC to support mermaid and markdown-it-attrs
        //   to properly work with code fences. Added custom md.renderer.rules.fence function
        //   (see later in this file).
        highlight: function (str, lang) {
            if (lang === "mermaid") {
                return `<pre class="mermaid">${str}</pre>`
            }
            else if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
                } catch (__) {}
            }

            return _markdown.utils.escapeHtml(str)
        },
        xhtmlOut: true,
        html: true,
        linkify: true,
        breaks: options.lineBreaksEnabled,
        typographer: options.typographyEnabled,
    })

    _markdown
        .use(require("markdown-it-anchor"), {
            callback(_, info) {
                toc.addHeader(info.title, info.slug)
            },
        })
        .use(require("markdown-it-table-of-contents"), {
            // eslint-disable-next-line no-magic-numbers
            includeLevel: [2, 3],
            containerHeaderHtml: '<hr/>',
            containerFooterHtml: '<hr/>',
        })
        .use(require("markdown-it-html5-embed"), {
            html5embed: {
                attributes: {
                    audio: "controls",
                    video: 'width="500" controls',
                },
            },
        })
        .use(require("markdown-it-multimd-table"), {
            headerless: true,
            multiline: true,
            rowspan: true,
        })
        .use(require("markdown-it-abbr"))
        .use(require("markdown-it-bracketed-spans"))
        .use(require("markdown-it-attrs"))
        .use(require("markdown-it-collapsible"))
        .use(require("markdown-it-header-sections"))
        .use(require("markdown-it-obsidian-callouts"), {
            icons: DEFAULT_OBSIDIAN_ICONS,
        })
        .use(require("markdown-it-container"), "error")
        .use(require("markdown-it-container"), "info")
        .use(require("markdown-it-container"), "warning")
        .use(require("markdown-it-container"), "flexrow")
        .use(require("markdown-it-container"), "flexcolumn")
        .use(require("markdown-it-container"), "flexcol")
        .use(require("markdown-it-deflist"))
        .use(require("markdown-it-footnote"))
        .use(require("markdown-it-ins"))
        .use(require("markdown-it-mark"))
        .use(require("markdown-it-new-katex"))
        .use(require("markdown-it-sub"))
        .use(require("markdown-it-sup"))
        .use(require("markdown-it-task-checkbox"), { disabled: false })
        .use(require("@djs-zmtc/markdown-it-fancy-lists").markdownItFancyListPlugin, {
            allowOrdinal: false,
            allowMultiLetter: true,
        })

    if (options.emojisEnabled) {
        _markdown.use(require("markdown-it-emoji/dist/markdown-it-emoji.js"))
    }

    // Modified by ZMT Creative LLC to support markdown-it-attrs to properly work with code fences
    _markdown.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx]
        const info = token.info ? _markdown.utils.unescapeAll(token.info).trim() : ''
        let langName = ''
        let langLongName = ''
        let langAttrs = ''

        if (info) {
            let matches = []
            const thisPattern = /\[([^\]]+)\]/
            matches = info.match(thisPattern)
            if ( Array.isArray(matches) && matches.length > 0 ) {
                langLongName = matches[1]
            } else {
                const arr = info.split(/(\s+)/g)
                langName = arr[0]
                langLongName = langName
                langAttrs = arr.slice(2).join('')
            }
        }

        if (langName && hljs.getLanguage(langName)) {
            langLongName = hljs.getLanguage(langName).name
        } else if (langName.length > 0) {
            let thisText = null
            const thisPattern = /\[([^]]+)\]/i
            thisText = langName.match(thisPattern)
            if ( thisText > 0 ) {
                langLongName = thisText[1]
            }
        }

        let highlighted
        if (options.highlight) {
            highlighted = options.highlight(token.content, langName, langAttrs) || _markdown.utils.escapeHtml(token.content)
        } else {
            highlighted = _markdown.utils.escapeHtml(token.content)
        }

        if (highlighted.indexOf('<pre') === 0) {
            return `${highlighted}\n`
        }

        // If language exists, inject class gently, without modifying original token.
        // May be, one day we will add .deepClone() for token and simplify this part, but
        // now we prefer to keep things local.
        const i = token.attrIndex('class')
        const codeAttrs = []
        const preAttrs = token.attrs ? token.attrs.slice() : []

        codeAttrs.push(['class', options.langPrefix + langName])
        if (i < 0 ) {
            preAttrs.push(['class', 'hljs'])
        } else {
            preAttrs[i] = preAttrs[i].slice()
            preAttrs[i][1] += ' hljs'
        }

        const t = token.attrIndex('language')
        if (t < 0 && langLongName) {
            langLongName = langLongName.replace(/,\s*/g, '/')
            preAttrs.push(['language', langLongName])
        }

        // Fake token just to render attributes
        const codeToken = {
            attrs: codeAttrs
        }
        const preToken = {
            attrs: preAttrs
        }



        if (info) {
            return `<pre${slf.renderAttrs(preToken)}><code${slf.renderAttrs(codeToken)}>${highlighted}</code></pre>\n`
        } else {
            return `<pre${slf.renderAttrs(preToken)}><code>${highlighted}</code></pre>\n`
        }
    }

    _shallRenderAsMarkdown = options.renderAsMarkdown
    _shallHideMetadata = options.hideMetadata
}

exports.renderContent = content =>
    _markdown.render(_shallHideMetadata ? metadata.hide(content) : metadata.render(content))

exports.shallRenderAsMarkdown = () => _shallRenderAsMarkdown
