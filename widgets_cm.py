from flexx import flx

base_url = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/'
assets = [
    '5.21.0/codemirror.min.css',
    '5.21.0/codemirror.min.js',
    '5.21.0/keymap/sublime.js',
    '5.21.0/mode/xml/xml.js',
    '5.21.0/mode/javascript/javascript.js',
    '5.21.0/mode/css/css.js',
    '5.21.0/mode/python/python.js',
    '5.21.0/mode/htmlmixed/htmlmixed.js',
    '5.21.0/theme/monokai.css',
    '5.21.0/addon/selection/active-line.js',
    '5.21.0/addon/edit/matchbrackets.js',
    '5.21.0/addon/fold/foldcode.js',
    '5.21.0/addon/fold/xml-fold.js',
    '5.21.0/addon/search/searchcursor.js',
]
for a in assets:
    flx.assets.associate_asset(__name__, base_url + a)


class CodeEditor(flx.Widget):
    """ A CodeEditor widget based on CodeMirror.
    """

    CSS = """
    .flx-CodeEditor > .CodeMirror {
        width: 100%;
        height: 100%;
    }
    """

    def init(self):
        global window
        def emitter(key):
            return lambda : self.emit_hotkey(key)
        # https://codemirror.net/doc/manual.html
        options = dict(
            value='',
            mode='htmlmixed',
            theme='monokai',
            autofocus=True,
            styleActiveLine=True,
            matchBrackets=True,
            indentUnit=2,
            smartIndent=True,
            lineWrapping=True,
            lineNumbers=True,
            firstLineNumber=1,
            readOnly=False,
            keyMap='sublime',
            extraKeys={
                'Ctrl-S': emitter('Ctrl-S'),
            }
        )
        self.cm = window.CodeMirror(self.node, options)

    @flx.reaction('size')
    def __on_size(self, events):
        self.cm.refresh()

    @flx.emitter
    def emit_hotkey(self, key):
        value = dict(key=key)
        if key=='Ctrl-S':
            value['content'] = self.cm.getValue()
        return dict(value=value)

if __name__ == '__main__':
    flx.launch(CodeEditor, 'app')
    flx.run()
