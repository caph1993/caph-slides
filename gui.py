from flexx import flx
from _dict import Dict
from widgets_std import MyWidget, HTMLPreview, FileInput
from widgets_cm import CodeEditor
import asyncio, os
from subprocess import run, DEVNULL


class MyApp_JS(MyWidget):
    CSS = '''
    .flx-CodeEditor {
        min-width: 40vw;
        height: 100%;
        width: 60vw;
        resize: horizontal;
        //overflow:auto;
        margin-right: 1vw;
        
    }
    iframe.flx-HTMLPreview {
        min-width: 10vw;
    }
    '''
    ready = flx.BoolProp(False)

    def init(self):
        global window
        super().init()
        self.buttons = {}
        with flx.HBox():
            with flx.VBox():
                self.editor = CodeEditor(flex=1)
            with flx.VBox():
                with flx.HBox():
                    flx.Label(text='Source:')
                    self.buttons.source = FileInput()
                self.preview = HTMLPreview()
                self.buttons.open_html = flx.Button(
                    text='Open html')
                self.buttons.open_pdf = flx.Button(
                    text='Open for pdf print')

        self._init_focus()
        self._init_ready()
        return

    async def _init_focus(self):
        while self.document.hasFocus()==False:
            await self.sleep(50)
        self.editor.node.focus()
        return

    async def _init_ready(self):
        while not self.editor or not self.preview:
            await self.sleep(50)
        self._init_focus()
        self._mutate_ready(True)
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
            print('done')

    @flx.reaction('buttons.open_html.pointer_click')
    def _on_open_html(self):
        self.emit_button('open_html')
    @flx.reaction('buttons.open_pdf.pointer_click')
    def _on_open_pdf(self):
        self.emit_button('open_pdf')

    @flx.emitter
    def emit_button(self, event):
        return dict(value=event)


class MyApp(flx.PyComponent):

    def init(self):
        self.ready = False
        self.fp = 'survey.html'
        self.js = MyApp_JS()
        asyncio.ensure_future(self._post_init())
        return

    async def _post_init(self):
        with open(self.fp) as f:
            content=f.read()
        while not self.js.ready:
            await asyncio.sleep(50e-3)
        self.js.set_preview(content)
        self.js.set_editor(content)
        self.content = content
        return

    @flx.reaction('js.emit_button')
    def _on_button(self, *events):
        for ev in events:
            ev = ev.value
            if ev=='open_html':
                fp = os.path.abspath(self.fp)
                url = 'file://'+fp
                run(['xdg-open', url], stdout=DEVNULL, stderr=DEVNULL)
            elif ev=='open_pdf':
                fp = os.path.abspath(self.fp)
                url = 'file://'+fp+'?print-pdf'
                run(['xdg-open', url], stdout=DEVNULL, stderr=DEVNULL)
            print(ev)
        return

    @flx.reaction('js.emit_hotkey')
    def _on_hotkey(self, *events):
        event = flx.Dict(events[-1].value)
        key = event.key
        if key=='Ctrl-S':
            content = event.content
            assert content != None
            with open(self.fp, 'w') as f:
                f.write(content)
            self.js.set_preview(content)
        return

def main():
    title = 'caph slides'
    icon = None
    app = flx.App(MyApp)
    #UI = app.launch('app', title=title, icon=icon)
    UI = app.launch('chrome-browser', title=title, icon=icon)
    flx.run()
    return

main()
