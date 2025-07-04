const assert = require("assert")
const path = require("path")

const lodashClonedeep = require("lodash.clonedeep")

const common = require("../app/lib/common")

const DEFAULT_THEME = "system"

const _electronIpcEvent = {}

const _defaultHtmlElement = {
    attributes: [],
    checked: false,
    classList: {
        add() {},
        remove() {},
    },
    hidden: false,
    innerHTML: "",
    innerText: "",
    returnValue: null,
    style: {
        display: "invalid-value",
    },
    value: "",
    addEventListener() {},
    close() {},
    focus() {},
    onauxclick() {},
    onclick() {},
    removeAttribute() {},
    setAttribute() {},
    setSelectionRange() {},
    show() {},
    showModal() {},
}
let _htmlElement = null

class Event {
    preventDefaultIsCalled = false
    dataTransfer = {
        files: [],
    }

    preventDefault() {
        this.preventDefaultIsCalled = true
    }

    static withFile(filePath) {
        const event = new Event()
        event.dataTransfer.files.push({ path: filePath })
        return event
    }
}

class Process {
    exitCalled = false
    exitCode = 0

    exit(code) {
        this.exitCalled = true
        this.exitCode = code
    }
}

class WebRequestChannel {
    constructor() {
        this.clear()
    }

    clear() {
        this._callback = () => {}
        this._assertionCallback = () => {}
    }

    send(details, callback) {
        this._callback(details, callback)
        this._assertionCallback(details, callback)
    }

    register(callback) {
        this._callback = callback
    }

    registerAssertion(callback) {
        this._assertionCallback = callback
    }
}

class IpcChannel {
    _targetCallbacks = []
    _sourceAssertionCallbacks = []
    _targetAssertionCallbacks = []

    send(event, ...args) {
        for (const callback of this._targetCallbacks) {
            callback(event, ...args)
        }
        for (const callback of this._sourceAssertionCallbacks) {
            callback(event, ...args)
        }
        for (const callback of this._targetAssertionCallbacks) {
            callback(event, ...args)
        }
    }

    addTarget(callback) {
        this._targetCallbacks.push(callback)
    }

    addSourceAssertion(callback) {
        this._sourceAssertionCallbacks.push(callback)
    }

    addTargetAssertion(callback) {
        this._targetAssertionCallbacks.push(callback)
    }
}

class IpcChannelCollection {
    _data = {}

    name = ""

    constructor(name) {
        this.name = name
    }

    addTarget(message, callback) {
        this._addCallback(message, callback, channel => channel.addTarget(callback))
    }

    addSourceAssertion(message, callback) {
        this._addCallback(message, callback, channel => channel.addSourceAssertion(callback))
    }

    addTargetAssertion(message, callback) {
        this._addCallback(message, callback, channel => channel.addTargetAssertion(callback))
    }

    send(message, event, ...args) {
        if (!Object.hasOwn(this._data, message)) {
            assert.fail(`Message "${message}" is not registered in channel "${this.name}"`)
        }
        this._data[message].send(event, ...args)
    }

    clear() {
        this._data = {}
    }

    _addCallback(message, callback, addMethod) {
        if (Object.hasOwn(this._data, message)) {
            addMethod(this._data[message], callback)
        } else {
            const channel = new IpcChannel()
            addMethod(channel, callback)
            this._data[message] = channel
        }
    }
}

const _webRequestChannel = new WebRequestChannel()
const _webRequestRedirectChannel = new WebRequestChannel()

const _ipcToMainChannels = new IpcChannelCollection("to-main-channel")
const _ipcTorendererChannels = new IpcChannelCollection("to-renderer-channel")

const _electronDefault = {
    ipcMain: {
        on(message, callback) {
            _ipcToMainChannels.addTarget(message, callback)
        },
    },
    ipcRenderer: {
        on(message, callback) {
            _ipcTorendererChannels.addTarget(message, callback)
        },
        send(message, ...args) {
            _ipcToMainChannels.send(message, _electronIpcEvent, ...args)
        },
    },
    nativeTheme: {
        themeSource: DEFAULT_THEME,
    },
    session: {
        defaultSession: {
            webRequest: {
                onBeforeRequest(callback) {
                    _webRequestChannel.register(callback)
                },
                onBeforeRedirect(callback) {
                    _webRequestRedirectChannel.register(callback)
                },
            },
        },
    },
    dialog: {
        showErrorBox() {},
    },
    screen: {
        getPrimaryDisplay() {
            return {
                size: {
                    width: 1000,
                    height: 1000,
                },
            }
        },
    },
}

