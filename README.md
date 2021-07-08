# fit-ccc-autofil
clickUI.py is main code with gui and more completed
click.py is main code without gui 
genforget.json is an example json to run the program 

This program fills table by clicking on the cells, then filling them by pasting the information 

When starting the program(clickUI.py), the ide/console minimizes. A window will open but not pop up, has to be popped up manually - preferably over the table to be filled.
The window has 2 buttons and a text field. Button 1(Choose File) opens a Windows dialog. That widow promtps you to choose a JSON file. When a file is chosen, the Text Field is filled
with the path of the file. You can put a custom path in this text field if it is a valid json file. 
Button 2(Start) starts what practically is in click.py. First it minimized the window, then prompts you to click all cells on the first row to get the x coordinates. Then when all are clicked
it will be asked to click a random cell from the bottommost row. That will get the y coordinate when to stop on the page and start the next. Then the program will fill all cells with the data from the json file.
