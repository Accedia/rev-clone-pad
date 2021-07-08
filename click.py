import pyautogui
import json
from pynput.mouse import Listener
from pywinauto import application
import pyperclip as pc
import time
import win32gui, win32con

cords = {"x": [], "y" : []}

with open('genforget.json') as f:
    data = json.load(f)

Minimize = win32gui.GetForegroundWindow()
win32gui.ShowWindow(Minimize, win32con.SW_MINIMIZE)
# app = application.Application()
# app.connect(path=r"C:\Program Files\Microsoft Office\root\Office16\EXCEL.EXE").XLMAIN.set_focus().maximize()

def on_click(x, y, button, pressed):
    if pressed:
        cords["x"].append(x)
        cords["y"].append(y)
        listener.stop()

for i in range(1,len(data['genforget'][1]) + 3):
    with Listener(on_click = on_click) as listener:
        listener.join()
print(cords)
y = cords["y"][len(cords["y"])-3]
time.sleep(2)

backup = pc.paste()
for value in data['genforget']:
    for i, value1 in enumerate(value.items()):
        if value1[1] != None:
            print(value1[1])
            x = cords["x"][i]
            pc.copy(value1[1])
            pyautogui.click(x,y)
            pyautogui.write(value1[1])
            # pyautogui.hotkey('ctrl','v')

    y += 40
pc.copy(backup)