function loadHtmlElement() {
    if (_htmlElement) {
        return _htmlElement
    }
    const element = lodashClonedeep(_defaultHtmlElement)
    element.children = [lodashClonedeep(_defaultHtmlElement)]
    return element
}

function resetElectron() {
    exports.electron = lodashClonedeep(_electronDefault)
}

exports.DEFAULT_THEME = DEFAULT_THEME

exports.dataDir = path.join(__dirname, "data")

exports.elements = {
    mainMenu: {
        application: common.isMacOS()
            ? {
                  label: "md-view",
                  sub: {
                      about: {
                          label: "&About",
                      },
                      settings: {
                          label: "&Settings...",
                      },
                  },
              }
            : {},
        file: {
            label: "&File",
            sub: {
                open: {
                    label: "&Open",
                },
                print: {
                    label: "&Print",
                },
                recentFiles: {
                    label: "Recent Files",
                },
                clearRecentFiles: {
                    label: "Clear Recent Files List",
                },
                quit: !common.isMacOS()
                    ? {
                          label: "&Quit",
                      }
                    : {},
            },
        },
        edit: {
            label: "&Edit",
            sub: {
                copy: {
                    label: "Copy",
                },
                find: {
                    label: "&Find...",
                },
                findNext: {
                    label: "Find &next",
                    isEnabled: false,
                },
                findPrevious: {
                    label: "Find &previous",
                    isEnabled: false,
                },
                settings: {
                    label: "&Settings...",
                },
            },
        },
        view: {
            label: "&View",
            sub: {
                back: {
                    label: "&Back",
                    isEnabled: false,
                },
                forward: {
                    label: "&Forward",
                    isEnabled: false,
                },
                refresh: {
                    label: "&Refresh",
                },
                unblock: {
                    label: "&Unblock All External Content",
                },
                rawText: {
                    label: "&View Raw Text",
                },
                toc: {
                    label: "Table Of &Content",
                    sub: {
                        tocApplication: {
                            label: "Show For &All Documents",
                            isChecked: false,
                        },
                        tocDocument: {
                            label: "Show For &This Document",
                            isChecked: false,
                        },
                        forgetDocumentToc: {
                            label: "Forget Document Override",
                            isEnabled: false,
                        },
                    },
                },
                zoom: {
                    label: "&Zoom",
                    sub: {
                        zoomIn: {
                            label: "Zoom &In",
                        },
                        zoomOut: {
                            label: "Zoom &Out",
                        },
                        resetZoom: {
                            label: "&Reset Zoom",
                        },
                    },
                },
            },
        },
        encoding: {
            label: "En&coding",
            sub: {},
        },
        tools: {
            label: "&Tools",
            sub: {
                developer: {
                    label: "&Developer Tools",
                },
                debug: {
                    label: "De&bug",
                    sub: {
                        throwException: {
                            label: "Throw e&xception",
                        },
                        showError: {
                            label: "Show &error dialog",
                        },
                        softReload: {
                            label: "Soft &reload",
                        },
                    },
                },
            },
        },
        help: !common.isMacOS()
            ? {
                  label: "&Help",
                  sub: {
                      about: {
                          label: "&About",
                      },
                  },
              }
            : {},
    },
    blockedContentArea: {
        path: "#blocked-content-info",
        textContainer: {
            path: "#blocked-content-info-text-container",
        },
        closeButton: {
            path: "#blocked-content-info-close-button",
        },
    },
    toc: {
        path: "nav#toc",
    },
    separator: {
        path: "#separator",
    },
    content: {
        path: "article#content-body",
    },
    rawText: {
        path: "#raw-text",
    },
    settingsDialog: {
        path: "#settings-dialog",
        applicationSettingsTab: {
            path: "#application-settings-tab",
        },
        documentSettingsTab: {
            path: "#document-settings-tab",
        },
        applicationSettings: {
            path: "#application-settings-tab-content",
            systemThemeRadioButton: {
                path: "#system-theme",
            },
            lightThemeRadioButton: {
                path: "#system-theme",
            },
            darkThemeRadioButton: {
                path: "#dark-theme",
            },
            hideMetadataCheckbox: {
                path: "#hide-metadata",
            },
        },
        documentSettings: {
            path: "#document-settings-tab-content",
            renderFileAsMarkdownCheckbox: {
                path: "#render-doc-as-markdown",
            },
        },
        okButton: {
            path: "#settings-ok-button",
        },
        applyButton: {
            path: "#settings-apply-button",
        },
    },
    searchDialog: {
        path: "#search-dialog",
        inputField: {
            path: "#search-input",
        },
        okButton: {
            path: "#search-ok-button",
        },
        cancelButton: {
            path: "#search-cancel-button",
        },
    },
    dragDropDialog: {
        path: "#drag-drop-dialog",
        openInCurrentWindowButton: {
            path: "#drag-drop-open-in-current-window",
        },
        dontAskAgainCheckbox: {
            path: "#drag-drop-remember",
        },
    },
    aboutDialog: {
        path: "#about-dialog",
        copyInfoButton: {
            path: "#copy-about-info-button",
        },
        okButton: {
            path: "#about-ok-button",
        },
    },
    errorDialog: {
        path: "#error-dialog",
        content: {
            path: "#error-dialog-content",
        },
        okButton: {
            path: "#error-ok-button",
        },
    },
}

