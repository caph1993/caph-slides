from flexx import flx
from _dict import Dict
from widgets_std import MyWidget, HTMLPreview, FileInput
from widgets_cm import CodeEditor
from widgets_splitview import SHBox, SContent
import asyncio, os
from subprocess import run, DEVNULL
import tkinter as tk
from tkinter import filedialog


class MyApp_JS(MyWidget):
    CSS = '''
    body{
        background: #28282a;
        color: #fff;
    }
    iframe{
        background: #fff;
    }
    .flx-Button{
        background: #424242;
        color: #fff;
        border: none;
    }
    .flx-Button:hover {
        background-color: #888;
    }
    .flx-CodeEditor {
        height: 100%;
    }
    iframe.flx-HTMLPreview {
        min-width: 10vw;
    }
    .mono{
        font-family: monospace;
    }
    .small-padding{
        padding: 1em !important;
    }
    '''
    ready = flx.BoolProp(False)

    def init(self):
        global window
        super().init()
        self.buttons = {}
        with flx.VBox():
            self.buttons.source = flx.Button(css_class='mono')
            with SHBox(flex=1) as h:
                with SContent():
                    self.editor = CodeEditor(flex=1)
                with SContent():
                    with flx.VBox(css_class='small-padding'):
                        self.buttons.open_html = flx.Button(
                            text='View html')
                        self.buttons.open_pdf = flx.Button(
                            text='Printable html')
                        with flx.VBox(flex=1):
                            self.preview = HTMLPreview()
                h.split_children()
        self._init_ready()
        return

    async def _init_ready(self):
        while not self.editor or not self.preview:
            await self.sleep(50)
        self._mutate_ready(True)
        self._init_focus()
        return

    async def _init_focus(self):
        while self.document.hasFocus()==False:
            await self.sleep(50)
        self.editor.node.focus()
        return

    @flx.action
    def set_editor(self, text):
        self.editor.cm.setValue(text)

    @flx.reaction('editor.emit_hotkey')
    def on_hotkey(self, *events):
        self.emit_hotkey(events[-1])
    @flx.emitter
    def emit_hotkey(self, event):
        return dict(value=event.value)

    @flx.action
    def set_preview(self, content):
        iframe = self.preview.node
        href = iframe.contentWindow.location.href
        iframe.srcdoc = content
        self._set_preview(iframe, href)
        return

    async def _set_preview(self, iframe, href):
        if href=='about:srcdoc':
            iframe.contentWindow.location.reload()
        else:
            # Wait for reveal.js to reset to slide 0
            while href == iframe.contentWindow.location.href:
                await self.sleep(10)
            while href != iframe.contentWindow.location.href:
                iframe.contentWindow.location.href = href
                await self.sleep(10)
        return

    @flx.reaction('buttons.open_html.pointer_click')
    def _on_open_html(self):
        self.emit_button('open_html')
    @flx.reaction('buttons.open_pdf.pointer_click')
    def _on_open_pdf(self):
        self.emit_button('open_pdf')
    @flx.reaction('buttons.source.pointer_click')
    def _on_open_pdf(self):
        self.emit_button('source')

    @flx.emitter
    def emit_button(self, event):
        return dict(value=event)

    @flx.action
    def set_source(self, text):
        self.buttons.source.set_text(text)


class MyApp(flx.PyComponent):

    def init(self):
        self.ready = False
        self.fp = None
        self.js = MyApp_JS()
        asyncio.ensure_future(self._post_init())
        return

    async def _post_init(self):
        while not self.js.ready:
            await asyncio.sleep(50e-3)
        self.js.set_editor('Select a file to start')
        self.js.set_preview('<h1>🤪</h1>')
        self.js.set_source('Choose slides file...')
        return

    def set_source(self, fp):
        self.fp = fp
        with open(self.fp) as f:
            content = f.read()
        self.content = content
        self.js.set_preview(content)
        self.js.set_editor(content)
        self.js.set_source(fp)
        pass

    @flx.reaction('js.emit_button')
    def _on_button(self, *events):
        for ev in events:
            ev = ev.value
            if ev=='open_html':
                if self.fp:
                    fp = os.path.abspath(self.fp)
                    url = 'file://'+fp
                    run(['xdg-open', url],
                        stdout=DEVNULL, stderr=DEVNULL)
            elif ev=='open_pdf':
                if self.fp:
                    fp = os.path.abspath(self.fp)
                    url = 'file://'+fp+'?print-pdf'
                    run(['xdg-open', url],
                        stdout=DEVNULL, stderr=DEVNULL)
            elif ev=='source':
                root = tk.Tk()
                root.withdraw()
                file_path = filedialog.askopenfilename()
                if not isinstance(file_path, str):
                    pass
                elif file_path.endswith('.html'):
                    self.set_source(file_path)
        return

    @flx.reaction('js.emit_hotkey')
    def _on_hotkey(self, *events):
        event = flx.Dict(events[-1].value)
        key = event.key
        if key=='Ctrl-S':
            content = event.content
            assert content != None
            if self.fp != None:
                with open(self.fp, 'w') as f:
                    f.write(content)
                self.js.set_preview(content)
        return

def main():
    title = 'caph slides'
    icon = None
    app = flx.App(MyApp)
    #UI = app.launch('chrome-browser', title=title, icon=icon, windowmode='fullscreen')
    UI = app.launch('chrome-app', title=title, icon=icon, windowmode='fullscreen')
    flx.run()
    return

main()
