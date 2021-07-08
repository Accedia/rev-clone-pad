from PyQt6 import QtCore, QtGui, QtWidgets

from PyQt6.QtWidgets import QApplication, QMainWindow,QFileDialog, QWidget, QMessageBox
import sys
import pyautogui
import json
from pynput.mouse import Listener
import pyperclip as pc
import time
import win32gui, win32con
import os

cords = {"x": [], "y" : []} #dictionary for storing the coordinates

def minimize_window(): #function that minimizes the window
    Minimize = win32gui.GetForegroundWindow()
    win32gui.ShowWindow(Minimize, win32con.SW_MINIMIZE)

class Ui_MainWindow(object): #class for building the GUI
    def setupUi(self, MainWindow): #function that creates the widgets for the GUI and their actions

        MainWindow.setObjectName("MainWindow")
        MainWindow.resize(532, 208)
        self.centralwidget = QtWidgets.QWidget(MainWindow)
        self.centralwidget.setObjectName("centralwidget")

        self.startButton = QtWidgets.QPushButton(self.centralwidget) #Creates the start button
        self.startButton.setGeometry(QtCore.QRect(210, 150, 120, 30))
        self.startButton.setObjectName("startButton")

        self.browseButton = QtWidgets.QPushButton(self.centralwidget) #Creates the browse for file button
        self.browseButton.setGeometry(QtCore.QRect(410, 60, 90, 30))
        self.browseButton.setObjectName("browseButton")

        self.pathText = QtWidgets.QLineEdit(self.centralwidget) #Creates the field text for files path
        self.pathText.setGeometry(QtCore.QRect(30, 60, 351, 31))
        self.pathText.setText("")
        self.pathText.setObjectName("pathText")

        MainWindow.setCentralWidget(self.centralwidget)
        self.statusbar = QtWidgets.QStatusBar(MainWindow)
        self.statusbar.setObjectName("statusbar")
        MainWindow.setStatusBar(self.statusbar)

        self.startButton.clicked.connect(self.button_Start)#Aciton for start button
        self.browseButton.clicked.connect(self.button_Browse)#Action for browse button

        self.retranslateUi(MainWindow)
        QtCore.QMetaObject.connectSlotsByName(MainWindow)

    def retranslateUi(self, MainWindow):
        _translate = QtCore.QCoreApplication.translate
        MainWindow.setWindowTitle(_translate("MainWindow", "Demo"))
        self.startButton.setText(_translate("MainWindow", "Start"))
        self.browseButton.setText(_translate("MainWindow", "Choose File"))

    def button_Start(self): #Action for the start button
        path = self.pathText.text() #String that stores the path from the text field (pathText)
        if self.is_validPath(path): #Checks if the path is valid and if it exists by given path from the upper line; calls the is_validPath fucntion
            try: #Checks if the path is a VALID JSON FILE
                genforget = self.gen_forget(path)#Opens the file from path and gets stored in a dictionary
                minimize_window()#Minimizes the window so we can start populating the coordinates and the table
                self.populate_cords(genforget)#Calls the fucntion that populats the cords dictionary; Click each column on the first row that you wish to populate and lastly one column from the last row
                self.populate_table(genforget)#Calls the funciton taht populats the table with data from the json file
            except Exception as e:
                self.show_popup("Please Select Valid JSON File")#Popup for when there isn't a valid json selected
        else:
            self.show_popup("Please Select A Valid File")#Popup for when there isn't a valid file or path selected

    def button_Browse(self):
        path = self.open_dialog_box()#Calls a dialog to select file from the window browser
        self.pathText.setText(path)#Stores the selected path in the textfield

    def open_dialog_box(self):#Function that calls the window browser
        file_filter = 'Data File (*.json)'
        fileName = QFileDialog.getOpenFileName(
            caption='Select Data File',
            directory=os.getcwd(),
            filter=file_filter,
            initialFilter='JSON File (*.json)'
        )
        return fileName[0]

    def gen_forget(self,path):#Funciton that opens the json file
        with open(path) as f:
            genforget = json.load(f)
        return genforget

    def populate_table(self,genforget):#Function that populate the table by clicking and pasting in the cell
        backup = pc.paste()
        y = cords["y"][len(cords["y"])-2]
        for value in genforget['genforget']:
            for i, value1 in enumerate(value.items()):
                if value1[1] != None:
                    x = cords["x"][i]
                    pc.copy(value1[1])
                    pyautogui.doubleClick(x,y)
                    pyautogui.hotkey('ctrl','v')
            y += 40
            if y >= cords["y"][-1]:
                y = cords["y"][len(cords["y"])-2]
                pyautogui.press("pgdn")
                time.sleep(1)
        pc.copy(backup)


    def populate_cords(self,genforget):#Function that populate the cord dictionary
        def on_click(x, y, button, pressed):
            if pressed:
                cords["x"].append(x)
                cords["y"].append(y)
                listener.stop()
        for i in range(1,len(genforget['genforget'][1]) + 2):
            with Listener(on_click = on_click) as listener:
                listener.join()
        time.sleep(2)

    def is_validPath(self, path):#Funciton that checks if a path is valid
        return os.path.exists(path)

    def show_popup(self,text):#Funciton that calls a popup for an error
        msg = QMessageBox()
        msg.setText(text)
        msg.setWindowTitle("Error")
        msg.setIcon(QMessageBox.Icon.Warning)
        msg.exec()

minimize_window()

if __name__ == "__main__":#runs the whole gui
    app = QtWidgets.QApplication(sys.argv)
    MainWindow = QtWidgets.QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(MainWindow)
    MainWindow.show()
    sys.exit(app.exec())
