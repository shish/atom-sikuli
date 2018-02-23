
from sikuli import *

s = Screen()
match = s.find("1504123790458.png")
print("Found MagicPython at " + match)


s.click(Pattern("1504169483581.png").similarity(0.4).offset(5, 5))
