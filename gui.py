from flexx import flx
from threading import Thread
#import httpwatcher
from caph_widgets import MyWidget, HTMLPreview
import asyncio


class MyApp_JS(MyWidget):
    CSS = '''
    '''
    ready = flx.BoolProp(False)

    def init(self):
        global window
        super().init()
        with flx.HBox():
            self.test=flx.Button(text='Reload')
            self.preview = HTMLPreview()
        self._init_ready()
        return

    def on_change_slide(self, event):
        print(event)
        self.slide = event.data

    async def _init_focus(self):
        while self.document.hasFocus()==False:
            await self.sleep(50)
        #self.wprompt.set_focus()
        return

    async def _init_ready(self):
        #while not self.month or not self.rows:
        #    await self.sleep(50)
        self._mutate_ready(True)
        return

    #@flx.reaction('wcalendar.header.children*.pointer_click')
    def _on_click(self, *events):
        e = events[-1]
        v = {'+':'+year', '-':'-year', '⭢':'+month',
            '⭠':'-month'}.get(e.source.text, None)
        if v: self.emit_calendar(v)
        return

    @flx.reaction('test.pointer_click')
    def _on_test(self):
        self.emit_test(None)

    @flx.action
    def set_preview(self, content):
        iframe = self.preview.node
        href = iframe.contentWindow.location.href
        iframe.srcdoc = content
        self._set_preview(iframe, href)
        return
    async def _set_preview(self, iframe, href):
        if '#' in href:
            # Wait for reveal.js to reset to slide 0
            while href == iframe.contentWindow.location.href:
                await self.sleep(10)
        while href != iframe.contentWindow.location.href:
            iframe.contentWindow.location.href = href
            await self.sleep(10)


    @flx.emitter
    def emit_test(self, event):
        return dict(value=event)


class MyApp(flx.PyComponent):

    def init(self):
        self.ready = False
        self.js = MyApp_JS()
        asyncio.ensure_future(self._post_init())
        return

    async def _post_init(self):
        with open('survey.html') as f:
            content=f.read()
        while not self.js.ready:
            await asyncio.sleep(50e-3)
        self.js.set_preview(content)
        self.content = content
        return

    @flx.reaction('js.emit_test')
    def _on_test(self, *events):
        content = self.content.replace('notions', 'notions*')
        self.js.set_preview(content)
        self.content = content
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
