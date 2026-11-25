"""Use the unchanged onetake oracle with a Windows GPU browser in its probe."""
import sys
from pathlib import Path
import probe_windows
sys.modules['probe']=probe_windows
sys.path.insert(0,str(Path.home()/'.agents/skills/onetake/scripts'))
import verify_promo
class Tee:
    def __init__(self,*outputs):self.outputs=outputs
    def write(self,s):
        for out in self.outputs:out.write(s);out.flush()
    def flush(self):
        for out in self.outputs:out.flush()
with (Path(__file__).resolve().parent/'verification.txt').open('w',encoding='utf-8') as report:
    original=sys.stdout
    sys.stdout=Tee(original,report)
    try:verify_promo.main()
    finally:sys.stdout=original
