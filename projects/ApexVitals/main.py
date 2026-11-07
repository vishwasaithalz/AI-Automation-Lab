"""ApexVitals: offline route glyph inventory, srcset planning and precompression."""
import argparse
import gzip
import json
from pathlib import Path
from html.parser import HTMLParser

class Reader(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.excluded=0;self.text=[];self.images=0;self.images_missing_size=0
 def handle_starttag(self,tag,attrs):
  if tag in ("script","style","noscript"):self.excluded+=1
  if tag=="img":
   a=dict(attrs);self.images+=1
   if not a.get("width") or not a.get("height"):self.images_missing_size+=1
   if a.get("alt"):self.text.append(a["alt"])
 def handle_endtag(self,tag):
  if tag in ("script","style","noscript") and self.excluded:self.excluded-=1
 def handle_data(self,data):
  if not self.excluded:self.text.append(data)

def analyze(html):
 r=Reader();r.feed(html)
 glyphs="".join(sorted(set("".join(r.text))))
 return {"glyph_count":len(glyphs),"glyphs":glyphs,
         "images":r.images,"images_missing_size":r.images_missing_size}

def srcset_plan(stem,widths=(320,640,960)):
 if not stem or any(x.isspace() for x in stem):raise ValueError("Invalid stem")
 if not widths or any(type(w)!=int or w<1 for w in widths):raise ValueError("Invalid widths")
 return ", ".join(f"{stem}-{w}.avif {w}w" for w in sorted(set(widths)))

def compress(path):
 src=Path(path);content=src.read_bytes();out=Path(str(src)+".gz")
 out.write_bytes(gzip.compress(content,compresslevel=9,mtime=0))
 files=[str(out)]
 try:import brotli
 except ImportError:pass
 else:
  bro=Path(str(src)+".br");bro.write_bytes(brotli.compress(content,quality=11))
  files.append(str(bro))
 return files

if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("html_file");p.add_argument("--compress",action="store_true");a=p.parse_args()
 path=Path(a.html_file)
 print(json.dumps(analyze(path.read_text(encoding="utf-8")),indent=2))
 if a.compress:print(json.dumps({"created":compress(path)}))