exports.mainWindow = {
    webContents: {
        send(message, ...args) {
            _ipcTorendererChannels.send(message, _electronIpcEvent, ...args)
        },
    },
}

exports.mainMenu = {
    getMenuItemById(id) {
        return {
            id: id,
            enabled: true,
        }
    },
}

exports.document = {
    body: {
        style: {
            marginTop: 0,
        },
    },
    documentElement: {
        scrollTop: 0,
    },
    getElementById() {
        return loadHtmlElement()
    },
    getElementsByClassName() {
        return [loadHtmlElement()]
    },
    getElementsByTagName() {
        return [loadHtmlElement()]
    },
    querySelector() {
        return loadHtmlElement()
    },
    querySelectorAll() {
        return [loadHtmlElement()]
    },
}

exports.window = {
    getComputedStyle() {
        return {
            height: 0,
        }
    },
    ResizeObserver: class {
        observe() {}
    },
}

exports.createEvent = () => new Event()

exports.createEventWithFile = Event.withFile

exports.createProcess = () => new Process()

exports.loadHtmlElement = loadHtmlElement

exports.registerHtmlElement = element => (_htmlElement = element)

exports.resetHtmlElement = () => (_htmlElement = null)

exports.resetElectron = resetElectron

exports.register = {
    ipc: {
        mainOn(message, callback) {
            _ipcToMainChannels.addTargetAssertion(message, callback ?? (() => {}))
        },
        rendererOn(message, callback) {
            _ipcTorendererChannels.addTargetAssertion(message, callback ?? (() => {}))
        },
        rendererSend(message, callback) {
            _ipcToMainChannels.addSourceAssertion(message, callback ?? (() => {}))
        },
        webContentsSend(message, callback) {
            _ipcTorendererChannels.addSourceAssertion(message, callback ?? (() => {}))
        },
    },
    webRequest: {
        onBeforeRequest(callback) {
            _webRequestChannel.registerAssertion(callback)
        },
        onBeforeRedirect(callback) {
            _webRequestRedirectChannel.registerAssertion(callback)
        },
    },
}

exports.send = {
    ipc: {
        toMain(message, event, ...args) {
            _ipcToMainChannels.send(message, event, ...args)
        },
        toRenderer(message, event, ...args) {
            _ipcTorendererChannels.send(message, event, ...args)
        },
    },
    webRequest: {
        beforeRequest(details, callback) {
            _webRequestChannel.send(details, callback)
        },
        beforeRedirect(details) {
            _webRequestRedirectChannel.send(details)
        },
    },
}

exports.clear = () => {
    _webRequestChannel.clear()
    _webRequestRedirectChannel.clear()
    _ipcToMainChannels.clear()
    _ipcTorendererChannels.clear()
}

resetElectron()
