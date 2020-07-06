from flexx import flx
import os

HERE = os.path.dirname(__file__)

def imports():
    sources = {
        'codemirror.min.css': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/codemirror.min.css',
            'local': ('assets_js', 'codemirror.min.css'),
        },
        'codemirror.min.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/codemirror.min.js',
            'local': ('assets_js', 'codemirror.min.js'),
        },
        'sublime.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/keymap/sublime.js',
            'local': ('assets_js', 'sublime.js'),
        },
        'monokai.css': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/theme/monokai.css',
            'local': ('assets_js', 'monokai.css'),
        },
        'xml.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/mode/xml/xml.js',
            'local': ('assets_js', 'xml.js'),
        },
        'javascript.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/mode/javascript/javascript.js',
            'local': ('assets_js', 'javascript.js'),
        },
        'css.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/mode/css/css.js',
            'local': ('assets_js', 'css.js'),
        },
        'python.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/mode/python/python.js',
            'local': ('assets_js', 'python.js'),
        },
        'htmlmixed.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/mode/htmlmixed/htmlmixed.js',
            'local': ('assets_js', 'htmlmixed.js'),
        },
        'active-line.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/addon/selection/active-line.js',
            'local': ('assets_js', 'active-line.js'),
        },
        'matchbrackets.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/addon/edit/matchbrackets.js',
            'local': ('assets_js', 'matchbrackets.js'),
        },
        'foldcode.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/addon/fold/foldcode.js',
            'local': ('assets_js', 'foldcode.js'),
        },
        'xml-fold.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/addon/fold/xml-fold.js',
            'local': ('assets_js', 'xml-fold.js'),
        },
        'searchcursor.js': {
            'cdn': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/addon/search/searchcursor.js',
            'local': ('assets_js', 'searchcursor.js'),
        },
    }
    for key, value in sources.items():
        if 'local' in value:
            path = os.path.join(HERE, *value['local'])
            with open(path) as f:
                content = f.read()
            flx.assets.associate_asset(__name__, key, content)
        else:
            url = value['cdn']
            print('Pulling cdn: ', url)
            flx.assets.associate_asset(__name__, url)
    return

imports()

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
        global window, eval
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
                'Tab': self.better_tab,
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

    def better_tab(self, cm):
        if cm.somethingSelected():
            cm.indentSelection("add")
        elif cm.getOption("indentWithTabs"):
            cm.replaceSelection("\t")
        else:
            e = Array(cm.getOption("indentUnit") + 1).join(" ")
            cm.replaceSelection(e, "end", "+input")
        return

if __name__ == '__main__':
    flx.launch(CodeEditor, 'app')
    flx.run()
